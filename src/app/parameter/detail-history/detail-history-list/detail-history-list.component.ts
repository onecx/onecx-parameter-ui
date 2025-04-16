import { Component, Input, ViewChild } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Table } from 'primeng/table'
import { map, Observable } from 'rxjs'

import { Column, DataViewControlTranslations } from '@onecx/portal-integration-angular'

import { Parameter, History } from 'src/app/shared/generated'

type ExtendedColumn = Column & {
  hasFilter?: boolean
  isBoolean?: boolean
  isDate?: boolean
  isDuration?: boolean
  isValue?: boolean
  isText?: boolean
  limit?: boolean
  css?: string
}

@Component({
  selector: 'app-detail-history-list',
  templateUrl: './detail-history-list.component.html'
})
export class DetailHistoryListComponent {
  @Input() public loading = false
  @Input() public exceptionKey: string | undefined = undefined
  @Input() public parameter: Parameter | undefined = undefined
  @Input() public data: History[] = []
  @Input() public dateFormat: string | undefined = undefined

  @ViewChild('dataTable', { static: false }) dataTable: Table | undefined
  public dataViewControlsTranslations$: Observable<DataViewControlTranslations> | undefined

  public columns: ExtendedColumn[] = [
    {
      field: 'start',
      header: 'START',
      active: true,
      translationPrefix: 'DIALOG.HISTORY',
      isDate: true
    },
    {
      field: 'duration',
      header: 'DURATION',
      active: true,
      translationPrefix: 'DIALOG.HISTORY',
      isDuration: true
    },
    {
      field: 'count',
      header: 'COUNT',
      active: true,
      translationPrefix: 'DIALOG.HISTORY',
      isText: true,
      css: 'text-center'
    },
    {
      field: 'instanceId',
      header: 'INSTANCE_ID',
      active: true,
      translationPrefix: 'DIALOG.HISTORY',
      isText: true,
      css: 'text-center'
    },
    {
      field: 'creationDate',
      header: 'CREATION_DATE',
      active: true,
      translationPrefix: 'INTERNAL',
      isDate: true
    }
  ]

  constructor(public readonly translate: TranslateService) {
    this.prepareDialogTranslations()
  }

  /**
   * Dialog preparation
   */
  private prepareDialogTranslations(): void {
    this.dataViewControlsTranslations$ = this.translate
      .get(['DIALOG.HISTORY.INSTANCE_ID', 'DIALOG.DATAVIEW.FILTER'])
      .pipe(
        map((data) => {
          return {
            filterInputPlaceholder: data['DIALOG.DATAVIEW.FILTER'],
            filterInputTooltip: data['DIALOG.HISTORY.INSTANCE_ID']
          } as DataViewControlTranslations
        })
      )
  }

  public onFilterChange(event: string): void {
    this.dataTable?.filterGlobal(event, 'contains')
  }

  public onCalcDuration(start: string, end: string): string {
    if (!start || start === '' || !end || end === '') return ''
    return new Date(Date.parse(end) - Date.parse(start)).toUTCString().split(' ')[4]
  }
}
