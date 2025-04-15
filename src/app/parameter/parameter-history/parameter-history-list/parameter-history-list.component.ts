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
  isValue?: boolean
  limit?: boolean
  css?: string
}

@Component({
  selector: 'app-parameter-history-list',
  templateUrl: './parameter-history-list.component.html'
})
export class ParameterHistoryListComponent {
  @Input() public loading = false
  @Input() public exceptionKey: string | undefined = undefined
  @Input() public parameter: Parameter | undefined = undefined
  @Input() public data: History[] = []
  @Input() public dateFormat: string | undefined = undefined

  @ViewChild('dataTable', { static: false }) dataTable: Table | undefined
  public dataViewControlsTranslations$: Observable<DataViewControlTranslations> | undefined

  public columns: ExtendedColumn[] = [
    {
      field: 'intervalStart',
      header: 'INTERVAL_START',
      active: true,
      translationPrefix: 'DIALOG.HISTORY',
      isDate: true
    },
    {
      field: 'intervalEnd',
      header: 'INTERVAL_END',
      active: true,
      translationPrefix: 'DIALOG.HISTORY',
      isDate: true
    },
    {
      field: 'count',
      header: 'COUNT',
      active: true,
      translationPrefix: 'DIALOG.HISTORY',
      css: 'text-center'
    },
    {
      field: 'instanceId',
      header: 'INSTANCE_ID',
      active: true,
      translationPrefix: 'DIALOG.HISTORY',
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
}
