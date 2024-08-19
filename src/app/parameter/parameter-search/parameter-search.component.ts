import { Component, OnInit, ViewChild } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Action, Column, PortalMessageService } from '@onecx/portal-integration-angular'

import { catchError, finalize, map, tap } from 'rxjs/operators'
import { Observable, of } from 'rxjs'
import {
  ApplicationParameter,
  ParameterSearchCriteria,
  ParametersAPIService,
  Product,
  ProductStorePageResult,
  ProductsAPIService
} from 'src/app/shared/generated'
import { ActivatedRoute, Router } from '@angular/router'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { SelectItem } from 'primeng/api'

import { dropDownSortItemsByLabel } from 'src/app/shared/utils'
import { Table } from 'primeng/table'

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

  public parameter: ApplicationParameter | undefined
  public parameters: ApplicationParameter[] = []
  private translatedData: any
  public criteria: ParameterSearchCriteria = {}
  public actions$: Observable<Action[]> | undefined
  public allProducts$: Observable<SelectItem[]> | undefined
  public productOptions$: Observable<SelectItem[]> | undefined
  public criteriaGroup!: UntypedFormGroup
  public applicationIds: string[] = []
  public appOptions$: Observable<SelectItem[]> | undefined
  public changeMode: ChangeMode = 'NEW'
  public displayDetailDialog = false
  public displayDeleteDialog = false
  public displayHistoryDialog = false
  public searching = false
  public appsChanged = false
  public results$: Observable<ApplicationParameter[]> | undefined

  public columns: ExtendedColumn[] = [
    {
      field: 'productName',
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
      css: 'text-center hidden xl:table-cell'
    },
    {
      field: 'key',
      header: 'KEY',
      active: true,
      translationPrefix: 'PARAMETER',
      css: 'hidden sm:table-cell'
    },
    {
      field: 'setValue',
      header: 'VALUE',
      active: true,
      translationPrefix: 'PARAMETER',
      css: 'text-center hidden xl:table-cell',
      isDropdown: true
    },
    {
      field: 'importValue',
      header: 'IMPORT_VALUE',
      active: true,
      translationPrefix: 'PARAMETER',
      css: 'text-center hidden lg:table-cell',
      isDropdown: true
    },
    {
      field: 'description',
      header: 'DESCRIPTION',
      active: false,
      translationPrefix: 'PARAMETER',
      css: 'text-center hidden lg:table-cell',
      isDropdown: true
    },
    {
      field: 'unit',
      header: 'UNIT',
      active: false,
      translationPrefix: 'PARAMETER',
      css: 'text-center hidden lg:table-cell',
      isDropdown: true
    },
    {
      field: 'rangeFrom',
      header: 'RANGE_FROM',
      active: false,
      translationPrefix: 'PARAMETER',
      css: 'text-center hidden lg:table-cell',
      isDropdown: true
    },
    {
      field: 'rangeTo',
      header: 'RANGE_TO',
      active: false,
      translationPrefix: 'PARAMETER',
      css: 'text-center hidden lg:table-cell',
      isDropdown: true
    }
  ]

  public filteredColumns: Column[] = []
  public deleteDialogVisible = false

  constructor(
    private readonly messageService: PortalMessageService,
    private translateService: TranslateService,
    private readonly parametersApi: ParametersAPIService,
    private readonly productsApi: ProductsAPIService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly fb: UntypedFormBuilder
  ) {}

  public ngOnInit(): void {
    this.loadTranslations()
    // this.searchData(this.criteria!)
    this.search({})
    this.prepareActionButtons()
    this.initializeForm()
    this.getUsedProductNamesAndApplicationIds()
    this.getAllProductNamesAndApplicationIds()
    // this.criteriaGroup.valueChanges.subscribe((v) => {
    //   this.criteria = { ...v }
    // })
    this.filteredColumns = this.columns.filter((a) => {
      return a.active === true
    })
  }

  public search(criteria: ParameterSearchCriteria, reuseCriteria = false): void {
    this.searching = true
    if (!reuseCriteria) {
      this.criteria = { ...criteria }
    }
    this.results$ = this.parametersApi
      .searchApplicationParametersByCriteria({
        parameterSearchCriteria: { ...this.criteria }
      })
      .pipe(
        finalize(() => (this.searching = false)),
        tap({
          next: (data: any) => {
            if (data.totalElements == 0) {
              this.messageService.success({
                summaryKey: this.translatedData['SEARCH.MSG_NO_RESULTS']
              })
              return data.size
            }
          },
          error: () => {
            this.messageService.error({
              summaryKey: this.translatedData['SEARCH.MSG_SEARCH_FAILED']
            })
          }
        }),
        map((data: any) => data.stream)
      )
  }

  public onReset(): void {
    this.criteria = {}
    this.criteriaGroup.reset()
    this.criteriaGroup.controls['applicationId'].disable()
  }

  // public searchData(criteria: ParameterSearchCriteria): void {
  //   this.searching = true
  //   this.criteria = criteria
  //   const obs$ = this.search(criteria)
  //   obs$.subscribe((data) => {
  //     this.results = data
  //   })
  // }

  compareProductNames(nameOne: string, nametwo: string): number {
    if (nameOne < nametwo) {
      return -1
    } else if (nameOne > nametwo) {
      return 1
    } else return 0
  }

  public onCreate() {
    this.changeMode = 'NEW'
    this.appsChanged = false
    this.parameter = undefined
    this.displayDetailDialog = true
  }
  public onDetail(ev: MouseEvent, item: ApplicationParameter, mode: ChangeMode): void {
    ev.stopPropagation()
    this.changeMode = mode
    this.appsChanged = false
    this.parameter = item
    this.displayDetailDialog = true
  }
  public onCloseDetail(refresh: boolean): void {
    this.displayDetailDialog = false
    if (refresh) {
      this.search({}, true)
      this.getUsedProductNamesAndApplicationIds()
    }
  }
  public onCopy(ev: MouseEvent, item: ApplicationParameter) {
    ev.stopPropagation()
    this.changeMode = 'NEW'
    this.appsChanged = false
    this.parameter = item
    this.parameter.id = undefined
    this.displayDetailDialog = true
  }
  public onHistory(ev: MouseEvent, item: ApplicationParameter) {
    ev.stopPropagation()
    this.changeMode = 'VIEW'
    this.appsChanged = false
    this.parameter = item
    this.displayHistoryDialog = true
  }
  public onCloseHistory() {
    this.displayHistoryDialog = false
  }
  public onDelete(ev: MouseEvent, item: ApplicationParameter): void {
    ev.stopPropagation()
    this.parameter = item
    this.appsChanged = false
    this.displayDeleteDialog = true
  }
  public onDeleteConfirmation(): void {
    if (this.parameter?.id) {
      const usedProduct = this.parameter?.productName !== undefined
      this.parametersApi.deleteParameter({ id: this.parameter?.id }).subscribe({
        next: () => {
          this.displayDeleteDialog = false
          this.parameters = this.parameters.filter((a) => a.key !== this.parameter?.key)
          this.parameter = undefined
          this.appsChanged = true
          this.messageService.success({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
          if (usedProduct) this.getUsedProductNamesAndApplicationIds()
        },
        error: () => this.messageService.error({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
      })
    }
  }
  public onColumnsChange(activeIds: string[]) {
    this.filteredColumns = activeIds.map((id) => this.columns.find((col) => col.field === id)) as Column[]
  }

  public onFilterChange(event: string): void {
    this.parameterTable?.filterGlobal(event, 'contains')
  }

  private loadTranslations(): void {
    this.translateService
      .get([
        'SEARCH.MSG_NO_RESULTS',
        'SEARCH.MSG_SEARCH_FAILED',
        'PARAMETER_DELETE.DELETE_SUCCESS',
        'PARAMETER_DELETE.DELETE_ERROR'
      ])
      .subscribe((text: Record<string, string>) => {
        this.translatedData = text
      })
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
  private getAllProductNamesAndApplicationIds(): void {
    const allProducts$ = this.productsApi.searchAllAvailableProducts({ productStoreSearchCriteria: {} }).pipe(
      catchError((err) => {
        console.error('getAllProductNames():', err)
        return of([] as ProductStorePageResult)
      })
    )
    this.allProducts$ = allProducts$.pipe(
      map((data: ProductStorePageResult) => {
        const si: SelectItem[] = []
        if (data.stream) {
          for (const product of data.stream) {
            si.push({ label: product.productName, value: product.productName })
          }
          si.sort(dropDownSortItemsByLabel)
        }
        return si
      })
    )
  }

  private getUsedProductNamesAndApplicationIds(): void {
    const products$ = this.parametersApi.getAllApplications()

    this.productOptions$ = products$.pipe(
      catchError((err) => {
        console.error('getAllApplications', err)
        return of([])
      }),
      map((data) =>
        data.map(
          (product: Product) =>
            ({
              label: product.productName,
              value: product.productName
            }) as SelectItem
        )
      )
    )

    this.appOptions$ = products$.pipe(
      catchError((err) => {
        console.error('getAllApplications', err)
        return of([])
      }),
      map((data) =>
        data.flatMap((product: Product) =>
          (product.applications || []).map(
            (name) =>
              ({
                label: name,
                value: name
              }) as SelectItem
          )
        )
      )
    )
  }

  // public async updateApplicationIds(productName: string) {
  //   await lastValueFrom(this.products$!)
  //     .then((data) => {
  //       this.applicationIds = []
  //       this.criteriaGroup.controls['applicationId'].reset()
  //       data.map((p) => {
  //         if (p.productName === productName && p.applications) {
  //           this.applicationIds = p.applications!
  //           this.applicationIds.unshift('')
  //         }
  //         p.applications?.map((app) => {
  //           this.appOptions.push({
  //             title: app,
  //             value: app
  //           })
  //         })
  //       })
  //     })
  //     .finally(() => {
  //       if (this.applicationIds.length > 0) {
  //         this.criteriaGroup.controls['applicationId'].enable()
  //       } else {
  //         this.criteriaGroup.controls['applicationId'].disable()
  //       }
  //     })
  // }
  compareStrings(a: string, b: string): number {
    if (a < b) {
      return -1
    } else if (a > b) {
      return 1
    } else return 0
  }
}
