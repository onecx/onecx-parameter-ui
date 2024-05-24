import { Component, OnInit } from '@angular/core'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import {
  ApplicationParameter,
  ApplicationParameterHistoryCriteria,
  ParametersAPIService
} from 'src/app/shared/generated'

@Component({
  template: ` <p-table #tab [value]="parameters" responsiveLayout="scroll" [paginator]="true" [rows]="5">
    <ng-template pTemplate="header">
      <tr>
        <th [pSortableColumn]="field">
          {{ 'APPLICATION_PARAMETER.' + sanitizeField(field) | translate }}
          <p-sortIcon [field]="field"></p-sortIcon>
        </th>
        <th style="width:4em"></th>
      </tr>
      <tr>
        <th>
          <input
            pInputText
            type="text"
            (input)="tab.filter('?', field, 'contains')"
            [value]="$any(tab.filters[field])?.value"
            placeholder="{{ 'DIALOG.FILTER_BY' | translate }} {{ field }}"
            class="w-full"
          />
        </th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-parameter>
      <tr>
        <td>{{ parameter[field] }}</td>
        <td>
          <button type="button" pButton icon="pi pi-plus" (click)="selectProduct(parameter)"></button>
        </td>
      </tr>
    </ng-template>
  </p-table>`
})
export class ParameterListComponent implements OnInit {
  parameters: ApplicationParameter[] = []
  field: string = ''

  constructor(
    private readonly parametersApi: ParametersAPIService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit() {
    this.field = this.config.data.field
    let criteria: ApplicationParameterHistoryCriteria = {}
    if (this.config.data.applicationId) {
      criteria.applicationId = this.config.data.applicationId
    }
    this.parametersApi.getAllApplicationParameters(criteria).subscribe((result) => (this.parameters = result.stream!))
  }

  selectProduct(product: ApplicationParameter) {
    this.ref.close(product)
  }

  sanitizeField(field: string): string {
    switch (field) {
      case 'applicationId':
        return 'APPLICATION_ID'
      case 'key':
        return 'KEY'
      default:
        return ''
    }
  }
}
