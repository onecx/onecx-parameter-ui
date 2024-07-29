/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { DatePipe } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { PortalMessageService } from '@onecx/portal-integration-angular'
import { SelectItem } from 'primeng/api'

import { Observable, finalize, lastValueFrom, tap } from 'rxjs'
import {
  ApplicationParameter,
  ApplicationParameterCreate,
  ApplicationParameterHistory,
  ApplicationParameterHistoryCriteria,
  HistoriesAPIService,
  ParameterHistoryCount,
  ParametersAPIService,
  ProductStorePageResult,
  ProductsAPIService
} from 'src/app/shared/generated'

@Component({
  selector: 'app-parameter-detail-form',
  templateUrl: './parameter-detail-form.component.html',
  styleUrls: ['./parameter-detail-form.component.scss']
})
export class ParameterDetailFormComponent implements OnInit {
  public applicationIds: string[] = []
  public productOptions: SelectItem[] = []
  public products$: Observable<ProductStorePageResult> | undefined
  public selectedHistoryParam: ApplicationParameterHistory | undefined
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
  public advancedForm: boolean = false
  public chartData: any = []
  data: any
  options: any
  criteriaGroup: any

  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: UntypedFormBuilder,
    private readonly messageService: PortalMessageService,
    private readonly translateService: TranslateService,
    private readonly paramterApiService: ParametersAPIService,
    private readonly paramtersHistoryApiService: HistoriesAPIService,
    private readonly productsApi: ProductsAPIService,
    private readonly datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadTranslations()
    if ('edit' === this.mode) {
      this.parameterId = this.route.snapshot.paramMap.get('id') || ''
      this.getParameter(this.parameterId)
      this.disableForm()
    } else {
      this.getParameterHistoryArray()
    }
    this.getAllProductNamesAndApplicationIds()
  }

  public emitFormUpdate(): void {
    if (this.parameterForm.valid) {
      const parameter: ApplicationParameter = {
        setValue: this.parameterForm.value.value,
        description: this.parameterForm.value.description,
        unit: this.parameterForm.value.unit,
        rangeFrom: this.parameterForm.value.rangeFrom,
        rangeTo: this.parameterForm.value.rangeTo
      }
      const parametterWrapper = {
        id: this.parameterDTO?.id,
        parameter: parameter
      }
      this.formSubmitted.emit(parametterWrapper)
    } else {
      this.displayError()
    }
  }

  public emitFormCreate(): void {
    if (this.parameterForm.valid) {
      const parameter: ApplicationParameterCreate = {
        productName: this.parameterForm.value.productName,
        applicationId: this.parameterForm.value.applicationId,
        key: this.parameterForm.value.key,
        value: this.parameterForm.value.value,
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

  public reloadData(): void {
    this.getParameter(this.parameterId)
  }

  public disableForm(): void {
    this.parameterForm.controls['productName'].disable()
    this.parameterForm.controls['key'].disable()
    this.parameterForm.controls['applicationId'].disable()
  }

  private getParameter(aplicationParameterId: string): void {
    this.paramterApiService
      .getParameterById({ id: aplicationParameterId })
      .pipe(finalize(() => (this.searchInProgress = false)))
      .subscribe({
        next: (result: ApplicationParameter) => {
          this.parameterDTO = result
          this.updateForm(result)
          this.getParameterHistoryArray()
          this.loadChartData()
        },
        error: () => {
          this.messageService.error({
            summaryKey: this.translatedData!['SEARCH.MSG_SEARCH_FAILED']
          })
        }
      })
  }

  public getParameterHistoryArray(): void {
    const criteria: ApplicationParameterHistoryCriteria = {
      applicationId: this.parameterForm.value.applicationId || this.parameterDTO?.applicationId,
      productName: this.parameterForm.value.productName || this.parameterDTO?.productName,
      key: this.parameterForm.value.key || this.parameterDTO?.key
    }
    this.paramtersHistoryApiService
      .getAllApplicationParametersHistory({ applicationParameterHistoryCriteria: criteria })
      .pipe(finalize(() => (this.searchInProgress = false)))
      .subscribe({
        next: (results) => {
          this.parameterHistoryArray = results.stream as ApplicationParameterHistory[]
        },
        error: () => {
          this.messageService.error({
            summaryKey: this.translatedData!['SEARCH.MSG_SEARCH_FAILED']
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
        summaryKey: this.translatedData!['DETAILS.FORM_MANDATORY']
      })
    }
  }

  private initializeForm(): UntypedFormGroup {
    return this.fb.group({
      productName: new UntypedFormControl(null, [Validators.required]),
      applicationId: new UntypedFormControl(null, [Validators.required]),
      key: new UntypedFormControl(null, [Validators.required]),
      value: new UntypedFormControl(null, [Validators.required]),
      description: new UntypedFormControl(null, [Validators.required]),
      unit: new UntypedFormControl(null),
      rangeFrom: new UntypedFormControl(null),
      rangeTo: new UntypedFormControl(null)
    })
  }

  private updateForm(parameterDTO: ApplicationParameter) {
    this.parameterForm.controls['productName'].setValue(parameterDTO.productName)
    this.parameterForm.controls['applicationId'].setValue(parameterDTO.applicationId)
    this.parameterForm.controls['key'].setValue(parameterDTO.key)
    this.parameterForm.controls['value'].setValue(parameterDTO.setValue)
    this.parameterForm.controls['description'].setValue(parameterDTO.description)
    this.parameterForm.controls['unit'].setValue(parameterDTO.unit)
    this.parameterForm.controls['rangeFrom'].setValue(parameterDTO.rangeFrom)
    this.parameterForm.controls['rangeTo'].setValue(parameterDTO.rangeTo)
    this.parameterForm.valueChanges.subscribe(() => {
      this.formEnabled = true
    })
  }

  private loadChartData(): void {
    this.paramtersHistoryApiService
      .getCountsByCriteria({
        parameterHistoryCountCriteria: {
          applicationId: this.parameterDTO?.applicationId,
          productName: this.parameterDTO?.productName,
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
              summaryKey: this.translatedData!['SEARCH.MSG_NO_RESULTS']
            })
          }
        },
        error: () => {
          this.messageService.error({
            summaryKey: this.translatedData!['SEARCH.MSG_SEARCH_FAILED']
          })
        }
      })
  }

  private setChartData(): void {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary')
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border')
    const dates = this.chartData.map((item1: ParameterHistoryCount) =>
      this.datePipe.transform(item1.creationDate, 'medium')
    )
    const counts = this.chartData.map((item2: ParameterHistoryCount) => item2.count)
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

  private getAllProductNamesAndApplicationIds(): void {
    this.products$ = this.productsApi.searchAllAvailableProducts({ productStoreSearchCriteria: {} }).pipe(
      tap((data) => {
        this.productOptions = []
        if (data.stream) {
          data.stream.sort((a, b) => this.compareStrings(a.productName!, b.productName!)).unshift({ productName: '' })
          data.stream.map((p) =>
            this.productOptions.push({
              title: p.productName,
              value: p.productName
            })
          )
        }
      })
    )
    this.products$!.subscribe()
  }

  public async updateApplicationIds(productName: string) {
    await lastValueFrom(this.products$!).then((data) => {
      this.applicationIds = []
      this.parameterForm.controls['applicationId'].reset()
      if (data.stream) {
        data.stream.map((p) => {
          if (p.productName === productName && p.applications) {
            this.applicationIds = p.applications!
            this.applicationIds.unshift('')
          }
        })
      }
    })
  }
  compareStrings(a: string, b: string): number {
    if (a < b) {
      return -1
    } else if (a > b) {
      return 1
    } else return 0
  }

  public useHistoryParam() {
    this.parameterForm.controls['value'].setValue(this.selectedHistoryParam?.usedValue)
    this.parameterForm.controls['productName'].setValue(this.selectedHistoryParam?.productName)
    this.parameterForm.controls['applicationId'].setValue(this.selectedHistoryParam?.applicationId)
    this.parameterForm.controls['key'].setValue(this.selectedHistoryParam?.key)
  }

  private loadTranslations(): void {
    this.translateService
      .get([
        'EDIT.FETCH_ERROR',
        'DETAILS.FORM_MANDATORY',
        'DETAILS.FORM_KEY_MIN_LEN',
        'APPLICATION_PARAMETER.APPLICATION_ID',
        'APPLICATION_PARAMETER.KEY',
        'APPLICATION_PARAMETER.VALUE',
        'APPLICATION_PARAMETER.DESCRIPTION',
        'CHART.NUMBER_OF_REQUESTS',
        'SEARCH.MSG_SEARCH_FAILED',
        'SEARCH.MSG_NO_RESULTS',
        'VALIDATION.ERRORS.EMPTY_REQUIRED_FIELD'
      ])
      .subscribe((data) => {
        this.translatedData = data
      })
  }
}
