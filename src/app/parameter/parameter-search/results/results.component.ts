import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Column } from '@onecx/portal-integration-angular'
import { SelectItem } from 'primeng/api'
import { Table } from 'primeng/table'

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  @ViewChild('table', { static: false }) table!: Table

  @Input() public results: any[] = []

  @Output() deleteEvent: EventEmitter<any> = new EventEmitter()

  public translatedData: Record<string, string> | undefined
  public rowsPerPage = 10
  public rowsPerPageOptions = [10, 20, 50]
  public columns: Column[] = [
    {
      field: 'applicationId',
      header: 'APPLICATION_ID',
      active: true,
      translationPrefix: 'APPLICATION_PARAMETER'
    },
    {
      field: 'key',
      header: 'KEY',
      active: true,
      translationPrefix: 'APPLICATION_PARAMETER'
    },
    {
      field: 'setValue',
      header: 'VALUE',
      active: true,
      translationPrefix: 'APPLICATION_PARAMETER'
    },
    {
      field: 'importValue',
      header: 'IMPORT_VALUE',
      active: true,
      translationPrefix: 'APPLICATION_PARAMETER'
    },
    {
      field: 'type',
      header: 'TYPE',
      active: true,
      translationPrefix: 'APPLICATION_PARAMETER'
    }
  ]
  public filteredColumns: Column[] = []

  public deleteDialogVisible = false

  private selectedParameter = null

  private readonly pathToTranslationJSON = 'APPLICATION_PARAMETER.'

  constructor(private readonly translateService: TranslateService) {}

  public getStatusOptions(field: string): SelectItem[] {
    let data: SelectItem<any>[] = []
    Object.values('')
      .filter(isNaN as any)
      .forEach((value) => {
        let selectItem = {
          label: value,
          value: value
        } as SelectItem
        data.push(selectItem)
      })
    return data
  }

  public getSelectedParameter(): any {
    return this.selectedParameter
  }

  public setSelectedParameter(selectedParameter: any): void {
    this.selectedParameter = selectedParameter
  }

  public ngOnInit(): void {
    this.loadTranslations()
    this.filteredColumns = this.columns.filter((a) => {
      return a.active === true
    })
  }

  public onColumnsChange(activeIds: string[]) {
    this.filteredColumns = activeIds.map((id) => this.columns.find((col) => col.field === id)) as Column[]
  }

  public onFilterChange(event: string): void {
    this.table.filterGlobal(event, 'contains')
  }

  public translateTypeField(type: string) {
    if (!type) {
      return this.translatedData!['APPLICATION_PARAMETER.PARAMETER_TYPE.UNAVAILABLE']
    }
    type = type.toUpperCase()
    if (type == null) {
      return this.translatedData!['APPLICATION_PARAMETER.PARAMETER_TYPE.UNAVAILABLE']
    } else {
      return this.translatedData!['APPLICATION_PARAMETER.PARAMETER_TYPE.' + type]
    }
  }

  private loadTranslations(): void {
    this.translateService
      .get([
        'APPLICATION_PARAMETER.PARAMETER_TYPE.UNAVAILABLE',
        'APPLICATION_PARAMETER.PARAMETER_TYPE.STRING',
        'APPLICATION_PARAMETER.PARAMETER_TYPE.NUMBER',
        'APPLICATION_PARAMETER.PARAMETER_TYPE.BOOLEAN',
        'APPLICATION_PARAMETER.PARAMETER_TYPE.JSON'
      ])
      .subscribe((data) => {
        this.translatedData = data
      })
  }
}
