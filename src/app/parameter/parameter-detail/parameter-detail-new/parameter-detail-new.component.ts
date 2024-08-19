import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { finalize } from 'rxjs'
import { SelectItem } from 'primeng/api'

import { PortalMessageService } from '@onecx/portal-integration-angular'
import { ApplicationParameter, ParametersAPIService } from 'src/app/shared/generated'

@Component({
  selector: 'app-parameter-detail-new',
  templateUrl: './parameter-detail-new.component.html',
  styleUrls: ['./parameter-detail-new.component.scss']
})
export class ParameterDetailNewComponent implements OnChanges {
  @Input() public changeMode = 'NEW'
  @Input() public displayDetailDialog = false
  @Input() public parameter: ApplicationParameter | undefined
  @Input() public allProducts: SelectItem[] = []
  @Input() public allApps: SelectItem[] = []
  @Output() public hideDialogAndChanged = new EventEmitter<boolean>()

  parameterId: string | undefined
  parameterDeleteVisible = false
  workspaces: SelectItem[] = []
  products: SelectItem[] = []
  public applicationIds: SelectItem[] = []
  public isLoading = false
  // form
  formGroup: FormGroup

  constructor(
    private parameterApi: ParametersAPIService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private msgService: PortalMessageService
  ) {
    this.formGroup = fb.nonNullable.group({
      productName: new FormControl(null, [Validators.required]),
      applicationId: new FormControl(null, [Validators.required]),
      key: new FormControl(null, [Validators.required]),
      setValue: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      unit: new FormControl(null),
      rangeFrom: new FormControl(null),
      rangeTo: new FormControl(null)
    })
  }

  ngOnChanges() {
    console.log('PARAM', this.parameter)
    if (this.changeMode === 'EDIT') {
      this.parameterId = this.parameter?.id
      this.getParameter()
    }
    if (this.changeMode === 'NEW') {
      this.parameterId = undefined
      if (this.parameter) {
        this.fillForm() // on COPY
      } else {
        this.formGroup.reset()
      }
    }
  }

  public async updateApplicationIds(productName: string) {
    // await lastValueFrom(this.allProducts!).then((data) => {
    //   this.applicationIds = []
    //   this.formGroup.controls['applicationId'].reset()
    //   if (data.stream) {
    //     data.stream.map((p) => {
    //       if (p.productName === productName && p.applications) {
    //         this.applicationIds = p.applications!
    //         this.applicationIds.unshift('')
    //       }
    //     })
    //   }
    // })
  }

  public onDialogHide() {
    this.displayDetailDialog = false
    this.hideDialogAndChanged.emit(false)
  }

  /**
   * READING data
   */
  private getParameter(): void {
    if (this.parameterId) {
      this.isLoading = true
      this.parameter = undefined
      this.parameterApi
        .getParameterById({ id: this.parameterId })
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (item) => {
            this.parameter = item
            this.fillForm()
          },
          error: () => this.msgService.error({ summaryKey: 'ACTIONS.SEARCH.SEARCH_FAILED' })
        })
    }
  }

  private fillForm(): void {
    this.formGroup.patchValue({
      ...this.parameter
    })
    // if (!this.parameter?.applicationId) this.formGroup.controls['workspaceName'].setValue('all')
    // if (!this.parameter?.productName) this.formGroup.controls['productName'].setValue('all')
  }

  /**
   * SAVING => create or update
   */
  public onSave(): void {
    if (this.formGroup.errors?.['dateRange']) {
      this.msgService.warning({
        summaryKey: 'VALIDATION.ERRORS.INVALID_DATE_RANGE'
      })
    } else if (this.formGroup.valid) {
      if (this.changeMode === 'EDIT' && this.parameterId) {
        this.parameterApi
          .updateParameterValue({
            id: this.parameterId,
            applicationParameterUpdate: this.submitFormValues()
          })
          .subscribe({
            next: () => {
              this.msgService.success({ summaryKey: 'ACTIONS.EDIT.MESSAGE.OK' })
              this.hideDialogAndChanged.emit(true)
            },
            error: () => this.msgService.error({ summaryKey: 'ACTIONS.EDIT.MESSAGE.NOK' })
          })
      } else if (this.changeMode === 'NEW') {
        this.parameterApi
          .createParameterValue({
            applicationParameterCreate: this.submitFormValues()
          })
          .subscribe({
            next: () => {
              this.msgService.success({ summaryKey: 'ACTIONS.CREATE.MESSAGE.OK' })
              this.hideDialogAndChanged.emit(true)
            },
            error: () => this.msgService.error({ summaryKey: 'ACTIONS.CREATE.MESSAGE.NOK' })
          })
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private submitFormValues(): any {
    const parameter: ApplicationParameter = { ...this.formGroup.value }
    // if (parameter.appId === 'all') parameter.appId = undefined
    // if (parameter.productName === 'all') parameter.productName = undefined
    return parameter
  }
}
