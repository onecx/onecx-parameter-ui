import { Component, OnInit, EventEmitter } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { BehaviorSubject, catchError, combineLatest, finalize, map, tap, Observable, of, ReplaySubject } from 'rxjs'

import { PortalMessageService, UserService } from '@onecx/angular-integration-interface'
import { Action, ColumnType, DataAction, DataTableColumn, Filter, FilterType } from '@onecx/angular-accelerator'
import { SlotService } from '@onecx/angular-remote-components'

import {
  History,
  HistoriesAPIService,
  HistoryPageResult,
  ParameterSearchCriteria,
  Product
} from 'src/app/shared/generated'
import { displayEqualityState, displayValue, displayValueType, sortByDisplayName } from 'src/app/shared/utils'

export type ChangeMode = 'VIEW' | 'COPY' | 'CREATE' | 'EDIT'
export type ExtendedHistory = History & {
  valueType: string
  defaultValueType: string
  displayUsedValue: string
  displayDefaultValue: string
  isEqual: string
  imagePath: string
  [key: string]: unknown
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
  selector: 'app-usage-search',
  templateUrl: './usage-search.component.html',
  styleUrls: ['./usage-search.component.scss']
})
export class UsageSearchComponent implements OnInit {
  // dialog
  public loading = false
  public exceptionKey: string | undefined = undefined
  public exceptionKeyMeta: string | undefined = undefined
  public changeMode: ChangeMode = 'VIEW'
  public dateFormat: string
  public refreshUsedProducts = false
  public displayDetailDialog = false
  public displayUsageDialog = false
  public actions: Action[] = []
  public additionalActions: DataAction[] = []
  public filters: Filter[] = []
  public sortByDisplayName = sortByDisplayName

  // data
  public data$: Observable<ExtendedHistory[]> | undefined
  public criteria: ParameterSearchCriteria = {}
  public metaData$!: Observable<AllMetaData>
  public usedProducts$ = new ReplaySubject<Product[]>(1) // getting data from bff endpoint
  public itemId: string | undefined // used on detail
  public item4Detail: ExtendedHistory | undefined
  public item4Delete: History | undefined // used on deletion
  // slot configuration: get product infos via remote component
  public slotName = 'onecx-product-data'
  public isComponentDefined$: Observable<boolean> | undefined // check
  public productData$ = new BehaviorSubject<ProductAbstract[] | undefined>(undefined) // product data
  public slotEmitter = new EventEmitter<ProductAbstract[]>()

