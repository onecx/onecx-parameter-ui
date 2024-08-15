import { Component, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Action, PortalMessageService } from '@onecx/portal-integration-angular'

import { catchError, finalize, map, tap } from 'rxjs/operators'
import { Observable, of } from 'rxjs'
import { ApplicationParameter, ParameterSearchCriteria, ParametersAPIService, Product } from 'src/app/shared/generated'
import { ActivatedRoute, Router } from '@angular/router'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { SelectItem } from 'primeng/api'

type ChangeMode = 'VIEW' | 'NEW' | 'EDIT'

@Component({
  selector: 'app-parameter-search',
  templateUrl: './parameter-search.component.html',
  styleUrls: ['./parameter-search.component.scss']
})
export class ParameterSearchComponent implements OnInit {
  public parameter: ApplicationParameter | undefined
  public parameters: ApplicationParameter[] = []
  private translatedData: any
  public criteria: ParameterSearchCriteria = {}
  public actions$: Observable<Action[]> | undefined
  public products$: Observable<Product[]> | undefined
  public productOptions$: Observable<SelectItem[]> | undefined
  public criteriaGroup!: UntypedFormGroup
  public applicationIds: string[] = []
  public appOptions$: Observable<SelectItem[]> | undefined
  public changeMode: ChangeMode = 'NEW'
  public displayDetailDialog = false
  public searching = false
  public results$: Observable<ApplicationParameter[]> | undefined

  constructor(
    private readonly messageService: PortalMessageService,
    private translateService: TranslateService,
    private readonly parametersApi: ParametersAPIService,
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
    this.getAllProductNamesAndApplicationIds()
    // this.criteriaGroup.valueChanges.subscribe((v) => {
    //   this.criteria = { ...v }
    // })
  }

  public search(criteria: ParameterSearchCriteria, reuseCriteria = false): void {
    this.searching = true
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

  // public reset(): void {
  //   this.results = []
  //   this.criteriaGroup.reset()
  // }

  public onReset(): void {
    this.criteria = {}
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
    // this.appsChanged = false
    this.parameter = undefined
    this.displayDetailDialog = true
  }
  public onDetail(ev: MouseEvent, item: ApplicationParameter, mode: ChangeMode): void {
    ev.stopPropagation()
    this.changeMode = mode
    // this.appsChanged = false
    this.parameter = item
    this.displayDetailDialog = true
  }
  public onCopy(ev: MouseEvent, item: ApplicationParameter) {
    ev.stopPropagation()
    this.changeMode = 'NEW'
    // this.appsChanged = false
    this.parameter = item
    this.parameter.id = undefined
    this.displayDetailDialog = true
  }
  public onDelete(ev: MouseEvent, item: ApplicationParameter): void {
    ev.stopPropagation()
    this.parameter = item
    // this.appsChanged = false
    // this.displayDeleteDialog = true
  }
  public onDeleteConfirmation(id: string): void {
    this.parametersApi.deleteParameter({ id }).subscribe(
      () => {
        this.messageService.success({
          summaryKey: this.translatedData['PARAMETER_DELETE.DELETE_SUCCESS']
        })
        // this.searchData(this.criteria!)
      },
      () => {
        this.messageService.error({
          summaryKey: this.translatedData['PARAMETER_DELETE.DELETE_ERROR']
        })
      }
    )
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
            actionCallback: () => this.router.navigate([`./create`], { relativeTo: this.route }),
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

  private getAllProductNamesAndApplicationIds(): void {
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
