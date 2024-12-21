import { Component, OnInit, ViewChild } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { catchError, combineLatest, finalize, map, tap, Observable, of } from 'rxjs'
import { Table } from 'primeng/table'

import { UserService } from '@onecx/angular-integration-interface'
import { Action, Column, DataViewControlTranslations, PortalMessageService } from '@onecx/portal-integration-angular'

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
  isDropdown?: boolean
  limit?: boolean
  css?: string
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
  public filteredColumns: Column[] = []
  public limitText = limitText

  @ViewChild('dataTable', { static: false }) dataTable: Table | undefined
  public dataViewControlsTranslations: DataViewControlTranslations = {}

  // data
  public data$: Observable<Parameter[]> | undefined
  public metaData$!: Observable<AllMetaData> // collection of data used in UI
  public allProducts$!: Observable<Product[]> // getting data from bff endpoint
  public usedProducts$!: Observable<Product[]> // getting data from bff endpoint
  public criteria: ParameterSearchCriteria = {}
  public item4Detail: Parameter | undefined // used on detail
  public item4Delete: Parameter | undefined // used on deletion

  public columns: ExtendedColumn[] = [
    {
      field: 'productDisplayName',
      header: 'PRODUCT_NAME',
      active: true,
      translationPrefix: 'PARAMETER',
      limit: false
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
      header: 'COMBINED_NAME',
      active: true,
      translationPrefix: 'PARAMETER',
      limit: false
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
    private readonly msgService: PortalMessageService,
    private readonly translate: TranslateService,
    private readonly parameterApi: ParametersAPIService,
    private readonly productsApi: ProductsAPIService
  ) {
    this.dateFormat = this.user.lang$.getValue() === 'de' ? 'dd.MM.yyyy HH:mm' : 'M/d/yy, h:mm a'
    this.filteredColumns = this.columns.filter((a) => a.active === true)
  }

  public ngOnInit(): void {
    this.prepareDataLoad()
    this.loadData()
    this.prepareDialogTranslations()
    this.prepareActionButtons()
  }

  /**
   * Dialog preparation
   */
  private prepareDialogTranslations(): void {
    this.translate
      .get([
        'DIALOG.DATAVIEW.FILTER',
        'DIALOG.DATAVIEW.FILTER_BY',
        'PARAMETER.PRODUCT_NAME',
        'PARAMETER.APP_ID',
        'PARAMETER.NAME',
        'PARAMETER.DISPLAY_NAME'
      ])
      .pipe(
        map((data) => {
          this.dataViewControlsTranslations = {
            filterInputPlaceholder: data['DIALOG.DATAVIEW.FILTER'],
            filterInputTooltip:
              data['DIALOG.DATAVIEW.FILTER_BY'] +
              data['PARAMETER.PRODUCT_NAME'] +
              ', ' +
              data['PARAMETER.APP_ID'] +
              ', ' +
              data['PARAMETER.DISPLAY_NAME'] +
              ', ' +
              data['PARAMETER.NAME']
          }
        })
      )
      .subscribe()
  }
  private prepareActionButtons(): void {
    this.actions$ = this.translate.get(['ACTIONS.CREATE.LABEL', 'ACTIONS.CREATE.TOOLTIP']).pipe(
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

  // Detail => CREATE, COPY, EDIT, VIEW
  public onDetail(mode: ChangeMode, item: Parameter | undefined, ev?: Event): void {
    ev?.stopPropagation()
    this.changeMode = mode
    this.item4Detail = item // do not manipulate this item here
    this.displayDetailDialog = true
  }
  public onCloseDetail(refresh: boolean): void {
    this.item4Detail = undefined
    this.displayDetailDialog = false
    if (refresh) {
      this.loadData()
    }
  }

  // DELETE => Ask for confirmation
  public onDelete(ev: Event, item: Parameter): void {
    ev.stopPropagation()
    this.item4Delete = item
    this.displayDeleteDialog = true
  }
  // user confirmed deletion
  public onDeleteConfirmation(data: Parameter[]): void {
    if (this.item4Delete?.id) {
      this.parameterApi.deleteParameter({ id: this.item4Delete?.id }).subscribe({
        next: () => {
          this.msgService.success({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
          // remove item from data
          data = data?.filter((d) => d.id !== this.item4Delete?.id)
          // check remaing data if product still exists - if not then reload
          const d = data?.filter((d) => d.productName === this.item4Delete?.productName)
          this.item4Delete = undefined
          this.displayDeleteDialog = false
          if (d?.length === 0) this.loadData()
          else this.onSearch({}, true)
        },
        error: (err) => {
          this.msgService.error({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
          console.error('deleteParameter', err)
        }
      })
    }
  }

  // History => routing
  public onHistory(ev: Event, item: Parameter) {
    ev.stopPropagation()
    this.item4Detail = item
    this.displayHistoryDialog = true
  }
  public onCloseHistory() {
    this.displayHistoryDialog = false
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
    this.usedProducts$ = this.parameterApi.getAllApplications().pipe(
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
    this.metaData$ = combineLatest([this.allProducts$, this.usedProducts$]).pipe(
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
          this.msgService.info({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.NO_RESULTS' })
          return data.size
        }
      }),
      map((data) => data.stream),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PARAMETER'
        console.error('searchParametersByCriteria', err)
        return of([] as Parameter[])
      }),
      finalize(() => (this.searching = false))
    )
  }
}
