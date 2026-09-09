import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { SelectItem } from 'primeng/api'

import { Action, AngularAcceleratorModule } from '@onecx/angular-accelerator'

import { ParameterSearchCriteria } from 'src/app/shared/generated'
import { Utils } from 'src/app/shared/utils'
import { ExtendedProduct } from '../parameter-search/parameter-search.component'
import { TooltipModule } from 'primeng/tooltip'
import { FloatLabelModule } from 'primeng/floatlabel'
import { SelectModule } from 'primeng/select'

export interface CriteriaForm {
  applicationId: FormControl<string | null>
  productName: FormControl<string | null>
  name: FormControl<string | null>
}

@Component({
  selector: 'app-parameter-criteria',
  templateUrl: './parameter-criteria.component.html',
  styleUrls: ['./parameter-criteria.component.scss'],
  imports: [
    AngularAcceleratorModule,
    TranslateModule,
    TooltipModule,
    FloatLabelModule,
    SelectModule,
    ReactiveFormsModule
  ]
})
export class ParameterCriteriaComponent implements OnChanges {
  @Input() public type = 'PARAMETER'
  @Input() public actions: Action[] = []
  @Input() public usedProducts: ExtendedProduct[] = [] // products used with data
  @Output() public searchEmitter = new EventEmitter<ParameterSearchCriteria>()
  @Output() public resetSearchEmitter = new EventEmitter<boolean>()

  public criteriaForm: FormGroup<CriteriaForm>
  public productOptions: SelectItem[] = []
  public appOptions: SelectItem[] = []

  constructor(public readonly translate: TranslateService) {
    this.criteriaForm = new FormGroup<CriteriaForm>({
      productName: new FormControl<string | null>(null),
      applicationId: new FormControl<string | null>(null),
      name: new FormControl<string | null>(null)
    })
  }

  public ngOnChanges(): void {
    this.productOptions = []
    if (this.usedProducts && this.usedProducts.length > 0) {
      this.productOptions = this.usedProducts.map((p) => ({ label: p.displayName, value: p.name }))
    }
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
    this.appOptions = []
    this.criteriaForm.controls['applicationId'].setValue(null)
    if (!name || !this.usedProducts) return
    this.usedProducts
      .filter((p) => p.name === name)
      .forEach((p) => {
        p.applications?.forEach((app) => {
          this.appOptions.push({ label: app.appName, value: app.appId })
        })
      })
    this.appOptions.sort(Utils.dropDownSortItemsByLabel)
  }
}
