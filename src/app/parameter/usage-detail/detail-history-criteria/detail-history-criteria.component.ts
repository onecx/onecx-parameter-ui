import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'

import { HistoryCriteria, Parameter } from 'src/app/shared/generated'
import { ExtendedHistory } from '../../usage-search/usage-search.component'

export interface CriteriaForm {
  name: FormControl<string | undefined>
  productName: FormControl<string | undefined>
  applicationId: FormControl<string | undefined>
}

@Component({
  selector: 'app-usage-detail-criteria',
  templateUrl: './detail-history-criteria.component.html'
})
export class DetailHistoryCriteriaComponent implements OnChanges {
  @Input() public history: ExtendedHistory | undefined = undefined
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
    if (this.history || this.parameter) {
      this.criteriaForm.setValue({
        name: this.parameter?.name ?? this.history?.name,
        productName: this.parameter?.productName ?? this.history?.productName,
        applicationId: this.parameter?.applicationId ?? this.history?.applicationId
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
