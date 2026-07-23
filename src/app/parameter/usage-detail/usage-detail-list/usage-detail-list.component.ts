import { Component, Input } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { Parameter } from 'src/app/shared/generated'
import { SharedModule } from 'src/app/shared/shared.module'
import { ExtendedHistory } from '../../usage-search/usage-search.component'

interface Column {
  field: string
  header: string
  [key: string]: unknown
}

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
  selector: 'app-usage-detail-list',
  templateUrl: './usage-detail-list.component.html',
  imports: [AngularAcceleratorModule, SharedModule]
})
export class UsageDetailListComponent {
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
      css: 'text-center hidden lg:table-cell'
    },
    {
      field: 'equal',
      header: 'EQUAL',
      translationPrefix: 'USAGE',
      active: true,
      css: 'text-center hidden lg:table-cell'
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
      css: 'text-center hidden xl:table-cell'
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
    this.filteredColumns = this.columns.filter((a) => a['active'] === true)
  }

  public onCalcDuration(start: string, end: string): string {
    if (!start || start === '' || !end || end === '') return ''
    return new Date(Date.parse(end) - Date.parse(start)).toUTCString().split(' ')[4]
  }

  // display pretty JSON
  public toJsonFormat(val: any): any {
    return JSON.stringify(val, undefined, 2)
  }
}
