import { Component, OnInit, ViewChild } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { provideParent, PortalSearchPage, Action } from '@onecx/portal-integration-angular'

import { MessageService } from 'primeng/api'
import { finalize, map, tap } from 'rxjs/operators'
import { CriteriaComponent } from './criteria/criteria.component'
import { Observable } from 'rxjs'
import {
  ApplicationParameter,
  ApplicationParameterHistoryCriteria,
  ParametersAPIService
} from 'src/app/shared/generated'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-parameter-search',
  templateUrl: './parameter-search.component.html',
  styleUrls: ['./parameter-search.component.scss'],
  providers: [provideParent(ParameterSearchComponent)]
})
export class ParameterSearchComponent extends PortalSearchPage<ApplicationParameter> implements OnInit {
  private translatedData: any
  public criteria: ApplicationParameterHistoryCriteria | undefined
  public helpArticleId = 'PAGE_PARAMETERS_SEARCH'
  public actions$: Observable<Action[]> | undefined

  @ViewChild(CriteriaComponent)
  criteriaComponent: CriteriaComponent | undefined

  constructor(
    private readonly messageService: MessageService,
    private translateService: TranslateService,
    private readonly parametersApi: ParametersAPIService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super()
  }

  public ngOnInit(): void {
    this.loadTranslations()
    this.searchData(this.criteria!)
    this.prepareActionButtons()
  }

  public search(mode: 'basic' | 'advanced'): Observable<ApplicationParameter[]> {
    return this.parametersApi.getAllApplicationParameters({ ...this.criteria }).pipe(
      finalize(() => (this.searchInProgress = false)),
      tap({
        next: (data: any) => {
          if (data.totalElements == 0) {
            this.messageService.add({
              severity: 'success',
              summary: this.translatedData['SEARCH.MSG_NO_RESULTS']
            })
            return data.size
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translatedData['SEARCH.MSG_SEARCH_FAILED']
          })
        }
      }),
      map((data: any) => data.stream)
    )
  }

  public reset(): void {
    this.results = []
  }

  public searchData(criteria: ApplicationParameterHistoryCriteria): void {
    this.searchInProgress = true
    this.criteria = criteria
    const obs$ = this.search('basic')
    obs$.subscribe((data) => {
      this.results = data
    })
  }

  public deleteParameter(id: string): void {
    this.parametersApi.deleteParameter({ id }).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translatedData['PARAMETER_DELETE.DELETE_SUCCESS']
        })
        this.searchData(this.criteria!)
      },
      () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translatedData['PARAMETER_DELETE.DELETE_ERROR']
        })
      }
    )
  }

  private loadTranslations(): void {
    this.translateService
      .get([
        'SEARCH.PARAMETER_SEARCH',
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
            permission: 'ANNOUNCEMENT#EDIT'
          }
        ]
      })
    )
  }
}
