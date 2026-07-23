import { Component, EventEmitter, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, catchError, combineLatest, finalize, map, tap, Observable, of, ReplaySubject } from 'rxjs'

import { PortalMessageService, UserService } from '@onecx/angular-integration-interface'
import {
  Action,
  ColumnType,
  DataSortDirection,
  DataTableColumn,
  Filter,
  OcxContentComponent,
  RowListGridData,
  Sort
} from '@onecx/angular-accelerator'
import { SlotService } from '@onecx/angular-remote-components'

import {
  Parameter,
  ParameterPageResult,
  ParameterSearchCriteria,
  ParametersAPIService,
  Product
} from 'src/app/shared/generated'
import { displayEqualityState, displayValue2, displayValueType, sortByDisplayName } from 'src/app/shared/utils'

export type ChangeMode = 'VIEW' | 'COPY' | 'CREATE' | 'EDIT'
type ExtendedColumn = Column & {
  hasFilter?: boolean
  isBoolean?: boolean
  isDate?: boolean
  isDuration?: boolean
  isText?: boolean
  isValue?: boolean
  frozen?: boolean
  css?: string
  sort?: boolean
}
export type ExtendedParameter = Parameter & {
  valueType: string
  importValueType: string
  displayValue: string
  isEqual: string
}
export type ParameterTableRow = ExtendedParameter & {
  imagePath: string
  [columnId: string]: unknown
}
export type ExtendedProduct = {
  name: string
  displayName: string
  applications: Array<ApplicationAbstract>
  undeployed?: boolean
}
type AllMetaData = {
  allProducts: ExtendedProduct[]
  usedProducts: ExtendedProduct[]
}
// DATA structures of product store response
export type ApplicationAbstract = {
  appName?: string
  appId?: string
  undeployed?: boolean
  deprecated?: boolean
}
export type ProductAbstract = {
  id?: string
  name: string
  version?: string
  description?: string
  imageUrl?: string
  displayName?: string
  classifications?: Array<string>
  undeployed?: boolean
  provider?: string
  applications?: Array<ApplicationAbstract>
}

@Component({
  selector: 'app-parameter-search',
  templateUrl: './parameter-search.component.html',
  styleUrls: ['./parameter-search.component.scss']
})
export class ParameterSearchComponent implements OnInit {
  // dialog
  public loading = false
  public exceptionKey: string | undefined = undefined
  public exceptionKeyMeta: string | undefined = undefined
  public changeMode: ChangeMode = 'VIEW'
  public dateFormat: string
  public refreshUsedProducts = false
  public displayDetailDialog = false
  public displayDeleteDialog = false
  public displayUsageDetailDialog = false
  public actions: Action[] = []

  public interactiveColumns: DataTableColumn[] = []
  public displayedColumnKeys: string[] = []
  public interactiveRows: ParameterTableRow[] = []
  private allRows: ParameterTableRow[] = []
  public filterText = ''
  public sortField = 'name'
  public sortDirection: DataSortDirection = DataSortDirection.NONE
  public tableFilters: Filter[] = []

  // data
  public criteria: ParameterSearchCriteria = {}
  public metaData$!: Observable<AllMetaData>
  public usedProducts$ = new ReplaySubject<Product[]>(1) // getting data from bff endpoint
  public itemId: string | undefined // used on detail
  public item4Detail: Parameter | undefined // used on detail
  public item4Delete: Parameter | undefined // used on deletion
  // slot configuration: get product infos via remote component
  public slotName = 'onecx-product-data'
  public isComponentDefined$: Observable<boolean> | undefined // check
  public productData$ = new BehaviorSubject<ProductAbstract[] | undefined>(undefined) // product infos
  public slotEmitter = new EventEmitter<ProductAbstract[]>()

