import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { SelectItem } from 'primeng/api'

import { Action } from '@onecx/portal-integration-angular'

import { ParameterSearchCriteria, Product } from 'src/app/shared/generated'
import { dropDownSortItemsByLabel } from 'src/app/shared/utils'

export interface CriteriaForm {
  applicationId: FormControl<string | null>
  productName: FormControl<string | null>
  name: FormControl<string | null>
}

@Component({
  selector: 'app-parameter-criteria',
  templateUrl: './parameter-criteria.component.html',
  styleUrls: ['./parameter-criteria.component.scss']
})
export class ParameterCriteriaComponent implements OnChanges {
  @Input() public actions: Action[] = []
  @Input() public usedProducts: Product[] = [] // products used with data
  @Output() public searchEmitter = new EventEmitter<ParameterSearchCriteria>()
  @Output() public resetSearchEmitter = new EventEmitter<boolean>()

  public criteriaForm: FormGroup<CriteriaForm>
  public productOptions: SelectItem[] = []
  public appIdOptions: SelectItem[] = []

  constructor(public readonly translate: TranslateService) {
    this.criteriaForm = new FormGroup<CriteriaForm>({
      productName: new FormControl<string | null>(null),
      applicationId: new FormControl<string | null>(null),
      name: new FormControl<string | null>(null)
    })
  }

  public ngOnChanges(): void {
    this.productOptions = []
    if (this.usedProducts.length > 0)
      this.productOptions = this.usedProducts.map((p) => ({ label: p.displayName, value: p.productName }) as SelectItem)
  }

  /****************************************************************************
   *  UI Events
   */
  public onSearch(): void {
    const criteriaRequest: ParameterSearchCriteria = {
      productName: this.criteriaForm.value.productName === null ? undefined : this.criteriaForm.value.productName,
      applicationId: this.criteriaForm.value.applicationId === null ? undefined : this.criteriaForm.value.applicationId,
      name: this.criteriaForm.value.name === null ? undefined : this.criteriaForm.value.name
    }
    this.searchEmitter.emit(criteriaRequest)
  }

  public onResetCriteria(): void {
    this.criteriaForm.reset()
    this.resetSearchEmitter.emit(true)
  }

  /* product name was changed to 
     1. null        => clear appid dropdown content and item list
     2. diff. value => clear appid dropdown content and prepare new list
  */
  public onChangeProductName(name: string | null) {
    this.appIdOptions = []
    this.criteriaForm.controls['applicationId'].setValue(null)
    if (!name) return
    this.usedProducts
      .filter((p) => p.productName === name)
      .forEach((p) => {
        p.applications?.forEach((a) => {
          this.appIdOptions.push({ label: a, value: a })
        })
      })
    this.appIdOptions.sort(dropDownSortItemsByLabel)
  }
}