  public columns: DataTableColumn[] = [
    { id: 'name', nameKey: 'PARAMETER.COMBINED_NAME', columnType: ColumnType.STRING, sortable: true },
    { id: 'displayUsedValue', nameKey: 'USAGE.USED_VALUE', columnType: ColumnType.STRING },
    { id: 'displayDefaultValue', nameKey: 'USAGE.DEFAULT_VALUE', columnType: ColumnType.STRING },
    { id: 'valueType', nameKey: 'PARAMETER.VALUE.TYPE', columnType: ColumnType.STRING },
    { id: 'equal', nameKey: 'USAGE.EQUAL', columnType: ColumnType.STRING },
    { id: 'start', nameKey: 'USAGE.START', columnType: ColumnType.DATE, sortable: true },
    { id: 'duration', nameKey: 'USAGE.DURATION', columnType: ColumnType.STRING },
    { id: 'count', nameKey: 'USAGE.COUNT', columnType: ColumnType.NUMBER },
    {
      id: 'applicationName',
      nameKey: 'PARAMETER.APP_NAME',
      columnType: ColumnType.STRING,
      sortable: true,
      filterable: true,
      filterType: FilterType.EQUAL
    },
    { id: 'instanceId', nameKey: 'USAGE.INSTANCE_ID', columnType: ColumnType.STRING, sortable: true }
  ]

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly user: UserService,
    private readonly slotService: SlotService,
    private readonly msgService: PortalMessageService,
    private readonly historyApi: HistoriesAPIService
  ) {
    this.dateFormat = this.user.lang$.getValue() === 'de' ? 'dd.MM.yyyy HH:mm:ss' : 'M/d/yy, hh:mm:ss a'
    const startColumn = this.columns.find((c) => c.id === 'start')
    if (startColumn) startColumn.dateFormat = this.dateFormat
    this.additionalActions = [
      {
        id: 'usage',
        labelKey: 'DIALOG.NAVIGATION.DETAIL_USAGE.LABEL',
        icon: 'pi pi-history',
        permission: 'USAGE#VIEW',
        callback: (item) => this.onUsage(item)
      }
    ]
    this.isComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.slotName)
  }

  public ngOnInit(): void {
    this.slotEmitter.subscribe(this.productData$)
    this.onReload()
    this.getMetaData() // and trigger search
    this.preparePageActions()
  }

  private onReload(): void {
    this.getUsedProducts()
    this.onSearch({}, true)
  }

  /****************************************************************************
   * GET DATA
   */
  // get used products (used === assigned to data)
  private getUsedProducts() {
    this.historyApi
      .getAllHistoryProducts()
      .pipe(
        catchError((err) => {
          this.exceptionKeyMeta = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PRODUCTS'
          console.error('getAllHistoryProducts', err)
          return of([])
        })
      )
      .subscribe((v) => this.usedProducts$.next(v))
  }

  // combine used products with product data from product store
  private getMetaData() {
    this.exceptionKeyMeta = undefined
    // combine all product data and used products to one meta data structure
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
      aps.sort(this.sortByDisplayName)
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
    ups.sort(this.sortByDisplayName)
    return ups
  }

  private combineProducts(aP: ExtendedProduct[], uP: ExtendedProduct[]): AllMetaData {
    // convert/enrich used products if product data are available
    if (aP && uP && uP.length > 0) {
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
      uP.sort(this.sortByDisplayName)
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
    this.data$ = this.historyApi.getAllHistoryLatest({ historyCriteria: { ...this.criteria } }).pipe(
      tap((data: any) => {
        if (data.totalElements === 0) {
          this.msgService.info({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.NO_RESULTS' })
          return data.size
        }
      }),
      map((data: HistoryPageResult) => {
        if (!data.stream) return [] as ExtendedHistory[]
        return data.stream.map(
          (h) =>
            ({
              ...h,
              imagePath: '',
              valueType: displayValueType(h.usedValue),
              defaultValueType: displayValueType(h.defaultValue),
              displayDefaultValue: displayValue(h.defaultValue),
              displayUsedValue: displayValue(h.usedValue),
              isEqual: displayEqualityState(h.usedValue, h.defaultValue)
            }) as ExtendedHistory
        )
      }),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PARAMETER'
        console.error('getAllHistoryLatest', err)
        return of([] as ExtendedHistory[])
      }),
      finalize(() => (this.loading = false))
    )
  }

  public preparePageActions(): void {
    this.actions = [
      {
        labelKey: 'DIALOG.NAVIGATION.SEARCH.LABEL',
        titleKey: 'DIALOG.NAVIGATION.SEARCH.TOOLTIP',
        actionCallback: () => this.onGoToParameterSearchPage(),
        icon: 'pi pi-list',
        show: 'always'
      }
    ]
  }

  /****************************************************************************
   *  UI Events
   */
  public onCriteriaReset(): void {
    this.criteria = {}
  }

  public onGoToParameterSearchPage() {
    this.router.navigate(['../'], { relativeTo: this.route })
  }

  // Detail => CREATE, COPY, EDIT, VIEW
  public onDetail(mode: ChangeMode, item: ExtendedHistory | undefined, ev?: Event): void {
    ev?.stopPropagation()
    this.changeMode = mode
    this.item4Detail = item // do not manipulate this item here
    this.displayDetailDialog = true
  }
  public onCloseDetail(refresh: boolean): void {
    this.displayDetailDialog = false
    this.itemId = undefined
    if (refresh) {
      this.onReload()
    }
  }

  // History
  public onUsage(item: ExtendedHistory) {
    this.item4Detail = item
    this.displayUsageDialog = true
  }
  public onCloseUsage() {
    this.displayUsageDialog = false
    this.item4Detail = undefined
  }

  public onFilterChange(filters: Filter[]): void {
    this.filters = filters
  }

  // getting display names within HTML
  public getProductDisplayName(name: string | undefined, allProducts: ExtendedProduct[]): string | undefined {
    return allProducts.find((item) => item.name === name)?.displayName ?? name
  }
  public getAppDisplayName(
    productName: string | undefined,
    appId: string | undefined,
    allProducts: ExtendedProduct[]
  ): string | undefined {
    return (
      allProducts.find((item) => item.name === productName)?.applications?.find((a) => a.appId === appId)?.appName ??
      appId
    )
  }

  public onCalcDuration(start: string, end: string): string {
    if (!start || start === '' || !end || end === '') return ''
    return new Date(Date.parse(end) - Date.parse(start)).toUTCString().split(' ')[4]
  }
}
