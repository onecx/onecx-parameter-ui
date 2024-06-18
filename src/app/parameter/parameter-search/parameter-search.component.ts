import { Component, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { provideParent, PortalSearchPage, Action, PortalMessageService } from '@onecx/portal-integration-angular'

import { finalize, map, tap } from 'rxjs/operators'
import { Observable, lastValueFrom } from 'rxjs'
import { ApplicationParameter, ParameterSearchCriteria, ParametersAPIService, Product } from 'src/app/shared/generated'
import { ActivatedRoute, Router } from '@angular/router'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { SelectItem } from 'primeng/api'

@Component({
  selector: 'app-parameter-search',
  templateUrl: './parameter-search.component.html',
  styleUrls: ['./parameter-search.component.scss'],
  providers: [provideParent(ParameterSearchComponent)]
})
export class ParameterSearchComponent extends PortalSearchPage<ApplicationParameter> implements OnInit {
  private translatedData: any
  public criteria: ParameterSearchCriteria = {}
  public helpArticleId = 'PAGE_PARAMETERS_SEARCH'
  public actions$: Observable<Action[]> | undefined
  public products$: Observable<Product[]> | undefined
  public criteriaGroup!: UntypedFormGroup
  public applicationIds: String[] = []
  public productOptions: SelectItem[] = []

  constructor(
    private readonly messageService: PortalMessageService,
    private translateService: TranslateService,
    private readonly parametersApi: ParametersAPIService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly fb: UntypedFormBuilder
  ) {
    super()
  }

  public ngOnInit(): void {
    this.loadTranslations()
    this.searchData(this.criteria!)
    this.prepareActionButtons()
    this.initializeForm()
    this.getAllProductNamesAndApplicationIds()
    this.criteriaGroup.valueChanges.subscribe((v) => {
      this.criteria = { ...v }
    })
  }

  public search(mode: 'basic' | 'advanced'): Observable<ApplicationParameter[]> {
    return this.parametersApi
      .searchApplicationParametersByCriteria({
        parameterSearchCriteria: { ...this.criteria }
      })
      .pipe(
        finalize(() => (this.searchInProgress = false)),
        tap({
          next: (data: any) => {
            if (data.totalElements == 0) {
              this.messageService.success({
                summaryKey: this.translatedData['SEARCH.MSG_NO_RESULTS']
              })
              return data.size
            }
          },
          error: (err) => {
            this.messageService.error({
              summaryKey: this.translatedData['SEARCH.MSG_SEARCH_FAILED']
            })
          }
        }),
        map((data: any) => data.stream)
      )
  }

  public reset(): void {
    this.results = []
    this.criteriaGroup.reset()
    this.criteriaGroup.controls['applicationId'].disable()
  }

  public searchData(criteria: ParameterSearchCriteria): void {
    this.searchInProgress = true
    this.criteria = criteria
    const obs$ = this.search('basic')
    obs$.subscribe((data) => {
      this.results = data
    })
  }

  compareProductNames(nameOne: string, nametwo: string): number {
    if (nameOne < nametwo) {
      return -1
    } else if (nameOne > nametwo) {
      return 1
    } else return 0
  }

  public deleteParameter(id: string): void {
    this.parametersApi.deleteParameter({ id }).subscribe(
      () => {
        this.messageService.success({
          summaryKey: this.translatedData['PARAMETER_DELETE.DELETE_SUCCESS']
        })
        this.searchData(this.criteria!)
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
    this.actions$ = this.translateService.get(['CREATE.CREATE_PARAMETER']).pipe(
      map((data) => {
        return [
          {
            label: data['CREATE.CREATE_PARAMETER'],
            title: data['CREATE.CREATE_PARAMETER'],
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
    this.products$ = this.parametersApi.getAllApplications().pipe(
      tap((data) => {
        this.productOptions = []
        data.sort((a, b) => this.compareStrings(a.productName!, b.productName!)).unshift({ productName: '' })
        data.map((p) =>
          this.productOptions.push({
            title: p.productName,
            value: p.productName
          })
        )
      })
    )
    this.products$!.subscribe()
  }

  public async updateApplicationIds(productName: String) {
    await lastValueFrom(this.products$!)
      .then((data) => {
        this.applicationIds = []
        this.criteriaGroup.controls['applicationId'].reset()
        data.map((p) => {
          if (p.productName === productName && p.applications) {
            this.applicationIds = p.applications!
            this.applicationIds.unshift('')
          }
        })
      })
      .finally(() => {
        if (this.applicationIds.length > 0) {
          this.criteriaGroup.controls['applicationId'].enable()
        } else {
          this.criteriaGroup.controls['applicationId'].disable()
        }
      })
  }
  compareStrings(a: String, b: String): number {
    if (a < b) {
      return -1
    } else if (a > b) {
      return 1
    } else return 0
  }
}
