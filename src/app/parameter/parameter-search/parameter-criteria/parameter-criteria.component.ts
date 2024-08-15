import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { SelectItem } from 'primeng/api'

import { Action, UserService } from '@onecx/portal-integration-angular'
import { ParameterSearchCriteria } from 'src/app/shared/generated'

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
  @Input() public products: SelectItem[] = []
  @Input() public applicationIds: SelectItem[] = []
  @Output() public criteriaEmitter = new EventEmitter<ParameterSearchCriteria>()
  @Output() public resetSearchEmitter = new EventEmitter<boolean>()

  public displayCreateDialog = false
  public parameterCriteria!: FormGroup<ParameterCriteriaForm>

  constructor(
    private user: UserService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.parameterCriteria = new FormGroup<ParameterCriteriaForm>({
      productName: new FormControl<string | null>(null),
      applicationId: new FormControl<string | null>(null),
      key: new FormControl<string | null>(null)
    })
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
