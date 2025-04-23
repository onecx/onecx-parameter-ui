import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, catchError, combineLatest, finalize, map, tap, Observable, of, ReplaySubject } from 'rxjs'
import { Table } from 'primeng/table'

import { UserService } from '@onecx/angular-integration-interface'
import { Action, Column, DataViewControlTranslations, PortalMessageService } from '@onecx/portal-integration-angular'
import { SlotService } from '@onecx/angular-remote-components'

import { History, HistoriesAPIService, Parameter, ParameterSearchCriteria, Product } from 'src/app/shared/generated'

export type ChangeMode = 'VIEW' | 'COPY' | 'CREATE' | 'EDIT'
type ExtendedColumn = Column & {
  hasFilter?: boolean
  isBoolean?: boolean
  isDate?: boolean
  isDuration?: boolean
  isValue?: boolean
  isText?: boolean
  limit?: boolean
  frozen?: boolean
  css?: string
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
  selector: 'app-parameter-history',
  templateUrl: './parameter-history.component.html',
  styleUrls: ['./parameter-history.component.scss']
})
export class ParameterHistoryComponent implements OnInit {
  // dialog
  public loading = false
  public exceptionKey: string | undefined = undefined
  public exceptionKeyMeta: string | undefined = undefined
  public changeMode: ChangeMode = 'VIEW'
  public dateFormat: string
  public refreshUsedProducts = false
  public displayDetailDialog = false
  public displayDeleteDialog = false
  public displayUsageDialog = false
  public actions: Action[] = []

  @ViewChild('dataTable', { static: false }) dataTable: Table | undefined
  public dataViewControlsTranslations$: Observable<DataViewControlTranslations> | undefined

  // data
  public data$: Observable<History[]> | undefined
  public criteria: ParameterSearchCriteria = {}
  public metaData$!: Observable<AllMetaData>
  public usedProducts$ = new ReplaySubject<Product[]>(1) // getting data from bff endpoint
  public itemId: string | undefined // used on detail
  public item4Detail: History | undefined
  public item4Delete: History | undefined // used on deletion
  // slot configuration: get product infos via remote component
  public slotName = 'onecx-product-infos'
  public isComponentDefined$: Observable<boolean> | undefined // check
  public productInfos$ = new BehaviorSubject<ProductAbstract[] | undefined>(undefined) // product infos
  public slotEmitter = new EventEmitter<ProductAbstract[]>()

  public filteredColumns: Column[] = []
  public columns: ExtendedColumn[] = [
    {
      field: 'name',
      header: 'COMBINED_NAME',
      active: true,
      translationPrefix: 'PARAMETER',
      limit: false,
      frozen: true,
      css: 'word-break-all'
    },
    {
      field: 'productDisplayName',
      header: 'PRODUCT_NAME',
      active: true,
      translationPrefix: 'PARAMETER'
    },
    {
      field: 'applicationName',
      header: 'APP_NAME',
      active: true,
      translationPrefix: 'PARAMETER'
    },
    {
      field: 'start',
      header: 'START',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isDate: true
    },
    {
      field: 'duration',
      header: 'DURATION',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isDuration: true
    },
    {
      field: 'count',
      header: 'COUNT',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isText: true,
      css: 'text-center'
    },
    {
      field: 'instanceId',
      header: 'INSTANCE_ID',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isText: true,
      css: 'text-center'
    },
    {
      field: 'usedValue',
      header: 'USED_VALUE',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isValue: true,
      css: 'text-center word-break-all'
    },
    {
      field: 'defaultValue',
      header: 'DEFAULT_VALUE',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isValue: true,
      css: 'text-center word-break-all'
    }
  ]

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly user: UserService,
    private readonly slotService: SlotService,
    private readonly translate: TranslateService,
    private readonly msgService: PortalMessageService,
    private readonly historyApi: HistoriesAPIService
  ) {
    this.dateFormat = this.user.lang$.getValue() === 'de' ? 'dd.MM.yyyy HH:mm:ss' : 'M/d/yy, hh:mm:ss a'
    this.filteredColumns = this.columns.filter((a) => a.active === true)
    this.isComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.slotName)
  }

  public ngOnInit(): void {
    this.slotEmitter.subscribe(this.productInfos$)
    this.onReload()
    this.getMetaData() // and trigger search
    this.prepareDialogTranslations()
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
    // combine all product infos and used products to one meta data structure
    this.metaData$ = combineLatest([this.productInfos$, this.usedProducts$]).pipe(
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
      map((data) => data.stream),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PARAMETER'
        console.error('getAllHistoryLatest', err)
        return of([] as Parameter[])
      }),
      finalize(() => (this.loading = false))
    )
  }

  /**
   * Dialog preparation
   */
  private prepareDialogTranslations(): void {
    this.dataViewControlsTranslations$ = this.translate
      .get([
        'PARAMETER.PRODUCT_NAME',
        'PARAMETER.APP_ID',
        'PARAMETER.NAME',
        'PARAMETER.DISPLAY_NAME',
        'DIALOG.DATAVIEW.FILTER'
      ])
      .pipe(
        map((data) => {
          return {
            filterInputPlaceholder: data['DIALOG.DATAVIEW.FILTER'],
            filterInputTooltip:
              data['PARAMETER.PRODUCT_NAME'] +
              ', ' +
              data['PARAMETER.APP_ID'] +
              ', ' +
              data['PARAMETER.DISPLAY_NAME'] +
              ', ' +
              data['PARAMETER.NAME']
          } as DataViewControlTranslations
        })
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
  public onDetail(mode: ChangeMode, item: History | undefined, ev?: Event): void {
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
  public onUsage(ev: Event, item: History) {
    ev.stopPropagation()
    this.item4Detail = item
    this.displayUsageDialog = true
  }
  public onCloseUsage() {
    this.displayUsageDialog = false
    this.item4Detail = undefined
  }

  public onColumnsChange(activeIds: string[]) {
    this.filteredColumns = activeIds.map((id) => this.columns.find((col) => col.field === id)) as Column[]
  }

  public onFilterChange(event: string): void {
    this.dataTable?.filterGlobal(event, 'contains')
  }

  private sortByDisplayName(a: any, b: any): number {
    return (a.displayName ? a.displayName.toUpperCase() : '').localeCompare(
      b.displayName ? b.displayName.toUpperCase() : ''
    )
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
