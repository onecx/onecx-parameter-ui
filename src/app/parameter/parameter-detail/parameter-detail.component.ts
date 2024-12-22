import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { finalize } from 'rxjs'
import { SelectItem } from 'primeng/api'

import { PortalMessageService } from '@onecx/portal-integration-angular'

import { Parameter, ParametersAPIService, Product } from 'src/app/shared/generated'
import { dropDownSortItemsByLabel } from 'src/app/shared/utils'
import { ChangeMode } from '../parameter-search/parameter-search.component'

@Component({
  selector: 'app-parameter-detail',
  templateUrl: './parameter-detail.component.html',
  styleUrls: ['./parameter-detail.component.scss']
})
export class ParameterDetailComponent implements OnChanges {
  @Input() public displayDialog = false
  @Input() public changeMode: ChangeMode = 'CREATE'
  @Input() public parameter: Parameter | undefined
  @Input() public allProducts: Product[] = []
  @Input() public dateFormat = 'medium'
  @Output() public hideDialogAndChanged = new EventEmitter<boolean>()

  public loading = false
  public exceptionKey: string | undefined = undefined
  // form
  public formGroup: FormGroup
  public productOptions: SelectItem[] = []
  public appIdOptions: SelectItem[] = []

  constructor(
    private readonly parameterApi: ParametersAPIService,
    private readonly fb: FormBuilder,
    private readonly translate: TranslateService,
    private readonly msgService: PortalMessageService
  ) {
    this.formGroup = fb.nonNullable.group({
      modificationCount: new FormControl(0),
      productName: new FormControl(null, [Validators.required]),
      applicationId: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(255)]),
      displayName: new FormControl(null, [Validators.maxLength(255)]),
      description: new FormControl(null, [Validators.maxLength(255)]),
      value: new FormControl(null, [Validators.maxLength(5000)])
    })
  }

  public ngOnChanges() {
    if (!this.displayDialog) return
    this.exceptionKey = undefined
    // matching mode and given data?
    if ('CREATE' === this.changeMode && this.parameter) return
    if (['EDIT', 'VIEW'].includes(this.changeMode))
      if (!this.parameter) return
      else this.getData(this.parameter?.id)
    else this.prepareForm(this.parameter)
    // update dropdown lists
    this.productOptions = this.allProducts.map((p) => ({ label: p.displayName, value: p.productName }))
  }

  private prepareForm(data?: Parameter): void {
    if (data) {
      this.onChangeProductName(data?.productName)
      this.formGroup.patchValue(data)
    }
    switch (this.changeMode) {
      case 'COPY':
        this.formGroup.enable()
        break
      case 'CREATE':
        this.formGroup.reset()
        this.formGroup.enable()
        break
      case 'EDIT':
        this.formGroup.enable()
        this.formGroup.controls['productName'].disable()
        this.formGroup.controls['applicationId'].disable()
        this.formGroup.controls['name'].disable()
        break
      case 'VIEW':
        this.formGroup.disable()
        break
    }
  }

  /**
   * READING data
   */
  private getData(id?: string): void {
    if (!id) return
    this.loading = true
    this.exceptionKey = undefined
    this.parameterApi
      .getParameterById({ id: id })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => this.prepareForm(data),
        error: (err) => {
          this.formGroup.reset()
          this.formGroup.disable()
          this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PARAMETER'
          this.msgService.error({ summaryKey: this.exceptionKey })
          console.error('getParameterById', err)
        }
      })
  }

  /****************************************************************************
   *  UI Events
   */
  public onDialogHide(changed?: boolean) {
    this.hideDialogAndChanged.emit(changed ?? false)
    this.formGroup.reset()
  }

  // load appId dropdown with app ids from product
  public onChangeProductName(name: string | undefined) {
    this.appIdOptions = []
    this.formGroup.controls['applicationId'].setValue(null)
    if (!name) return
    this.allProducts
      .filter((p) => p.productName === name)
      .forEach((p) => {
        p.applications?.forEach((a) => {
          this.appIdOptions.push({ label: a, value: a })
        })
      })
    this.appIdOptions.sort(dropDownSortItemsByLabel)
  }

  /**
   * SAVING => create or update
   */
  public onSave(): void {
    if (this.formGroup.valid) {
      if (this.changeMode === 'EDIT' && this.parameter?.id) {
        this.parameterApi.updateParameter({ id: this.parameter.id, parameterUpdate: this.formGroup.value }).subscribe({
          next: () => {
            this.msgService.success({ summaryKey: 'ACTIONS.EDIT.MESSAGE.OK' })
            this.onDialogHide(true)
          },
          error: (err) => {
            this.msgService.error({ summaryKey: 'ACTIONS.EDIT.MESSAGE.NOK' })
            console.error('updateParameter', err)
          }
        })
      }
      if (['COPY', 'CREATE'].includes(this.changeMode)) {
        this.parameterApi.createParameter({ parameterCreate: this.formGroup.value }).subscribe({
          next: () => {
            this.msgService.success({ summaryKey: 'ACTIONS.CREATE.MESSAGE.OK' })
            this.onDialogHide(true)
          },
          error: (err) => {
            this.msgService.error({ summaryKey: 'ACTIONS.CREATE.MESSAGE.NOK' })
            console.error('createParameter', err)
          }
        })
      }
    }
  }
}
