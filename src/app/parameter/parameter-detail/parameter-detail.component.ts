import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import {
  AbstractControl,
  DefaultValueAccessor,
  FormControl,
  FormGroup,
  FormControlStatus,
  Validators,
  ValidatorFn
} from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { finalize, map, Observable } from 'rxjs'
import { SelectItem } from 'primeng/api'

import { PortalMessageService } from '@onecx/portal-integration-angular'

import { Parameter, ParametersAPIService } from 'src/app/shared/generated'
import { dropDownSortItemsByLabel } from 'src/app/shared/utils'
import { ChangeMode, ExtendedProduct } from '../parameter-search/parameter-search.component'

type ErrorMessageType = { summaryKey: string; detailKey?: string }
export type ExtendedSelectItem = SelectItem & { title_key: string }

// trim the value (string!) of a form control before passes to the control
const original = DefaultValueAccessor.prototype.registerOnChange
DefaultValueAccessor.prototype.registerOnChange = function (fn) {
  return original.call(this, (value) => {
    const trimmed = value.trim()
    return fn(trimmed)
  })
}

// used only to validate the value against types [NUMBER | STRING]
export function ValueValidator(): ValidatorFn {
  return (control: AbstractControl): any | null => {
    if (!control.parent || !control || !control.value) return null
    let isValid = true
    const val = control.value as string
    // get the parameter value
    const typeControl = control.parent.get('valueType')
    if (!typeControl || !typeControl?.value) return null
    const type = typeControl?.value.toUpperCase()

    if (val === undefined || val === null) return null
    if (type === 'NUMBER') isValid = Number.isFinite(val)
    console.log('TypeValidator type  value  valid?', type, val, isValid)

    if (isValid) {
      return null // Validation passes
    } else {
      return { pattern: true } // Validation fails
    }
  }
}
// used only to validate the value against types [NUMBER | STRING]
export function TypeValidator(): ValidatorFn {
  return (control: AbstractControl): any | null => {
    if (!control.parent || !control || !control.value) return null
    let isValid = true
    const type = control?.value.toUpperCase()
    // get the parameter value
    const valControl = control.parent.get('value')
    if (!valControl || !valControl.value || valControl.value === null) return null
    const val = valControl?.value
    valControl.updateValueAndValidity() // force validation

    if (val === undefined || val === null) return null
    if (type === 'NUMBER') isValid = Number.isFinite(val)
    console.log('TypeValidator type  value  valid?', type, val, isValid)

    if (isValid) {
      return null // Validation passes
    } else {
      return { pattern: true } // Validation fails
    }
  }
}
export function JsonValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let isValid = false
    const value = control.value as string
    if (!value || value === '' || value === '{}') isValid = true
    else {
      const pattern = /:\s*(["{].*["}])\s*[,}]/
      isValid = pattern.test(value)
    }
    if (isValid) {
      return null // Validation passes
    } else {
      return { pattern: true } // Validation fails
    }
  }
}

@Component({
  selector: 'app-parameter-detail',
  templateUrl: './parameter-detail.component.html',
  styleUrls: ['./parameter-detail.component.scss']
})
export class ParameterDetailComponent implements OnChanges {
  @Input() public displayDialog = false
  @Input() public changeMode: ChangeMode = 'CREATE'
  @Input() public parameter: Parameter | undefined
  @Input() public allProducts: ExtendedProduct[] = []
  @Input() public dateFormat = 'medium'
  @Output() public hideDialogAndChanged = new EventEmitter<boolean>()

  public loading = false
  public exceptionKey: string | undefined = undefined
  public formStatus$: Observable<FormControlStatus>

  // form
  public formGroup: FormGroup
  public productOptions: SelectItem[] = []
  public appOptions: SelectItem[] = []
  // value
  public valueTypeOptions: ExtendedSelectItem[] = [
    { label: 'VALUE_TYPE.BOOLEAN', title_key: 'VALUE_TYPE.TOOLTIPS.BOOLEAN', value: 'BOOLEAN' },
    { label: 'VALUE_TYPE.NUMBER', title_key: 'VALUE_TYPE.TOOLTIPS.NUMBER', value: 'NUMBER' },
    { label: 'VALUE_TYPE.STRING', title_key: 'VALUE_TYPE.TOOLTIPS.STRING', value: 'STRING' },
    { label: 'VALUE_TYPE.OBJECT', title_key: 'VALUE_TYPE.TOOLTIPS.OBJECT', value: 'OBJECT' }
  ]

