import { Component, OnInit, ViewChild } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Action, Column, PortalMessageService } from '@onecx/portal-integration-angular'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { Table } from 'primeng/table'
import { SelectItem } from 'primeng/api'
import { catchError, finalize, map, tap } from 'rxjs/operators'
import { combineLatest, Observable, of } from 'rxjs'

import {
  ApplicationParameter,
  ParameterSearchCriteria,
  ParametersAPIService,
  Product,
  ProductStorePageResult,
  ProductsAPIService
} from 'src/app/shared/generated'

import { dropDownSortItemsByLabel, limitText, getDisplayNameProduct } from 'src/app/shared/utils'

type ExtendedColumn = Column & {
  hasFilter?: boolean
  isDate?: boolean
  isDropdown?: true
  css?: string
  limit?: boolean
}
type ChangeMode = 'VIEW' | 'NEW' | 'EDIT'

@Component({
  selector: 'app-parameter-search',
  templateUrl: './parameter-search.component.html',
  styleUrls: ['./parameter-search.component.scss']
})
export class ParameterSearchComponent implements OnInit {
  @ViewChild('parameterTable', { static: false }) parameterTable: Table | undefined

  public actions$: Observable<Action[]> | undefined
  public parameter: ApplicationParameter | undefined
  public parameters: ApplicationParameter[] = []
  public criteria: ParameterSearchCriteria = {}
  public criteriaGroup!: UntypedFormGroup
  public results$: Observable<ApplicationParameter[]> | undefined
  public products$: Observable<ProductStorePageResult> | undefined
  public allProductNames$: Observable<SelectItem[]> | undefined

  public changeMode: ChangeMode = 'NEW'
  public displayDetailDialog = false
  public displayDeleteDialog = false
  public displayHistoryDialog = false
  public searching = false
  public usedProductsChanged = false

  public limitText = limitText

  public columns: ExtendedColumn[] = [
    {
      field: 'displayName',
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
      css: 'hidden xl:table-cell',
      limit: true
    },
    {
      field: 'key',
      header: 'KEY',
      active: true,
      translationPrefix: 'PARAMETER',
      css: 'hidden sm:table-cell',
      limit: true
    },
    {
      field: 'setValue',
      header: 'VALUE',
      active: true,
      translationPrefix: 'PARAMETER',
      css: 'hidden xl:table-cell',
      isDropdown: true,
      limit: true
    },
    {
      field: 'importValue',
      header: 'IMPORT_VALUE',
      active: true,
      translationPrefix: 'PARAMETER',
      css: 'hidden lg:table-cell',
      isDropdown: true
    },
    {
      field: 'description',
      header: 'DESCRIPTION',
      active: false,
      translationPrefix: 'PARAMETER',
      css: 'hidden lg:table-cell',
      isDropdown: true
    },
    {
      field: 'unit',
      header: 'UNIT',
      active: false,
      translationPrefix: 'PARAMETER',
      css: 'hidden lg:table-cell',
      isDropdown: true
    },
    {
      field: 'rangeFrom',
      header: 'RANGE_FROM',
      active: false,
      translationPrefix: 'PARAMETER',
      css: 'hidden lg:table-cell',
      isDropdown: true
    },
    {
      field: 'rangeTo',
      header: 'RANGE_TO',
      active: false,
      translationPrefix: 'PARAMETER',
      css: 'hidden lg:table-cell',
      isDropdown: true
    }
  ]

  public filteredColumns: Column[] = []

  constructor(
    private readonly messageService: PortalMessageService,
    private translateService: TranslateService,
    private readonly parametersApi: ParametersAPIService,
    private readonly productsApi: ProductsAPIService,
    private readonly fb: UntypedFormBuilder
  ) {}

  public ngOnInit(): void {
    this.search({})
    this.prepareActionButtons()
    this.initializeForm()
    this.getAllProductNames()
    this.filteredColumns = this.columns.filter((a) => {
      return a.active === true
    })
  }

  public search(criteria: ParameterSearchCriteria, reuseCriteria = false): void {
    this.searching = true
    if (!reuseCriteria) {
      this.criteria = { ...criteria }
    }
    this.results$ = combineLatest([
      this.parametersApi.searchApplicationParametersByCriteria({
        parameterSearchCriteria: { ...this.criteria }
      }),
      this.getAllProductNames()
    ]).pipe(
      finalize(() => (this.searching = false)),
      tap({
        next: (data: any) => {
          if (data.totalElements == 0) {
            this.messageService.info({
              summaryKey: 'SEARCH.MSG_NO_RESULTS'
            })
            return data.size
          }
        },
        error: () => {
          this.messageService.error({
            summaryKey: 'SEARCH.MSG_SEARCH_FAILED'
          })
        }
      }),
      map(([data, allProducts]) => {
        const products: Product[] = data.stream
        products.forEach((prod) => {
          if (prod.productName) {
            prod.displayName = getDisplayNameProduct(prod.productName, allProducts)
          }
        })
        return products
      })
    )
  }

