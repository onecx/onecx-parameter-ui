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
  @Input() public changeMode: ChangeMode = 'CREATE'
  @Input() public displayDialog = false
  @Input() public parameter: Parameter | undefined
  @Input() public allProducts: Product[] = []
  @Output() public hideDialogAndChanged = new EventEmitter<boolean>()

  public loading = false
  public exceptionKey: string | undefined = undefined
  public selectedTabIndex = 0
  public allProductOptions: SelectItem[] = []
  public appIdOptions: SelectItem[] = []
  public formGroup: FormGroup

  constructor(
    private readonly parameterApi: ParametersAPIService,
    private readonly fb: FormBuilder,
    private readonly translate: TranslateService,
    private readonly msgService: PortalMessageService
  ) {
    this.formGroup = fb.nonNullable.group({
      productName: new FormControl(null, [Validators.required]),
      applicationId: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(255)]),
      displayName: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(255)]),
      description: new FormControl(null, [Validators.maxLength(255)]),
      value: new FormControl(null, [Validators.maxLength(5000)])
    })
  }

  public ngOnChanges() {
    if (!this.displayDialog) return
    this.allProductOptions = this.allProducts.map((p) => ({ label: p.displayName, value: p.productName }))
    if (['EDIT', 'VIEW'].includes(this.changeMode)) this.getData(this.parameter?.id)
    else this.prepareForm(this.parameter)
  }

  private prepareForm(data?: Parameter): void {
    if (data) this.formGroup.patchValue(data)
    this.formGroup.disable()
    this.formGroup.controls['name'].disable()
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
        break
    }
    this.onChangeProductName(data?.productName)
  }

  private getData(id?: string): void {
    if (!id) return
    this.loading = true
    this.exceptionKey = undefined
    this.parameterApi
      .getParameterById({ id: id })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
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
  public onDialogHide() {
    this.formGroup.reset()
    this.displayDialog = false
    this.hideDialogAndChanged.emit(false)
  }

  // load appId dropdown with app ids from product
  public onChangeProductName(name: string | undefined) {
    if (!name) return
    this.formGroup.controls['productName'].setValue(name)
    this.appIdOptions = []
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
    console.log(this.formGroup.value)
    if (this.formGroup.valid) {
      if (this.changeMode === 'EDIT' && this.parameter?.id) {
        this.parameterApi.updateParameter({ id: this.parameter.id, parameterUpdate: this.formGroup.value }).subscribe({
          next: () => {
            this.msgService.success({ summaryKey: 'ACTIONS.EDIT.MESSAGE.OK' })
            this.displayDialog = false
            this.hideDialogAndChanged.emit(true)
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
            this.hideDialogAndChanged.emit(true)
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
