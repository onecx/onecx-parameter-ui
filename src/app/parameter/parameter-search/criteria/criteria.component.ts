import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { MessageService, SelectItem } from 'primeng/api'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { ApplicationParameter, ApplicationParameterHistoryCriteria } from 'src/app/shared/generated'
import { ParameterListComponent } from './parameter-list.component'
import { Action } from '@onecx/portal-integration-angular'

@Component({
  selector: 'app-criteria',
  templateUrl: './criteria.component.html',
  styleUrls: ['./criteria.component.scss']
})
export class CriteriaComponent implements OnInit, OnDestroy {
  public criteriaGroup!: UntypedFormGroup
  public roleTypeOptions: SelectItem[] | undefined
  public typeOptions: SelectItem[] | undefined
  public ref: DynamicDialogRef | undefined
  private translatedData: any

  @Input() public actions: Action[] = []

  @Input()
  public searchInProgress: boolean = false

  @Output()
  public criteriaSubmitted = new EventEmitter<ApplicationParameterHistoryCriteria>()

  @Output()
  public resetSubmitted = new EventEmitter()

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly messageService: MessageService,
    private translateService: TranslateService,
    public dialogService: DialogService
  ) {}

  public ngOnInit(): void {
    this.initializeForm()
    this.loadTranslations()
  }

  public ngOnDestroy() {
    if (this.ref) {
      this.ref.close()
    }
  }

  public submitReset(): void {
    this.resetSubmitted.emit()
    this.criteriaGroup.reset()
  }

  public submitCriteria(): void {
    console.log('criteria submit')

    if (this.criteriaGroup.controls['applicationId'].invalid) {
      this.messageService.add({
        severity: 'error',
        summary: this.translatedData['SEARCH.APPLICATION_ID_IS_MANDATORY']
      })
      return
    }
    let criteriaDto: ApplicationParameterHistoryCriteria = this.criteriaGroup
      .value as ApplicationParameterHistoryCriteria
    if (criteriaDto.applicationId === '') {
      criteriaDto.applicationId = undefined
    }
    if (criteriaDto.key === '') {
      criteriaDto.key = undefined
    }
    this.criteriaSubmitted.emit(criteriaDto)
  }

  public showAppIdSelectDialog() {
    this.ref = this.dialogService.open(ParameterListComponent, {
      header: this.translatedData['DIALOG.SELECT_APPLICATION_ID'],
      data: {
        field: 'applicationId',
        applicationId: this.criteriaGroup.controls['applicationId'].value
      },
      width: '30%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true
    })

    this.ref.onClose.subscribe((parameter: ApplicationParameter) => {
      if (parameter) {
        this.criteriaGroup.controls['applicationId'].setValue(parameter.applicationId)
      }
    })
  }

  public showAppKeySelectDialog() {
    this.ref = this.dialogService.open(ParameterListComponent, {
      header: this.translatedData['DIALOG.SELECT_KEY'],
      data: {
        field: 'key',
        applicationId: this.criteriaGroup.controls['applicationId'].value
      },
      width: '30%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true
    })

    this.ref.onClose.subscribe((parameter: ApplicationParameter) => {
      if (parameter) {
        this.criteriaGroup.controls['key'].setValue(parameter.key)
      }
    })
  }

  private initializeForm(): void {
    this.criteriaGroup = this.fb.group({
      applicationId: null,
      key: null
    })
  }

  private loadTranslations(): void {
    this.translateService
      .get(['SEARCH.APPLICATION_ID_IS_MANDATORY', 'DIALOG.SELECT_APPLICATION_ID', 'DIALOG.SELECT_KEY'])
      .subscribe((text: Record<string, string>) => {
        this.translatedData = text
      })
  }
}