  constructor(
    private readonly parameterApi: ParametersAPIService,
    private readonly translate: TranslateService,
    private readonly msgService: PortalMessageService
  ) {
    this.formGroup = new FormGroup({})
    this.formGroup.controls = {
      modificationCount: new FormControl(0),
      productName: new FormControl(null, [Validators.required]),
      applicationId: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(255)]),
      displayName: new FormControl(null, [Validators.maxLength(255)]),
      description: new FormControl(null, [Validators.maxLength(255)]),
      importValue: new FormControl(null, [Validators.maxLength(5000)]),
      valueBoolean: new FormControl(false),
      //valueType: new FormControl(null),
      valueObject: new FormControl(null, {
        validators: Validators.compose([JsonValidator(), Validators.maxLength(5000)]),
        updateOn: 'change'
      })
    }
    this.formGroup.addControl(
      'value',
      new FormControl(null, {
        validators: Validators.compose([ValueValidator()]),
        updateOn: 'blur'
      })
    )
    // this.formGroup.controls['valueType'].setValidators(Validators.compose([TypeValidator()]))
    this.formGroup.addControl(
      'valueType',
      new FormControl(null, {
        validators: Validators.compose([TypeValidator()]),
        updateOn: 'change'
      })
    )
    this.formStatus$ = this.formGroup.statusChanges.pipe(map((s) => s))
  }

  public ngOnChanges() {
    if (!this.displayDialog) return
    this.exceptionKey = undefined
    // matching mode and given data?
    if ('CREATE' === this.changeMode && this.parameter?.id) return
    if (['EDIT', 'VIEW'].includes(this.changeMode)) {
      if (!this.parameter?.id) return
      else this.getData(this.parameter?.id)
    } else this.prepareForm(this.parameter)
    // update dropdown lists
    this.productOptions = this.allProducts.map((p) => ({ label: p.displayName, value: p.name }))
  }

  // check value maatches the selected type
  public onValueTypeChange(val: any): void {
    if (['COPY', 'CREATE'].includes(this.changeMode)) {
      let t = 'STRING'
      if (val === undefined || val === null) t = 'STRING'
      if (val === true || val === false) t = 'BOOLEAN'
      if (Number.isFinite(val)) t = 'NUMBER'
      if (typeof val === 'object') t = 'OBJECT'
      console.log('detectValueType', val, typeof val, t)
      if (this.formGroup.controls['valueType'].value !== t) this.formGroup.valid
    }
  }

  private prepareForm(data?: Parameter): void {
    if (data) {
      this.onChangeProductName(data?.productName)
      this.formGroup.patchValue(data)
      // manage specifics
      this.formGroup.controls['valueType'].setValue((typeof data.value).toUpperCase())
      if (typeof data.value === 'boolean') this.formGroup.controls['valueBoolean'].setValue(data.value)
      if (typeof data.value === 'object') this.formGroup.controls['valueObject'].setValue(data.value)
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
        this.formGroup.controls['importValue'].disable()
        this.formGroup.controls['valueType'].disable()
        break
      case 'VIEW':
        this.formGroup.disable()
        break
    }
  }

  /**
   * READING data
   */
  private getData(id: string): void {
    this.loading = true
    this.exceptionKey = undefined
    this.parameterApi
      .getParameterById({ id: id })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.parameter = data
          this.prepareForm(data)
        },
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
    this.appOptions = []
    this.formGroup.controls['applicationId'].setValue(null)
    if (!name) return
    this.allProducts
      .filter((p) => p.name === name)
      .forEach((p) => {
        p.applications?.forEach((app) => {
          this.appOptions.push({ label: app.appName, value: app.appId })
        })
      })
    this.appOptions.sort(dropDownSortItemsByLabel)
  }

  /**
   * SAVING => create or update
   */
  public onSave(): void {
    if (this.formGroup.valid) {
      if (this.changeMode === 'EDIT' && this.parameter?.id) {
        this.parameterApi.updateParameter({ id: this.parameter?.id, parameterUpdate: this.formGroup.value }).subscribe({
          next: () => {
            this.msgService.success({ summaryKey: 'ACTIONS.EDIT.MESSAGE.OK' })
            this.onDialogHide(true)
          },
          error: (err) => {
            this.createErrorMessage(err)
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
            this.createErrorMessage(err)
            console.error('createParameter', err)
          }
        })
      }
    }
  }

  private createErrorMessage(err: any) {
    let errMsg: ErrorMessageType = { summaryKey: 'ACTIONS.' + this.changeMode + '.MESSAGE.NOK' }
    if (err?.error?.errorCode)
      errMsg = {
        ...errMsg,
        detailKey:
          err?.error?.errorCode === 'PERSIST_ENTITY_FAILED'
            ? 'VALIDATION.ERRORS.PERSIST_ENTITY_FAILED'
            : err.error.errorCode
      }
    this.msgService.error(errMsg)
  }
}
