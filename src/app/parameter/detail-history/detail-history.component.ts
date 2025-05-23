import { Component, EventEmitter, Input, Output } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { catchError, finalize, map, Observable, of } from 'rxjs'

import { Parameter, HistoriesAPIService, HistoryCriteria, HistoryPageResult } from 'src/app/shared/generated'
import { displayEqualityState, displayValue, displayValueType } from 'src/app/shared/utils'

import { ExtendedHistory } from '../parameter-history/parameter-history.component'

@Component({
  selector: 'app-detail-history',
  templateUrl: './detail-history.component.html',
  styleUrls: ['./detail-history.component.scss']
})
export class DetailHistoryComponent {
  @Input() public displayDialog = false
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
          (p) =>
            ({
              ...p,
              valueType: displayValueType(p.usedValue),
              defaultValueType: displayValueType(p.defaultValue),
              displayDefaultValue: displayValue(p.defaultValue),
              displayUsedValue: displayValue(p.usedValue),
              isEqual: displayEqualityState(p.usedValue, p.defaultValue)
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
