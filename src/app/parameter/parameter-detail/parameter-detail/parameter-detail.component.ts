import { Component, OnInit, ViewChild } from '@angular/core'
import { ParameterDetailFormComponent } from '../parameter-detail-form/parameter-detail-form.component'
import { MessageService } from 'primeng/api'
import { TranslateService } from '@ngx-translate/core'
import { ParametersAPIService } from 'src/app/shared/generated'

@Component({
  selector: 'app-parameter-detail',
  templateUrl: './parameter-detail.component.html',
  styleUrls: ['./parameter-detail.component.scss']
})
export class ParameterDetailComponent implements OnInit {
  @ViewChild(ParameterDetailFormComponent, { static: false })
  parameterDetailFormComponent: ParameterDetailFormComponent | undefined

  public translatedData: Record<string, string> | undefined

  constructor(
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
    private readonly parametersApiService: ParametersAPIService
  ) {}

  ngOnInit(): void {
    this.loadTranslations()
  }

  public onSubmit(parameterWrapper: any): void {
    this.parametersApiService.updateParameterValue(parameterWrapper.id, parameterWrapper.parameter).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translatedData!['EDIT.UPDATE_SUCCESS']
        })
        this.parameterDetailFormComponent?.switchMode()
      },
      () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translatedData!['EDIT.UPDATE_ERROR']
        })
      }
    )
  }

  private loadTranslations(): void {
    this.translateService
      .get(['EDIT.BREADCRUMB', 'EDIT.UPDATE_SUCCESS', 'EDIT.UPDATE_ERROR'])
      .subscribe((translations: Record<string, string>) => {
        this.translatedData = translations
      })
  }
}
