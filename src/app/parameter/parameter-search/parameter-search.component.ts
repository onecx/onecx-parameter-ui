import { Component, OnInit, ViewChild } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { combineLatest, catchError, finalize, map, tap, Observable, of } from 'rxjs'
import { Table } from 'primeng/table'

import { UserService } from '@onecx/angular-integration-interface'
import { Action, Column, PortalMessageService } from '@onecx/portal-integration-angular'

import {
  Parameter,
  ParameterSearchCriteria,
  ParametersAPIService,
  Product,
  ProductsAPIService
} from 'src/app/shared/generated'
import { limitText } from 'src/app/shared/utils'

export type ChangeMode = 'VIEW' | 'COPY' | 'CREATE' | 'EDIT'
type ExtendedColumn = Column & {
  hasFilter?: boolean
  isDate?: boolean
  isDropdown?: true
  css?: string
  limit?: boolean
  isObject?: boolean
}
type AllMetaData = {
  allProducts: Product[]
  usedProducts?: Product[]
}

@Component({
  selector: 'app-parameter-search',
  templateUrl: './parameter-search.component.html',
  styleUrls: ['./parameter-search.component.scss']
})
export class ParameterSearchComponent implements OnInit {
  @ViewChild('dataTable', { static: false }) dataTable: Table | undefined

  // dialog
  public loading = false
  public searching = false
  public exceptionKey: string | undefined = undefined
  public changeMode: ChangeMode = 'VIEW'
  public dateFormat: string
  public actions$: Observable<Action[]> | undefined
  public displayDetailDialog = false
  public displayDeleteDialog = false
  public displayHistoryDialog = false
  public usedProductsChanged = false

  // data
  public data$: Observable<Parameter[]> | undefined
  public metaData$!: Observable<AllMetaData> // collection of data used in UI
  public allProducts$!: Observable<Product[]> // getting data from bff endpoint
  public allUsedProducts$!: Observable<Product[]> // getting data from bff endpoint
  public criteria: ParameterSearchCriteria = {}
  public parameter: Parameter | undefined
  public limitText = limitText
  public filteredColumns: Column[] = []
  public columns: ExtendedColumn[] = [
    {
      field: 'productDisplayName',
      header: 'PRODUCT_NAME',
      active: true,
      translationPrefix: 'PARAMETER',
      limit: true
    },
    {
      field: 'applicationId',
      header: 'APP_ID',
      active: true,
      translationPrefix: 'PARAMETER',
      limit: true
    },
    {
      field: 'name',
      header: 'NAME',
      active: true,
      translationPrefix: 'PARAMETER',
      limit: true
    },
    {
      field: 'value',
      header: 'VALUE',
      active: true,
      translationPrefix: 'PARAMETER',
      limit: true
    },
    {
      field: 'importValue',
      header: 'IMPORT_VALUE',
      active: true,
      translationPrefix: 'PARAMETER',
      limit: true
    }
  ]

  constructor(
    private readonly user: UserService,
    private readonly messageService: PortalMessageService,
    private readonly translateService: TranslateService,
    private readonly parameterApi: ParametersAPIService,
    private readonly productsApi: ProductsAPIService
  ) {
    this.dateFormat = this.user.lang$.getValue() === 'de' ? 'dd.MM.yyyy HH:mm' : 'M/d/yy, h:mm a'
    this.filteredColumns = this.columns.filter((a) => a.active === true)
  }

  public ngOnInit(): void {
    this.prepareDataLoad()
    this.loadData()
    this.prepareActionButtons()
  }

  private prepareActionButtons(): void {
    this.actions$ = this.translateService.get(['ACTIONS.CREATE.LABEL', 'ACTIONS.CREATE.TOOLTIP']).pipe(
      map((data) => {
        return [
          {
            label: data['ACTIONS.CREATE.LABEL'],
            title: data['ACTIONS.CREATE.TOOLTIP'],
            actionCallback: () => this.onDetail('CREATE', undefined),
            icon: 'pi pi-plus',
            show: 'always',
            permission: 'PARAMETER#EDIT'
          }
        ]
      })
    )
  }

  /****************************************************************************
   *  UI Events
   */
  public onCriteriaReset(): void {
    this.criteria = {}
  }

