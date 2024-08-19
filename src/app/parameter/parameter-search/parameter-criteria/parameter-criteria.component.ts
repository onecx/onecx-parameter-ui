import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { SelectItem } from 'primeng/api'
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs'

import { Action, UserService } from '@onecx/portal-integration-angular'

import { ParametersAPIService, ParameterSearchCriteria, Product } from 'src/app/shared/generated'
import { dropDownSortItemsByLabel } from 'src/app/shared/utils'

export interface ParameterCriteriaForm {
  applicationId: FormControl<string | null>
  productName: FormControl<string | null>
  key: FormControl<string | null>
}

@Component({
  selector: 'app-parameter-criteria',
  templateUrl: './parameter-criteria.component.html',
  styleUrls: ['./parameter-criteria.component.scss']
})
export class ParameterCriteriaComponent implements OnInit {
  @Input() public actions: Action[] = []
  @Output() public criteriaEmitter = new EventEmitter<ParameterSearchCriteria>()
  @Output() public resetSearchEmitter = new EventEmitter<boolean>()

  public products$: Observable<Product[]> | undefined
  public displayCreateDialog = false
  public parameterCriteria!: FormGroup<ParameterCriteriaForm>
  public productOptions: SelectItem[] = []
  public applicationIds: SelectItem[] = []

  constructor(
    private user: UserService,
    public translate: TranslateService,
    private readonly parametersApi: ParametersAPIService
  ) {}

  ngOnInit(): void {
    this.parameterCriteria = new FormGroup<ParameterCriteriaForm>({
      productName: new FormControl<string | null>(null),
      applicationId: new FormControl<string | null>(null),
      key: new FormControl<string | null>(null)
    })
    this.getUsedProductNamesAndApplicationIds()
  }

  private getUsedProductNamesAndApplicationIds(): void {
    this.products$ = this.parametersApi.getAllApplications()

    this.products$
      .pipe(
        catchError((err) => {
          console.error('getAllApplications', err)
          return of([])
        }),
        map((data) => {
          return data.map(
            (product: Product) =>
              ({
                label: product.productName,
                value: product.productName
              }) as SelectItem
          )
        })
      )
      .subscribe((productOptions: SelectItem[]) => {
        this.productOptions = productOptions
      })
  }

  public async updateApplicationIds(productName: string) {
    await lastValueFrom(this.products$!).then((data) => {
      this.applicationIds = []
      this.parameterCriteria.controls['applicationId'].reset()
      data.map((p) => {
        if (p.productName === productName && p.applications) {
          p.applications.forEach((app) => {
            this.applicationIds.push({
              label: app,
              value: app
            })
          })
        }
      })
    })
    this.applicationIds.sort(dropDownSortItemsByLabel) // does not work
  }

  public submitCriteria(): void {
    const criteriaRequest: ParameterSearchCriteria = {
      productName:
        this.parameterCriteria.value.productName === null ? undefined : this.parameterCriteria.value.productName,
      applicationId:
        this.parameterCriteria.value.applicationId === null ? undefined : this.parameterCriteria.value.applicationId,
      key: this.parameterCriteria.value.key === null ? undefined : this.parameterCriteria.value.key
    }
    this.criteriaEmitter.emit(criteriaRequest)
  }

  public resetCriteria(): void {
    this.parameterCriteria.reset()
    this.resetSearchEmitter.emit(true)
  }
}
