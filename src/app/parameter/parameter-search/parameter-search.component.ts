import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, catchError, combineLatest, finalize, map, tap, Observable, of, ReplaySubject } from 'rxjs'
import { Table } from 'primeng/table'

import { UserService } from '@onecx/angular-integration-interface'
import { Action, Column, DataViewControlTranslations, PortalMessageService } from '@onecx/portal-integration-angular'
import { SlotService } from '@onecx/angular-remote-components'

import {
  Parameter,
  ParameterPageResult,
  ParameterSearchCriteria,
  ParametersAPIService,
  Product
} from 'src/app/shared/generated'
import { sortByDisplayName } from 'src/app/shared/utils'

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
export type ExtendedParameter = Parameter & { valueType: string; displayValue: string; isEqual: boolean }
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
  public filteredColumns: Column[] = []
  public sortByDisplayName = sortByDisplayName

  @ViewChild('dataTable', { static: false }) dataTable: Table | undefined
  public dataViewControlsTranslations$: Observable<DataViewControlTranslations> | undefined

  // data
  public data$: Observable<ExtendedParameter[]> | undefined
  public criteria: ParameterSearchCriteria = {}
  public metaData$!: Observable<AllMetaData>
  public usedProducts$ = new ReplaySubject<Product[]>(1) // getting data from bff endpoint
  public itemId: string | undefined // used on detail
  public item4Detail: Parameter | undefined // used on detail
  public item4Delete: Parameter | undefined // used on deletion
  // slot configuration: get product infos via remote component
  public slotName = 'onecx-product-infos'
  public isComponentDefined$: Observable<boolean> | undefined // check
  public productInfos$ = new BehaviorSubject<ProductAbstract[] | undefined>(undefined) // product infos
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
      css: 'text-center'
    },
    {
      field: 'equal',
      header: 'EQUAL',
      translationPrefix: 'PARAMETER',
      active: true,
      css: 'text-center'
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
      css: 'text-center'
    },
    {
      field: 'modificationDate',
      header: 'MODIFICATION_DATE',
      translationPrefix: 'INTERNAL',
      active: true,
      sort: true,
      isDate: true
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
    this.data$ = this.parameterApi.searchParametersByCriteria({ parameterSearchCriteria: { ...this.criteria } }).pipe(
      tap((data: any) => {
        if (data.totalElements === 0) {
          this.msgService.info({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.NO_RESULTS' })
          return data.size
        }
      }),
      map((data: ParameterPageResult) => {
        if (!data.stream) return [] as ExtendedParameter[]
        return (data.stream as Parameter[]).map(
          (p) =>
            ({
              ...p,
              displayName: p.displayName ?? p.name,
              valueType: this.displayValueType(p.value || p.importValue),
              displayValue: this.displayValue(p.value || p.importValue),
              isEqual: this.areValuesEqual(p.value, p.importValue)
            }) as ExtendedParameter
        )
      }),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PARAMETERS'
        console.error('searchParametersByCriteria', err)
        return of([] as ExtendedParameter[])
      }),
      finalize(() => (this.loading = false))
    )
  }

  /****************************************************************************
   *  Helper, due to not calculate such things on HTML!
   */
  private displayValueType(val: any): string {
    if (val === undefined || val === null) return 'UNKNOWN'
    return (typeof val).toUpperCase()
  }
  private displayValue(val: any): string {
    if (typeof val === 'boolean') return '' + val
    if (!val) return ''
    return typeof val !== 'object' ? val : '{ ... }'
  }
  private areValuesEqual(val1: any, val2: any): boolean {
    if (val1 === undefined || val2 === undefined || val1 === null || val2 === null || typeof val1 !== typeof val2)
      return false
    if (['boolean', 'number', 'string'].includes(typeof val1)) return val1 === val2
    if (['object'].includes(typeof val1)) {
      const commonKeys = [...new Set([...Object.keys(val1), ...Object.keys(val2)])]
      for (const key of commonKeys) {
        if (val1[key] !== val2[key]) return false
      }
    }
    return true
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
  }
  public onColumnsChange(activeIds: string[]) {
    this.filteredColumns = activeIds.map((id) => this.columns.find((col) => col.field === id)) as Column[]
  }
  public onFilterChange(event: string): void {
    this.dataTable?.filterGlobal(event, 'contains')
  }

  // Detail => CREATE, COPY, EDIT, VIEW
  public onDetail(mode: ChangeMode, item: Parameter | undefined, ev?: Event): void {
    ev?.stopPropagation()
    this.changeMode = mode
    this.item4Detail = item
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
    this.item4Delete = item
    this.displayDeleteDialog = true
  }
  // user confirmed deletion
  public onDeleteConfirmation(data: Parameter[]): void {
    if (!this.item4Delete?.id) return
    this.parameterApi.deleteParameter({ id: this.item4Delete?.id }).subscribe({
      next: () => {
        this.msgService.success({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
        // remove item from data
        data = data?.filter((d) => d.id !== this.item4Delete?.id)
        // check remaing data if product still exists - if not then reload
        const d = data?.filter((d) => d.productName === this.item4Delete?.productName)
        this.item4Delete = undefined
        this.displayDeleteDialog = false
        if (d?.length === 0)
          this.onReload() // deletion forces reload
        else this.onSearch({}, true)
      },
      error: (err) => {
        this.msgService.error({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
        console.error('deleteParameter', err)
      }
    })
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
  public getProductDisplayName(name: string | undefined, allProducts: ExtendedProduct[]): string | undefined {
    if (allProducts.length === 0) return name
    return allProducts.find((item) => item.name === name)?.displayName ?? name
  }
  public getAppDisplayName(
    productName: string | undefined,
    appId: string | undefined,
    allProducts: ExtendedProduct[]
  ): string | undefined {
    if (allProducts.length === 0) return productName
    return (
      allProducts.find((item) => item.name === productName)?.applications?.find((a) => a.appId === appId)?.appName ??
      appId
    )
  }
}
