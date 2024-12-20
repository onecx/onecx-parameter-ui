import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { DatePipe } from '@angular/common'
import { TranslateService } from '@ngx-translate/core'
import { finalize } from 'rxjs'

import { PortalMessageService } from '@onecx/portal-integration-angular'
import {
  Parameter,
  History,
  HistoryCriteria,
  HistoriesAPIService,
  HistoryCount,
  ParametersAPIService
} from 'src/app/shared/generated'

@Component({
  selector: 'app-parameter-history',
  templateUrl: './parameter-history.component.html',
  styleUrls: ['./parameter-history.component.scss']
})
export class ParameterHistoryComponent implements OnChanges {
  @Input() public displayDialog = false
  @Input() public parameter: Parameter | undefined
  @Output() public hideDialog = new EventEmitter()

  public loading = false
  public exceptionKey: string | undefined = undefined
  public selectedHistoryParam: History | undefined
  public formGroup: FormGroup
  public parameterForm: UntypedFormGroup = this.initializeForm()
  public translatedData: Record<string, string> | undefined
  public parameterDTO: Parameter | undefined
  public historyArray: any[] = []
  public chartData: any = []
  public data: any
  public chartOptions: any

  constructor(
    private readonly fb: FormBuilder,
    private readonly translate: TranslateService,
    private readonly msgService: PortalMessageService,
    private readonly parameterApiService: ParametersAPIService,
    private readonly historyApiService: HistoriesAPIService,
    private readonly datePipe: DatePipe
  ) {
    this.formGroup = fb.nonNullable.group({
      productName: new FormControl(null, [Validators.required]),
      applicationId: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      displayName: new FormControl(null, [Validators.required]),
      value: new FormControl(null, [Validators.required]),
      description: new FormControl(null)
    })
    this.loadTranslations()
  }

  public ngOnChanges() {
    if (!this.displayDialog) return
    this.getData(this.parameter?.id)
  }

  private initializeForm(): UntypedFormGroup {
    return this.fb.group({
      productName: new UntypedFormControl(null, [Validators.required]),
      applicationId: new UntypedFormControl(null, [Validators.required]),
      name: new UntypedFormControl(null, [Validators.required]),
      value: new UntypedFormControl(null, [Validators.required]),
      description: new UntypedFormControl(null, [Validators.required]),
      unit: new UntypedFormControl(null)
    })
  }

  private getData(id?: string): void {
    if (!id) return
    this.loading = true
    this.exceptionKey = undefined
    this.parameterApiService
      .getParameterById({ id: id })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: Parameter) => {
          //this.parameterDTO = data
          //this.getHistoryArray()
          //this.loadChartData()
        },
        error: (err) => {
          this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PARAMETER'
          this.msgService.error({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.SEARCH_FAILED' })
          console.error('getParameterById', err)
        }
      })
  }

  public getHistoryArray(): void {
    const criteria: HistoryCriteria = {
      applicationId: this.parameterForm.value.applicationId || this.parameterDTO?.applicationId,
      productName: this.parameterForm.value.productName || this.parameterDTO?.productName,
      name: this.parameterForm.value.name || this.parameterDTO?.name
    }
    this.historyApiService.getAllHistory({ historyCriteria: criteria }).subscribe({
      next: (results) => {
        this.historyArray = results.stream as History[]
      },
      error: () => {
        this.msgService.error({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.SEARCH_FAILED' })
      }
    })
  }

  private loadChartData(): void {
    this.historyApiService
      .getCountsByCriteria({
        historyCountCriteria: {
          applicationId: this.parameterDTO?.applicationId,
          productName: this.parameterDTO?.productName,
          name: this.parameterDTO?.name
        }
      })
      .subscribe({
        next: (data) => {
          this.chartData = data
          this.setChartData()
          if (data.length == 0) {
            // this.msgService.success({
            //   summaryKey: 'ACTIONS.SEARCH.MESSAGE.NO_RESULTS'
            // })
          }
        },
        error: () => {
          this.msgService.error({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.SEARCH_FAILED' })
        }
      })
  }

  private setChartData(): void {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary')
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border')
    const dates = this.chartData.map((item1: HistoryCount) => this.datePipe.transform(item1.creationDate, 'medium'))
    const counts = this.chartData.map((item2: HistoryCount) => item2.count)
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

    this.chartOptions = {
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
          ticks: { color: textColorSecondary },
          grid: { color: 'green', drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    }
  }

  public useHistoryParam() {
    this.parameterForm.controls['productName'].setValue(this.selectedHistoryParam?.productName)
    this.parameterForm.controls['applicationId'].setValue(this.selectedHistoryParam?.applicationId)
    this.parameterForm.controls['name'].setValue(this.selectedHistoryParam?.name)
    this.parameterForm.controls['value'].setValue(this.selectedHistoryParam?.usedValue)
  }

  private loadTranslations(): void {
    this.translate
      .get([
        'PARAMETER.APP_ID',
        'PARAMETER.NAME',
        'PARAMETER.VALUE',
        'PARAMETER.DESCRIPTION',
        'CHART.NUMBER_OF_REQUESTS',
        'ACTIONS.SEARCH.MESSAGE.SEARCH_FAILED',
        'ACTIONS.SEARCH.MESSAGE.NO_RESULTS',
        'VALIDATION.ERRORS.FORM_MANDATORY',
        'VALIDATION.ERRORS.EMPTY_REQUIRED_FIELD'
      ])
      .subscribe((data) => {
        this.translatedData = data
      })
  }

  public onDialogHide() {
    this.displayDialog = false
    this.hideDialog.emit()
  }
}
