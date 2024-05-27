/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { PortalMessageService } from '@onecx/portal-integration-angular'

import { finalize } from 'rxjs'
import {
  ApplicationParameter,
  ApplicationParameterCreate,
  ApplicationParameterHistoryCriteria,
  HistoriesAPIService,
  ParametersAPIService
} from 'src/app/shared/generated'

@Component({
  selector: 'app-parameter-detail-form',
  templateUrl: './parameter-detail-form.component.html',
  styleUrls: ['./parameter-detail-form.component.scss']
})
export class ParameterDetailFormComponent implements OnInit {
  @Input()
  public mode!: string
  @Output()
  public formSubmitted: EventEmitter<any> = new EventEmitter()
  public searchInProgress: boolean = false
  public formEnabled: boolean = false
  public parameterId: string = ''
  public parameterForm: UntypedFormGroup = this.initializeForm()
  public translatedData: Record<string, string> | undefined
  public parameterDTO: ApplicationParameter | undefined
  public parameterHistoryArray: any[] = []
  public viewEditButtonName: string = 'GENERAL.SWITCH_TO_EDIT'
  public advancedForm: boolean = false
  public chartData: any = []
  data: any
  options: any

  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: UntypedFormBuilder,
    private readonly messageService: PortalMessageService,
    private readonly translateService: TranslateService,
    private readonly paramterApiService: ParametersAPIService,
    private readonly paramtersHistoryApiService: HistoriesAPIService
  ) {}

  ngOnInit(): void {
    this.loadTranslations()
    if ('edit' === this.mode) {
      this.parameterId = this.route.snapshot.paramMap.get('id') || ''
      this.getParameter(this.parameterId)
      this.disableForm()
    }
  }

  public emitFormUpdate(): void {
    if (this.parameterForm.valid) {
      let parameter: ApplicationParameter = {
        setValue: this.parameterForm.value.value,
        description: this.parameterForm.value.description,
        unit: this.parameterForm.value.unit,
        rangeFrom: this.parameterForm.value.rangeFrom,
        rangeTo: this.parameterForm.value.rangeTo
      }
      let parametterWrapper = {
        id: this.parameterDTO?.id,
        parameter: parameter
      }
      this.formSubmitted.emit(parametterWrapper)
    } else {
      this.displayError()
    }
  }

  public emitFormCreate(): void {
    if (!this.isValidValueType()) {
      this.messageService.error({
        data: this.translatedData!['DETAILS.VALUE_HAS_WRONG_TYPE']
      })
    } else if (this.parameterForm.valid) {
      let parameter: ApplicationParameterCreate = {
        applicationId: this.parameterForm.value.applicationId,
        key: this.parameterForm.value.key,
        value: this.parameterForm.value.value,
        type: this.parameterForm.value.type,
        description: this.parameterForm.value.description,
        unit: this.parameterForm.value.unit,
        rangeFrom: this.parameterForm.value.rangeFrom,
        rangeTo: this.parameterForm.value.rangeTo
      }
      this.formSubmitted.emit(parameter)
    } else {
      this.displayError()
    }
  }

  public getApplicationParameterTypes() {
    let values = Object.keys('')
    if (!this.advancedForm && this.mode !== 'edit') {
      values = values.filter((item) => item !== 'JSON')
    }
    return values
  }

  public switchMode(): void {
    this.formEnabled = !this.formEnabled
    if (this.formEnabled) {
      this.viewEditButtonName = 'GENERAL.SWITCH_TO_VIEW'
      this.parameterForm.controls['value']?.enable()
      this.parameterForm.controls['description']?.enable()
      this.parameterForm.controls['unit']?.enable()
      this.parameterForm.controls['rangeFrom']?.enable()
      this.parameterForm.controls['rangeTo']?.enable()
    } else {
      this.viewEditButtonName = 'GENERAL.SWITCH_TO_EDIT'
      Object.keys(this.parameterForm.controls).forEach((key) => {
        this.parameterForm.controls[key]?.disable()
      })
    }
  }

  public reloadData(): void {
    this.getParameter(this.parameterId)
  }

  public disableForm(): void {
    Object.keys(this.parameterForm.controls).forEach((key) => {
      const control = this.parameterForm.controls[key]
      control.disable()
    })
  }

  private getParameter(aplicationParameterId: string): void {
    this.paramterApiService
      .getParameterById({ id: aplicationParameterId })
      .pipe(finalize(() => (this.searchInProgress = false)))
      .subscribe({
        next: (result: ApplicationParameter) => {
          console.log(JSON.stringify(result))
          this.parameterDTO = result
          this.updateForm(result)
          this.getParameterHistoryArray()
          this.loadChartData()
        },
        error: () => {
          this.messageService.error({
            data: this.translatedData!['SEARCH.MSG_SEARCH_FAILED']
          })
        }
      })
  }

  public getParameterHistoryArray(): void {
    let criteria: ApplicationParameterHistoryCriteria = {
      applicationId: this.parameterForm.value.applicationId,
      key: this.parameterForm.value.key
    }
    this.paramtersHistoryApiService
      .getAllApplicationParametersHistoryLatest({ applicationParameterHistoryCriteria: criteria })
      .pipe(finalize(() => (this.searchInProgress = false)))
      .subscribe({
        next: (results) => {
          this.parameterHistoryArray = results.stream as any[]
        },
        error: () => {
          this.messageService.error({
            data: this.translatedData!['SEARCH.MSG_SEARCH_FAILED']
          })
        }
      })
  }

  private displayError(): void {
    const errors: string[] = []
    Object.keys(this.parameterForm.controls).forEach((key) => {
      if (this.parameterForm.controls[key].invalid) {
        errors.push(this.translatedData![`APPLICATION_PARAMETER.${key.toUpperCase()}`])
      }
    })
    if (errors.length > 0) {
      this.messageService.error({
        data: this.translatedData!['DETAILS.FORM_MANDATORY']
      })
    }
  }

  private isValidValueType(): boolean {
    switch (this.parameterForm.value.type) {
      case 'JSON':
        try {
          JSON.parse(this.parameterForm.value.value)
          return true
        } catch (error) {
          return false
        }
      case 'BOOLEAN':
        if (
          this.parameterForm.value.value.toLowerCase() == 'true' ||
          this.parameterForm.value.value.toLowerCase() == 'false'
        ) {
          return true
        }
        break
      case 'STRING':
        if (typeof this.parameterForm.value.value == 'string') {
          return true
        }
        break
      case 'NUMBER':
        if (!isNaN(this.parameterForm.value.value)) {
          return true
        }
        break
      case 'UNAVAILABLE':
        return false
    }
    return false
  }

  private initializeForm(): UntypedFormGroup {
    return this.fb.group({
      applicationId: new UntypedFormControl(null, [Validators.required]),
      key: new UntypedFormControl(null, [Validators.required]),
      value: new UntypedFormControl(null, [Validators.required]),
      type: new UntypedFormControl(null, [Validators.required]),
      description: new UntypedFormControl(null, [Validators.required]),
      unit: new UntypedFormControl(null),
      rangeFrom: new UntypedFormControl(null),
      rangeTo: new UntypedFormControl(null)
    })
  }

  private updateForm(parameterDTO: ApplicationParameter) {
    this.parameterForm.controls['applicationId'].setValue(parameterDTO.applicationId)
    this.parameterForm.controls['key'].setValue(parameterDTO.key)
    this.parameterForm.controls['value'].setValue(parameterDTO.setValue)
    if (!parameterDTO.type) {
      this.parameterForm.controls['type'].setValue('UNAVAILABLE')
    } else {
      let type = parameterDTO.type.toUpperCase()
      if (parameterDTO.type == null) {
        this.parameterForm.controls['type'].setValue('UNAVAILABLE')
      } else {
        this.parameterForm.controls['type'].setValue(type)
      }
    }
    this.parameterForm.controls['description'].setValue(parameterDTO.description)
    this.parameterForm.controls['unit'].setValue(parameterDTO.unit)
    this.parameterForm.controls['rangeFrom'].setValue(parameterDTO.rangeFrom)
    this.parameterForm.controls['rangeTo'].setValue(parameterDTO.rangeTo)
  }

  private loadChartData(): void {
    this.paramtersHistoryApiService
      .getCountsByCriteria({
        parameterHistoryCountCriteria: {
          applicationId: this.parameterDTO?.applicationId,
          key: this.parameterDTO?.key
        }
      })
      .pipe(finalize(() => (this.searchInProgress = false)))
      .subscribe({
        next: (data) => {
          this.chartData = data
          this.setChartData()
          if (data.length == 0) {
            this.messageService.success({
              data: this.translatedData!['SEARCH.MSG_NO_RESULTS']
            })
          }
        },
        error: () => {
          this.messageService.error({
            data: this.translatedData!['SEARCH.MSG_SEARCH_FAILED']
          })
        }
      })
  }

  private setChartData(): void {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary')
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border')

    const dates = this.chartData.map((item1: any) => item1)
    const counts = this.chartData.map((item2: any) => item2)

    this.data = {
      labels: dates,
      datasets: [
        {
          label: this.translatedData!['CHART.NUMBER_OF_REQUESTS'],
          data: counts,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          tension: 0.4
        }
      ]
    }

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: 'green',
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    }
  }

  private loadTranslations(): void {
    this.translateService
      .get([
        'EDIT.FETCH_ERROR',
        'DETAILS.FORM_MANDATORY',
        'DETAILS.VALUE_HAS_WRONG_TYPE',
        'DETAILS.FORM_KEY_MIN_LEN',
        'APPLICATION_PARAMETER.APPLICATION_ID',
        'APPLICATION_PARAMETER.KEY',
        'APPLICATION_PARAMETER.VALUE',
        'APPLICATION_PARAMETER.DESCRIPTION',
        'CHART.NUMBER_OF_REQUESTS'
      ])
      .subscribe((data) => {
        this.translatedData = data
      })
  }
}
