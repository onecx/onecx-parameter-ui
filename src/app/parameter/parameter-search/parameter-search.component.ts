import { Component, OnInit, EventEmitter, inject } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { BehaviorSubject, catchError, combineLatest, finalize, map, tap, Observable, of, ReplaySubject } from 'rxjs'

import { PortalMessageService, UserService } from '@onecx/angular-integration-interface'
import { Action, ColumnType, DataAction, DataTableColumn, Filter, FilterType } from '@onecx/angular-accelerator'
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
export type ExtendedParameter = Parameter & {
  id: string
  valueType: string
  importValueType: string
  displayValue: string
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
  selector: 'app-parameter-search',
  templateUrl: './parameter-search.component.html',
  styleUrls: ['./parameter-search.component.scss'],
  standalone: false
})
export class ParameterSearchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly user = inject(UserService)
  private readonly slotService = inject(SlotService)
  private readonly msgService = inject(PortalMessageService)
  private readonly parameterApi = inject(ParametersAPIService)

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
  public additionalActions: DataAction[] = []
  public filters: Filter[] = []

  // data
  public data$: Observable<ExtendedParameter[]> | undefined
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

  public columns: DataTableColumn[] = [
    {
      id: 'name',
      nameKey: 'PARAMETER.COMBINED_NAME',
      columnType: ColumnType.STRING,
      sortable: true,
      predefinedGroupKeys: ['DEFAULT']
    },
    { id: 'value', nameKey: 'PARAMETER.VALUE', columnType: ColumnType.STRING, predefinedGroupKeys: ['DEFAULT'] },
    {
      id: 'valueType',
      nameKey: 'PARAMETER.VALUE.TYPE',
      columnType: ColumnType.STRING,
      predefinedGroupKeys: ['DEFAULT']
    },
    { id: 'equal', nameKey: 'PARAMETER.EQUAL', columnType: ColumnType.STRING, predefinedGroupKeys: ['DEFAULT'] },
    {
      id: 'applicationId',
      nameKey: 'PARAMETER.PRODUCT_APP',
      columnType: ColumnType.STRING,
      sortable: true,
      filterable: true,
      filterType: FilterType.EQUALS,
      predefinedGroupKeys: ['DEFAULT']
    },
    {
      id: 'operator',
      nameKey: 'PARAMETER.OPERATOR',
      columnType: ColumnType.STRING,
      predefinedGroupKeys: ['DEFAULT']
    },
    {
      id: 'modificationDate',
      nameKey: 'INTERNAL.MODIFICATION_DATE',
      columnType: ColumnType.DATE,
      sortable: true,
      predefinedGroupKeys: ['DEFAULT']
    }
  ]

  constructor() {
    this.dateFormat = this.user.lang$.getValue() === 'de' ? 'dd.MM.yyyy HH:mm:ss' : 'M/d/yy, hh:mm:ss a'
    const modificationDateColumn = this.columns.find((c) => c.id === 'modificationDate')
    if (modificationDateColumn) modificationDateColumn.dateFormat = this.dateFormat
    this.additionalActions = [
      {
        id: 'copy',
        labelKey: 'ACTIONS.COPY.LABEL',
        icon: 'pi pi-copy',
        permission: 'PARAMETER#EDIT',
        callback: (item) => this.onDetail('COPY', item)
      },
      {
        id: 'usage',
        labelKey: 'DIALOG.NAVIGATION.DETAIL_USAGE.LABEL',
        icon: 'pi pi-history',
        permission: 'USAGE#VIEW',
        actionEnabledField: 'isInHistory',
        callback: (item) => this.onDetailUsage(item)
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
    this.data$ = this.parameterApi.searchParametersByCriteria({ parameterSearchCriteria: { ...this.criteria } }).pipe(
      tap((data: any) => {
        if (data.totalElements === 0) {
          this.msgService.info({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.NO_RESULTS' })
          return data.size
        }
      }),
      map((data: ParameterPageResult) => {
        if (!data.stream) return [] as ExtendedParameter[]
        return data.stream.map(
          (p) =>
            ({
              ...p,
              id: p.id ?? '',
              imagePath: '',
              displayName: p.displayName ?? p.name,
              valueType: displayValueType(p.value),
              importValueType: displayValueType(p.importValue),
              displayValue: displayValue2(p.value, p.importValue),
              isEqual: displayEqualityState(p.value, p.importValue)
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
  public onFilterChange(filters: Filter[]): void {
    this.filters = filters
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
  public onDelete(item: Parameter): void {
    this.item4Delete = { ...item }
    this.displayDeleteDialog = true
  }
  public onDeleteClosed(deleted: boolean, data: Parameter[]): void {
    if (deleted) {
      // remove item from data
      data = data?.filter((d) => d.id !== this.item4Delete?.id)
      // check remaing data if product still exists - if not then reload
      const d = data?.filter((d) => d.productName === this.item4Delete?.productName)
      if (d?.length === 0)
        this.onReload() // reload all data because if no parameter for the product exists anymore (adjust dropdown lists)
      else this.onSearch({}, true)
    }
    this.displayDeleteDialog = false
    this.item4Delete = undefined
  }

  // Usage / History
  public onDetailUsage(item: Parameter) {
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
}
