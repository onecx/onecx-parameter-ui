import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'

import { Parameter, HistoryCriteria } from 'src/app/shared/generated'

export interface CriteriaForm {
  name: FormControl<string | undefined>
  productName: FormControl<string | undefined>
  applicationId: FormControl<string | undefined>
}

@Component({
  selector: 'app-parameter-history-criteria',
  templateUrl: './parameter-history-criteria.component.html'
})
export class ParameterHistoryCriteriaComponent implements OnChanges {
  @Input() public parameter: Parameter | undefined = undefined
  @Output() public criteriaEmitter = new EventEmitter<HistoryCriteria>()

  public criteriaForm: FormGroup<CriteriaForm>

  constructor(public readonly translate: TranslateService) {
    this.criteriaForm = new FormGroup<CriteriaForm>({
      name: new FormControl<string | undefined>({ value: undefined, disabled: true }, { nonNullable: true }),
      productName: new FormControl<string | undefined>({ value: undefined, disabled: true }, { nonNullable: true }),
      applicationId: new FormControl<string | undefined>({ value: undefined, disabled: true }, { nonNullable: true })
    })
  }

  public ngOnChanges(): void {
    if (this.parameter) {
      this.criteriaForm.setValue({
        name: this.parameter?.name,
        productName: this.parameter?.productName,
        applicationId: this.parameter?.applicationId
      })
      const criteria: HistoryCriteria = {
        productName: this.criteriaForm.value.productName,
        applicationId: this.criteriaForm.value.applicationId,
        name: this.criteriaForm.value.name
      }
      this.criteriaEmitter.emit(criteria)
    }
  }
}
