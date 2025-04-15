import { Component, EventEmitter, Input, Output } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { catchError, finalize, map, Observable, of } from 'rxjs'

import { Parameter, History, HistoriesAPIService, HistoryCriteria } from 'src/app/shared/generated'

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
}
