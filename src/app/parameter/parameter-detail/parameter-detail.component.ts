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
import { finalize, map, Observable, of } from 'rxjs'
import { SelectItem } from 'primeng/api'

import { PortalMessageService } from '@onecx/angular-integration-interface'

import { Parameter, ParametersAPIService, ParameterCreate, ParameterUpdate } from 'src/app/shared/generated'
import { dropDownSortItemsByLabel } from 'src/app/shared/utils'
import { ChangeMode, ExtendedProduct } from '../parameter-search/parameter-search.component'

type ErrorMessageType = { summaryKey: string; detailKey?: string }
//type FormControlError = { status: FormControlStatus; error: any }

// trim the value (string!) of a form control before passes to the control
const original = DefaultValueAccessor.prototype.registerOnChange
DefaultValueAccessor.prototype.registerOnChange = function (fn) {
  return original.call(this, (value) => {
    const trimmed = value.trim()
    return fn(trimmed)
  })
}

// used only to kick the value field validation
export function TypeValidator(): ValidatorFn {
  return (control: AbstractControl): any => {
    let isValid = false // sonar hack ;-)
    let valueControl: AbstractControl | null
    if (control.parent && control.value) {
      // disable unused fields to prevent validation
      if (['BOOLEAN'].includes(control.value)) {
        valueControl = control.parent.get('valueObject')
        valueControl?.disable()
        valueControl = control.parent.get('value')
        valueControl?.disable()
      }
      if (['NUMBER', 'STRING'].includes(control.value)) {
        valueControl = control.parent.get('valueObject')
        valueControl?.disable()
        valueControl = control.parent.get('value')
        valueControl?.enable()
        valueControl?.updateValueAndValidity()
      }
      if (['OBJECT'].includes(control.value)) {
        valueControl = control.parent.get('valueObject')
        valueControl?.enable()
        valueControl?.updateValueAndValidity() // force value & form validation
        valueControl = control.parent.get('value')
        valueControl?.disable()
      }
      isValid = true
    }
    return isValid
  }
}

// used to validate the value against type NUMBER
export function ValueValidator(): ValidatorFn {
  return (control: AbstractControl): any => {
    if (!control.parent || !control.value) return null

    // get the selected parameter type from form
    const typeControl = control.parent.get('valueType')
    if (!typeControl?.value) return null

    let isValid = true
    if (['NUMBER', 'STRING'].includes(typeControl.value)) {
      const val = control.value as any
      if (val !== undefined && val !== null && ['NUMBER'].includes(typeControl.value)) {
        const flo: any = val * Math.PI // calculate a float number
        isValid = !Number.isNaN(parseFloat(flo))
      }
    }
    return isValid ? null : { pattern: true }
  }
}

