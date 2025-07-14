import { Component, EventEmitter, Input, Output } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { catchError, finalize, map, Observable, of } from 'rxjs'

import { HistoriesAPIService, HistoryCriteria, HistoryPageResult, Parameter } from 'src/app/shared/generated'
import { displayEqualityState, displayValue, displayValueType } from 'src/app/shared/utils'

import { ExtendedHistory } from '../usage-search/usage-search.component'

@Component({
  selector: 'app-usage-detail',
  templateUrl: './usage-detail.component.html',
  styleUrls: ['./usage-detail.component.scss']
})
export class UsageDetailComponent {
  @Input() public displayDialog = false
  @Input() public history: ExtendedHistory | undefined
  @Input() public parameter: Parameter | undefined
  @Input() public dateFormat: string | undefined = undefined
  @Output() public hideDialog = new EventEmitter()

  // dialog
  public loading = false
  public exceptionKey: string | undefined = undefined
  // data
  public data$: Observable<ExtendedHistory[]> = of([])

  constructor(
    private readonly translate: TranslateService,
    private readonly historyApiService: HistoriesAPIService
  ) {}

  public onDialogHide() {
    this.hideDialog.emit()
  }

  /****************************************************************************
   *  SEARCH usage data
   */
  public onSearch(criteria: HistoryCriteria): void {
    if (!criteria.name || !criteria.productName || !criteria.applicationId) {
      console.error('Missing search criteria for getting parameter usage', criteria)
      return
    }
    this.loading = true
    this.data$ = this.historyApiService.getAllHistory({ historyCriteria: criteria }).pipe(
      map((data: HistoryPageResult) => {
        if (!data.stream) return [] as ExtendedHistory[]
        return data.stream.map(
          (h) =>
            ({
              ...h,
              valueType: displayValueType(h.usedValue),
              defaultValueType: displayValueType(h.defaultValue),
              displayDefaultValue: displayValue(h.defaultValue),
              displayUsedValue: displayValue(h.usedValue),
              isEqual: displayEqualityState(h.usedValue, h.defaultValue)
            }) as ExtendedHistory
        )
      }),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.USAGE'
        console.error('getAllHistory', err)
        return of([])
      }),
      finalize(() => (this.loading = false))
    )
  }
}