  public columns: ExtendedColumn[] = [
    {
      field: 'name',
      header: 'COMBINED_NAME',
      translationPrefix: 'PARAMETER',
      active: true,
      frozen: true,
      sort: true,
      css: 'word-break-all'
    },
    {
      field: 'value',
      header: 'VALUE',
      translationPrefix: 'PARAMETER',
      active: true,
      isValue: true,
      css: 'text-center'
    },
    {
      field: 'valueType',
      header: 'VALUE.TYPE',
      translationPrefix: 'PARAMETER',
      active: true,
      css: 'text-center hidden lg:table-cell'
    },
    {
      field: 'equal',
      header: 'EQUAL',
      translationPrefix: 'PARAMETER',
      active: true,
      css: 'text-center hidden lg:table-cell'
    },
    {
      field: 'applicationId',
      header: 'PRODUCT_APP',
      translationPrefix: 'PARAMETER',
      active: true,
      sort: true
    },
    {
      field: 'operator',
      header: 'OPERATOR',
      active: true,
      translationPrefix: 'PARAMETER',
      isBoolean: true,
      css: 'text-center hidden lg:table-cell'
    },
    {
      field: 'modificationDate',
      header: 'MODIFICATION_DATE',
      translationPrefix: 'INTERNAL',
      active: true,
      sort: true,
      isDate: true,
      css: 'hidden lg:table-cell'
    }
  ]

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly user: UserService,
    private readonly slotService: SlotService,
    private readonly translate: TranslateService,
    private readonly msgService: PortalMessageService,
    private readonly parameterApi: ParametersAPIService
  ) {
    this.dateFormat = this.user.lang$.getValue() === 'de' ? 'dd.MM.yyyy HH:mm:ss' : 'M/d/yy, hh:mm:ss a'
    this.isComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.slotName)
    this.syncInteractiveColumns()
  }

  public ngOnInit(): void {
    this.slotEmitter.subscribe(this.productData$)
    this.onReload()
    this.getMetaData()
    this.preparePageActions()
  }

  private onReload(): void {
    this.getUsedProducts()
    this.onSearch({}, true)
  }
  public onGoToLatestUsagePage(): void {
    this.router.navigate(['./usage'], { relativeTo: this.route })
  }

  /****************************************************************************
   * GET DATA
   */
  // get used products (used === assigned to data)
  private getUsedProducts() {
    this.parameterApi
      .getAllProducts()
      .pipe(
        catchError((err) => {
          this.exceptionKeyMeta = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PRODUCTS'
          console.error('getAllProducts', err)
          return of([])
        })
      )
      .subscribe((v) => this.usedProducts$.next(v))
  }

  // combine used products with product info from product store
  private getMetaData() {
    this.exceptionKeyMeta = undefined
    // combine all product infos and used products to one meta data structure
    this.metaData$ = combineLatest([this.productData$, this.usedProducts$]).pipe(
      map(([aP, uP]: [ProductAbstract[] | undefined, Product[]]) => {
        return this.combineProducts(
          this.convertProductAbstract2ExtendedProduct(aP),
          this.convertProduct2ExtendedProduct(uP)
        )
      })
    )
  }
  /****************************************************************************
   * HELPER
   */
  // map:  ProductAbstract[] => ExtendedProduct[]
  private convertProductAbstract2ExtendedProduct(aP: ProductAbstract[] | undefined): ExtendedProduct[] {
    const aps: ExtendedProduct[] = []
    if (aP && aP.length > 0) {
      aP.forEach((p) =>
        aps.push({
          name: p.name,
          displayName: p.displayName ?? p.name,
          undeployed: p.undeployed,
          applications: p.applications ?? []
        })
      )
      aps.sort(sortByDisplayName)
    }
    return aps
  }
  // map:  Product[] => ExtendedProduct[]
  private convertProduct2ExtendedProduct(uP: Product[]): ExtendedProduct[] {
    const ups: ExtendedProduct[] = []
    uP.forEach((p) => {
      const apps: ApplicationAbstract[] = []
      p.applications?.forEach((s) => {
        apps.push({ appName: s, appId: s } as ApplicationAbstract)
      })
      ups.push({ name: p.productName, displayName: p.productName, applications: apps } as ExtendedProduct)
    })
    ups.sort(sortByDisplayName)
    return ups
  }

  private combineProducts(aP: ExtendedProduct[], uP: ExtendedProduct[]): AllMetaData {
    // convert/enrich used products if product data are available
    if (aP?.length > 0 && uP.length > 0) {
      uP.forEach((p) => {
        const pi = aP.find((ap) => ap.name === p.name) // get product data
        if (pi) {
          p.displayName = pi.displayName!
          p.undeployed = pi.undeployed
          // collect apps: only used
          const uApps: ApplicationAbstract[] = []
          p.applications?.forEach((papp) => {
            // app still exists?
            const app = pi.applications?.find((app) => app.appId === papp.appId)
            if (app) uApps.push(app)
          })
          p.applications = uApps
        }
      })
      uP.sort(sortByDisplayName)
    }
    // if service is not running or product data are not yet available
    if (aP.length === 0) aP = uP
    return { allProducts: aP, usedProducts: [...uP] } // meta data
  }

  /****************************************************************************
   *  SEARCH data
   */
  public onSearch(criteria: ParameterSearchCriteria, reuseCriteria = false): void {
    this.loading = true
    this.exceptionKey = undefined
    if (!reuseCriteria) this.criteria = { ...criteria }
    this.parameterApi
      .searchParametersByCriteria({ parameterSearchCriteria: { ...this.criteria } })
      .pipe(
        tap((data: any) => {
          if (data.totalElements === 0) {
            this.msgService.info({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.NO_RESULTS' })
            return data.size
          }
        }),
        map((data: ParameterPageResult) => {
          if (!data.stream) return [] as ParameterTableRow[]
          return data.stream.map(
            (p) =>
              ({
                ...p,
                displayName: p.displayName ?? p.name,
                valueType: displayValueType(p.value),
                importValueType: displayValueType(p.importValue),
                displayValue: displayValue2(p.value, p.importValue),
                isEqual: displayEqualityState(p.value, p.importValue),
                imagePath: ''
              }) as ParameterTableRow
          )
        }),
        catchError((err) => {
          this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PARAMETERS'
          console.error('searchParametersByCriteria', err)
          return of([] as ParameterTableRow[])
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((rows) => {
        this.allRows = rows
        this.applyFilterAndSort()
      })
  }

  /**
   * Dialog preparation
   */
  private preparePageActions(): void {
    this.actions = [
      {
        labelKey: 'ACTIONS.CREATE.LABEL',
        titleKey: 'ACTIONS.CREATE.TOOLTIP',
        actionCallback: () => this.onDetail('CREATE', undefined),
        icon: 'pi pi-plus',
        show: 'always',
        permission: 'PARAMETER#EDIT'
      },
      {
        labelKey: 'DIALOG.NAVIGATION.LATEST_USAGE.LABEL',
        titleKey: 'DIALOG.NAVIGATION.LATEST_USAGE.TOOLTIP',
        actionCallback: () => this.onGoToLatestUsagePage(),
        icon: 'pi pi-history',
        show: 'always',
        permission: 'USAGE#SEARCH'
      }
    ]
  }

  /****************************************************************************
   *  UI Events
   */
  public onCriteriaReset(): void {
    this.criteria = {}
    this.filterText = ''
    this.applyFilterAndSort()
  }
  public onColumnsChange(activeIds: string[]): void {
    this.displayedColumnKeys = activeIds
  }
  public onFilterChange(event: Filter[]): void {
    this.tableFilters = event
  }
  public onGlobalFilter(value: string): void {
    this.filterText = value
    this.applyFilterAndSort()
  }
  public onClearGlobalFilter(): void {
    this.filterText = ''
    this.applyFilterAndSort()
  }
  public onSortChange(event: Sort): void {
    this.sortField = event.sortColumn
    this.sortDirection = event.sortDirection
  }

  // Detail => CREATE, COPY, EDIT, VIEW
  public onDetail(mode: ChangeMode, item: Parameter | undefined, ev?: Event): void {
    ev?.stopPropagation()
    this.changeMode = mode
    this.item4Detail = { ...item }
    this.itemId = item?.id
    this.displayDetailDialog = true
  }
  public onCloseDetail(refresh: boolean): void {
    this.displayDetailDialog = false
    this.itemId = undefined
    if (refresh) {
      this.onReload()
    }
  }

  // DELETE => Ask for confirmation
  public onDelete(ev: Event, item: Parameter): void {
    ev.stopPropagation()
    this.item4Delete = { ...item }
    this.displayDeleteDialog = true
  }
  public onDeleteClosed(deleted: boolean): void {
    if (deleted) {
      const remainingForProduct = this.allRows.filter((d) => d.productName === this.item4Delete?.productName)
      if (remainingForProduct.length === 0) this.onReload()
      else this.onSearch({}, true)
    }
    this.displayDeleteDialog = false
    this.item4Delete = undefined
  }

  // Usage / History
  public onDetailUsage(ev: Event, item: Parameter) {
    ev.stopPropagation()
    this.item4Detail = item
    this.displayUsageDetailDialog = true
  }
  public onCloseUsageDetail() {
    this.displayUsageDetailDialog = false
    this.item4Detail = undefined
  }

  /****************************************************************************
   *  UI Helper
   */
  public getProductDisplayName(name?: string | undefined, allProducts?: ExtendedProduct[]): string | undefined {
    if (!allProducts || allProducts.length === 0) return name
    return allProducts.find((item) => item.name === name)?.displayName ?? name
  }
  public getAppDisplayName(
    productName?: string | undefined,
    appId?: string | undefined,
    allProducts?: ExtendedProduct[]
  ): string | undefined {
    if (!allProducts || allProducts.length === 0) return productName
    return (
      allProducts.find((item) => item.name === productName)?.applications?.find((a) => a.appId === appId)?.appName ??
      appId
    )
  }

  /****************************************************************************
   *  Interactive Data View
   */
  private syncInteractiveColumns(): void {
    const dataColumns = this.columns.map((column) => ({
      id: column.field,
      nameKey: column.translationPrefix ? `${column.translationPrefix}.${column.header}` : column.header,
      tooltipKey: column.translationPrefix ? `${column.translationPrefix}.TOOLTIPS.${column.header}` : undefined,
      columnType: this.getColumnType(column),
      sortable: !!column.sort,
      filterable: !!column.hasFilter
    }))

    this.interactiveColumns = [
      {
        id: 'actions',
        nameKey: 'ACTIONS.LABEL',
        columnType: ColumnType.STRING,
        sortable: false,
        filterable: false
      },
      ...dataColumns
    ]
    this.displayedColumnKeys = this.interactiveColumns.map((column) => column.id)
  }

  private getColumnType(column: ExtendedColumn): ColumnType {
    if (column.isDate) return ColumnType.DATE
    return ColumnType.STRING
  }

  private applyFilterAndSort(): void {
    const normalizedQuery = this.filterText.trim().toLowerCase()
    if (!normalizedQuery) {
      this.interactiveRows = [...this.allRows]
      return
    }
    this.interactiveRows = this.allRows.filter((row) => {
      const searchFields = [row.productName ?? '', row.applicationId ?? '', row.name ?? '', row.displayName ?? '']
        .join(' ')
        .toLowerCase()
      return searchFields.includes(normalizedQuery)
    })
  }
}