  public onReset(): void {
    this.criteria = {}
    this.criteriaGroup.reset()
    this.criteriaGroup.controls['applicationId'].disable()
  }

  public onCreate() {
    this.changeMode = 'NEW'
    this.parameter = undefined
    this.displayDetailDialog = true
    this.usedProductsChanged = false
  }
  public onDetail(ev: MouseEvent, item: ApplicationParameter, mode: ChangeMode): void {
    ev.stopPropagation()
    this.changeMode = mode
    this.parameter = item
    this.displayDetailDialog = true
    this.usedProductsChanged = false
  }
  public onCloseDetail(refresh: boolean): void {
    this.displayDetailDialog = false
    if (refresh) {
      this.search({}, true)
      this.usedProductsChanged = true
    }
  }
  public onCopy(ev: MouseEvent, item: ApplicationParameter) {
    ev.stopPropagation()
    this.changeMode = 'NEW'
    this.parameter = item
    this.parameter.id = undefined
    this.displayDetailDialog = true
    this.usedProductsChanged = false
  }
  public onHistory(ev: MouseEvent, item: ApplicationParameter) {
    ev.stopPropagation()
    this.parameter = item
    this.displayHistoryDialog = true
  }
  public onCloseHistory() {
    this.displayHistoryDialog = false
  }
  public onDelete(ev: MouseEvent, item: ApplicationParameter): void {
    ev.stopPropagation()
    this.parameter = item
    this.displayDeleteDialog = true
    this.usedProductsChanged = false
  }
  public onDeleteConfirmation(): void {
    this.usedProductsChanged = false
    if (this.parameter?.id) {
      this.parametersApi.deleteParameter({ id: this.parameter?.id }).subscribe({
        next: () => {
          this.displayDeleteDialog = false
          this.parameters = this.parameters.filter((a) => a.key !== this.parameter?.key)
          this.parameter = undefined
          this.messageService.success({ summaryKey: 'ACTIONS.DELETE.MESSAGES.OK' })
          this.search({}, true)
          this.usedProductsChanged = true
        },
        error: () => this.messageService.error({ summaryKey: 'ACTIONS.DELETE.MESSAGES.NOK' })
      })
    }
  }
  public onColumnsChange(activeIds: string[]) {
    this.filteredColumns = activeIds.map((id) => this.columns.find((col) => col.field === id)) as Column[]
  }

  public onFilterChange(event: string): void {
    this.parameterTable?.filterGlobal(event, 'contains')
  }

  private prepareActionButtons(): void {
    this.actions$ = this.translateService.get(['ACTIONS.CREATE.LABEL', 'ACTIONS.CREATE.PARAMETER.TOOLTIP']).pipe(
      map((data) => {
        return [
          {
            label: data['ACTIONS.CREATE.LABEL'],
            title: data['ACTIONS.CREATE.PARAMETER.TOOLTIP'],
            actionCallback: () => this.onCreate(),
            icon: 'pi pi-plus',
            show: 'always',
            permission: 'PARAMETER#EDIT'
          }
        ]
      })
    )
  }

  private initializeForm(): void {
    this.criteriaGroup = this.fb.group({
      applicationId: null,
      productName: null,
      key: null
    })
    this.criteriaGroup.controls['applicationId'].disable()
  }

  // declare searching for ALL products
  private getAllProductNames(): Observable<SelectItem[]> {
    this.products$ = this.productsApi.searchAllAvailableProducts({ productStoreSearchCriteria: {} }).pipe(
      catchError((err) => {
        console.error('getAllProductNames():', err)
        return of([] as ProductStorePageResult)
      })
    )
    this.allProductNames$ = this.products$.pipe(
      map((data: ProductStorePageResult) => {
        const si: SelectItem[] = []
        if (data.stream) {
          for (const product of data.stream) {
            si.push({ label: product.displayName, value: product.productName })
          }
          si.sort(dropDownSortItemsByLabel)
        }
        return si
      })
    )
    return this.allProductNames$
  }
}
