import { Component, EventEmitter, Input, Output } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { catchError, finalize, map, Observable, of } from 'rxjs'

import { Parameter, History, HistoriesAPIService, HistoryCriteria } from 'src/app/shared/generated'

@Component({
  selector: 'app-parameter-history',
  templateUrl: './parameter-history.component.html',
  styleUrls: ['./parameter-history.component.scss']
})
export class ParameterHistoryComponent {
  @Input() public displayDialog = false
  @Input() public parameter: Parameter | undefined
  @Input() public dateFormat: string | undefined = undefined
  @Output() public hideDialog = new EventEmitter()

  public loading = false
  public exceptionKey: string | undefined = undefined
  public data$: Observable<History[]> = of([])

  constructor(
    private readonly translate: TranslateService,
    private readonly historyApiService: HistoriesAPIService
  ) {}

  public onDialogHide() {
    this.hideDialog.emit()
  }

  /****************************************************************************
   *  SEARCH history data
   */
  public onSearch(criteria: HistoryCriteria): void {
    if (!criteria.name || !criteria.productName || !criteria.applicationId) {
      console.error('Missing search criteria for getting parameter history', criteria)
      return
    }
    this.loading = true
    this.data$ = this.historyApiService.getAllHistory({ historyCriteria: criteria }).pipe(
      map((results) => results.stream ?? []),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.HISTORY'
        console.error('getAllHistory', err)
        return of([])
      }),
      finalize(() => (this.loading = false))
    )
  }

  /*
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
*/
}
