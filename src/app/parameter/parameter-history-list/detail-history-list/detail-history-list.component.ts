import { Component, Input } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { Column } from '@onecx/portal-integration-angular'

import { Parameter } from 'src/app/shared/generated'
import { ExtendedHistory } from '../../parameter-history/parameter-history.component'

type ExtendedColumn = Column & {
  hasFilter?: boolean
  isBoolean?: boolean
  isDate?: boolean
  isDuration?: boolean
  isValue?: boolean
  isText?: boolean
  limit?: boolean
  sort?: boolean
  css?: string
}

@Component({
  selector: 'app-detail-history-list',
  templateUrl: './detail-history-list.component.html'
})
export class DetailHistoryListComponent {
  @Input() public loading = false
  @Input() public exceptionKey: string | undefined = undefined
  @Input() public history: ExtendedHistory | undefined = undefined
  @Input() public parameter: Parameter | undefined = undefined
  @Input() public data: ExtendedHistory[] = []
  @Input() public dateFormat: string | undefined = undefined

  public item4Detail: ExtendedHistory | undefined = undefined
  public displayDetailDialog = false
  public expandedRows: { [s: string]: boolean } = {}
  public filteredColumns: Column[]
  public columns: ExtendedColumn[] = [
    {
      field: 'start',
      header: 'START',
      translationPrefix: 'USAGE',
      active: true,
      isDate: true,
      sort: true
    },
    {
      field: 'displayUsedValue',
      header: 'USED_VALUE',
      translationPrefix: 'USAGE',
      active: true,
      isValue: true,
      css: 'text-center'
    },
    {
      field: 'displayDefaultValue',
      header: 'DEFAULT_VALUE',
      translationPrefix: 'USAGE',
      active: true,
      isValue: true,
      css: 'text-center'
    },
    {
      field: 'equal',
      header: 'EQUAL',
      translationPrefix: 'USAGE',
      active: true,
      css: 'text-center'
    },
    {
      field: 'duration',
      header: 'DURATION',
      translationPrefix: 'USAGE',
      active: false,
      isDuration: true
    },
    {
      field: 'count',
      header: 'COUNT',
      translationPrefix: 'USAGE',
      active: true,
      isText: true,
      css: 'text-center'
    },
    {
      field: 'instanceId',
      header: 'INSTANCE_ID',
      translationPrefix: 'USAGE',
      active: true,
      isText: true,
      sort: true,
      css: 'text-center'
    },
    {
      field: 'creationDate',
      header: 'CREATION_DATE',
      translationPrefix: 'INTERNAL',
      active: false,
      isDate: true,
      sort: true
    }
  ]

  constructor(public readonly translate: TranslateService) {
    this.filteredColumns = this.columns.filter((a) => a.active === true)
  }

  public onCalcDuration(start: string, end: string): string {
    if (!start || start === '' || !end || end === '') return ''
    return new Date(Date.parse(end) - Date.parse(start)).toUTCString().split(' ')[4]
  }

  // Details
  public toJsonFormat(val: any): any {
    return JSON.stringify(val, undefined, 2)
  }
}