  // CREATE, COPY, EDIT, VIEW
  public onDetail(mode: ChangeMode, item: Parameter | undefined, ev?: MouseEvent): void {
    ev?.stopPropagation()
    this.changeMode = mode
    this.parameter = item
    if (this.parameter && ['COPY', 'CREATE'].includes(mode)) this.parameter.id = undefined
    this.displayDetailDialog = true
    this.usedProductsChanged = false
  }
  public onCloseDetail(refresh: boolean): void {
    this.changeMode = 'VIEW'
    this.parameter = undefined
    this.displayDetailDialog = false
    this.displayDeleteDialog = false
    if (refresh) {
      this.onSearch({}, true)
      this.usedProductsChanged = true
    }
  }
  public onHistory(ev: MouseEvent, item: Parameter) {
    ev.stopPropagation()
    this.parameter = item
    this.displayHistoryDialog = true
  }
  public onCloseHistory() {
    this.displayHistoryDialog = false
  }

  public onDelete(ev: MouseEvent, item: Parameter): void {
    ev.stopPropagation()
    this.parameter = item
    this.displayDeleteDialog = true
    this.usedProductsChanged = false
  }
  // user confirmed deletion
  public onDeleteConfirmation(data: Parameter[]): void {
    if (this.parameter?.id) {
      this.parameterApi.deleteParameter({ id: this.parameter?.id }).subscribe({
        next: () => {
          this.messageService.success({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
          // remove item form data
          data = data?.filter((a) => a.name !== this.parameter?.name)
          // check remaing data if product still exists
          const d = data?.filter((d) => d.productName !== this.parameter?.productName)
          if (d?.length === 0) this.loadData()
          this.onCloseDetail(false)
        },
        error: (err) => {
          this.messageService.error({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
          console.error('deleteParameter', err)
        }
      })
    }
  }
  public onColumnsChange(activeIds: string[]) {
    this.filteredColumns = activeIds.map((id) => this.columns.find((col) => col.field === id)) as Column[]
  }

  public onFilterChange(event: string): void {
    this.dataTable?.filterGlobal(event, 'contains')
  }

  public getProductDisplayName(name: string | undefined, allProducts: Product[]): string | undefined {
    return allProducts.find((item) => item.productName === name)?.displayName ?? name
  }
  private sortProductsByDisplayName(a: Product, b: Product): number {
    return (a.displayName ? a.displayName.toUpperCase() : '').localeCompare(
      b.displayName ? b.displayName.toUpperCase() : ''
    )
  }

  /****************************************************************************
   *  SEARCHING
   *   1. Loading META DATA used to display drop down lists => products
   *   2. Trigger searching data
   */
  private prepareDataLoad(): void {
    // declare search for ALL products privided by bff
    this.allProducts$ = this.productsApi.searchAllAvailableProducts({ productStoreSearchCriteria: {} }).pipe(
      map((data) => {
        return data.stream ? data.stream.sort(this.sortProductsByDisplayName) : []
      }),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PRODUCTS'
        console.error('searchAllAvailableProducts', err)
        return of([] as Product[])
      })
    )
    // declare search for used products (used === assigned to data)
    this.allUsedProducts$ = this.parameterApi.getAllApplications().pipe(
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PRODUCTS'
        console.error('getAllApplications', err)
        return of([] as Product[])
      })
    )
  }
  // complete refresh: getting meta data and trigger search
  private loadData(): void {
    this.loading = true
    this.exceptionKey = undefined
    this.metaData$ = combineLatest([this.allProducts$, this.allUsedProducts$]).pipe(
      map(([aP, uP]: [Product[], Product[]]) => {
        // enrich
        if (uP.length > 0) {
          uP.forEach((p) => (p.displayName = this.getProductDisplayName(p.productName, aP)))
          uP.sort(this.sortProductsByDisplayName)
        }
        if (!this.exceptionKey) this.onSearch({})
        return { allProducts: aP, usedProducts: uP }
      }),
      finalize(() => (this.loading = false))
    )
  }

  /****************************************************************************
   *  SEARCH data
   */
  public onSearch(criteria: ParameterSearchCriteria, reuseCriteria = false): void {
    this.searching = true
    if (!reuseCriteria) this.criteria = { ...criteria }
    this.data$ = this.parameterApi.searchParametersByCriteria({ parameterSearchCriteria: { ...this.criteria } }).pipe(
      tap((data: any) => {
        if (data.totalElements === 0) {
          this.messageService.info({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.NO_RESULTS' })
          return data.size
        }
      }),
      map((data) => data.stream),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PARAMETERS'
        console.error('searchParametersByCriteria', err)
        return of([] as Parameter[])
      }),
      finalize(() => (this.searching = false))
    )
  }
}