export function JsonValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) return null
    let isValid = true
    let ex: any // sonar
    try {
      // control.value is a JavaScript object but in JSON syntax!
      JSON.parse(control.value) // is JSON?
    } catch (e: any) {
      ex = e.toString()
      ex = ex.substring(0, ex.indexOf('at ') - 1) // exclude stack trace
      isValid = false
    }
    return isValid ? null : { pattern: true, error: ex }
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

  // dialog
  public loading = false
  public exceptionKey: string | undefined = undefined
  public logErrors = false
  public test_value = ''
  // form
  public formGroup: FormGroup
  public valueStatus$: Observable<FormControlStatus> = of()
  public valueObjectStatus$: Observable<FormControlStatus> = of()
  public valueObjectError$: Observable<any> = of()
  public valueObjectControl: AbstractControl
  // value lists
  public productOptions: SelectItem[] = []
  public appOptions: SelectItem[] = []
  public valueTypeOptions: SelectItem[] = [
    { label: 'VALUE_TYPE.BOOLEAN', value: 'BOOLEAN' },
    { label: 'VALUE_TYPE.NUMBER', value: 'NUMBER' },
    { label: 'VALUE_TYPE.STRING', value: 'STRING' },
    { label: 'VALUE_TYPE.OBJECT', value: 'OBJECT' }
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
      importValue: new FormControl(null),
      importValueType: new FormControl(null),
      importValueBoolean: new FormControl(false),
      valueBoolean: new FormControl(false)
    }
    // add extra validators with specific update event - do it separately!
    // default update strategy is 'changes' => updateOn: 'change'
    this.formGroup.addControl(
      'value',
      new FormControl(null, {
        validators: Validators.compose([ValueValidator(), Validators.required, Validators.maxLength(5000)])
      })
    )
    this.formGroup.addControl(
      'valueObject',
      new FormControl(null, {
        validators: Validators.compose([JsonValidator(), Validators.required, Validators.maxLength(5000)])
      })
    )
    this.formGroup.addControl(
      'valueType',
      new FormControl(this.valueTypeOptions[2], { validators: Validators.compose([TypeValidator()]) })
    )
    // be informed about invalid content in value fields
    const vField = this.formGroup.get('value')
    if (vField) this.valueStatus$ = vField.statusChanges.pipe(map((s) => s))
    const voField = this.formGroup.get('valueObject')
    if (voField) this.valueObjectStatus$ = voField.statusChanges.pipe(map((s) => s))
    this.valueObjectControl = this.formGroup.controls['valueObject']
    //if (voField) this.valueObjectError$ = of(voField.errors)
    //valueObjectError$
  }

  public ngOnChanges() {
    if (!this.displayDialog) return
    this.exceptionKey = undefined
    // matching mode and given data?
    if ('CREATE' === this.changeMode && this.parameter?.id) return
    if (['EDIT', 'VIEW'].includes(this.changeMode)) {
      if (!this.parameter?.id) return
      else this.getData(this.parameter.id)
    } else this.prepareForm(this.parameter) // CREATE, COPY
    // update dropdown lists
    this.productOptions = this.allProducts.map((p) => ({ label: p.displayName, value: p.name }))
  }

  private prepareForm(data?: Parameter): void {
    this.formGroup.reset()
    if (data) {
      this.onChangeProductName(data?.productName)
      this.formGroup.patchValue(data) // fill what exist
      // clear value field if special type
      if (['boolean', 'object'].includes(typeof data.value)) this.formGroup.controls['value'].setValue(null)
      // manage specifics for value fields
      this.manageValueFormFields(data.value, 'valueType', 'valueBoolean', 'valueObject')
      this.manageValueFormFields(data.importValue, 'importValueType', 'importValueBoolean', 'importValue')
    }
    switch (this.changeMode) {
      case 'COPY':
        this.formGroup.enable()
        break
      case 'CREATE':
        this.formGroup.enable()
        this.formGroup.controls['valueType'].patchValue(this.valueTypeOptions[2].value)
        break
      case 'EDIT':
        this.formGroup.enable()
        // exclude fields from change and validation
        this.formGroup.controls['productName'].disable()
        this.formGroup.controls['applicationId'].disable()
        this.formGroup.controls['name'].disable()
        this.formGroup.controls['importValue'].disable()
        this.formGroup.controls['importValueType'].disable()
        this.formGroup.controls['importValueBoolean'].disable()
        break
      case 'VIEW':
        this.formGroup.disable()
        break
    }
  }

  // find out value type and fill special form fields
  private manageValueFormFields(val: any, typeField: string, booleanField: string, objectField: string): void {
    const type = val !== undefined && val !== null ? typeof val : 'unknown'
    this.formGroup.controls[typeField].setValue(type.toUpperCase())
    if (type === 'boolean') this.formGroup.controls[booleanField].setValue(val)
    if (type === 'object' && val) {
      this.formGroup.controls[objectField].setValue(JSON.stringify(val, undefined, 2))
    }
  }

  /**
   * GET data from service
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
      // prepare parameter value from special form fields
      if (this.changeMode === 'EDIT' && this.parameter?.id) {
        const param: ParameterUpdate = {
          modificationCount: this.parameter.modificationCount,
          displayName: this.formGroup.controls['displayName'].value,
          description: this.formGroup.controls['description'].value,
          value: this.getValue(['valueType', 'value', 'valueBoolean', 'valueObject'])
        }
        this.parameterApi.updateParameter({ id: this.parameter?.id, parameterUpdate: param }).subscribe({
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
        const param: ParameterCreate = {
          name: this.formGroup.controls['name'].value,
          displayName: this.formGroup.controls['displayName'].value,
          description: this.formGroup.controls['description'].value,
          productName: this.formGroup.controls['productName'].value,
          applicationId: this.formGroup.controls['applicationId'].value,
          value: this.getValue(['valueType', 'value', 'valueBoolean', 'valueObject'])
        }
        this.parameterApi.createParameter({ parameterCreate: param }).subscribe({
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
    } else this.logFormErrors()
  }

  private getValue(field: string[]): any {
    let val: any
    switch (this.formGroup.controls[field[0]].value) {
      case 'BOOLEAN':
        val = this.formGroup.controls[field[2]].value
        if (!val) val = false
        break
      case 'OBJECT':
        val = JSON.parse(this.formGroup.controls[field[3]].value)
        break
      case 'NUMBER':
        val = this.formGroup.controls[field[1]].value * 1
        break
      default:
        val = this.formGroup.controls[field[1]].value + ''
    }
    return val
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

  private logFormErrors(): void {
    if (!this.logErrors) return
    Object.keys(this.formGroup.controls).forEach((key) => {
      const ctrlItem = this.formGroup.get(key)
      if (ctrlItem?.errors) {
        Object.keys(ctrlItem.errors).forEach((error) => {
          console.error('form error: ', key, error)
          ctrlItem.markAsTouched()
        })
      }
    })
  }
}
