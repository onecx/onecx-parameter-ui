import { Component, Input } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { Column } from '@onecx/portal-integration-angular'

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

  public filteredColumns: Column[]
  public columns: ExtendedColumn[] = [
    {
      field: 'start',
      header: 'START',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isDate: true
    },
    {
      field: 'duration',
      header: 'DURATION',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isDuration: true
    },
    {
      field: 'count',
      header: 'COUNT',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isText: true,
      css: 'text-center'
    },
    {
      field: 'instanceId',
      header: 'INSTANCE_ID',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isText: true,
      css: 'text-center'
    },
    {
      field: 'usedValue',
      header: 'USED_VALUE',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isValue: true,
      css: 'text-center'
    },
    {
      field: 'defaultValue',
      header: 'DEFAULT_VALUE',
      active: true,
      translationPrefix: 'DIALOG.USAGE',
      isValue: true,
      css: 'text-center'
    },
    {
      field: 'creationDate',
      header: 'CREATION_DATE',
      active: false,
      translationPrefix: 'INTERNAL',
      isDate: true
    }
  ]

  constructor(public readonly translate: TranslateService) {
    this.filteredColumns = this.columns.filter((a) => a.active === true)
  }

  public onCalcDuration(start: string, end: string): string {
    if (!start || start === '' || !end || end === '') return ''
    return new Date(Date.parse(end) - Date.parse(start)).toUTCString().split(' ')[4]
  }
}
