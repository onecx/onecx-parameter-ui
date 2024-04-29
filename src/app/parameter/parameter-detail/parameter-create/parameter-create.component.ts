import { Component, OnInit, ViewChild } from '@angular/core'

import { MessageService } from 'primeng/api'
import { ParameterDetailFormComponent } from '../parameter-detail-form/parameter-detail-form.component'
import { TranslateService } from '@ngx-translate/core'
import { ApplicationParameterCreate, ParametersAPIService } from 'src/app/shared/generated'

@Component({
  selector: 'app-parameter-create',
  templateUrl: './parameter-create.component.html',
  styleUrls: ['./parameter-create.component.scss']
})
export class ParameterCreateComponent implements OnInit {
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

  public onSubmit(parameterCreate: ApplicationParameterCreate): void {
    this.parametersApiService.createParameterValue({ applicationParameterCreate: parameterCreate }).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translatedData!['CREATE.CREATE_SUCCESS']
        })
      },
      () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translatedData!['CREATE.CREATE_ERROR']
        })
      }
    )
  }

  private loadTranslations(): void {
    this.translateService
      .get(['CREATE.BREADCRUMB', 'CREATE.CREATE_SUCCESS', 'CREATE.CREATE_ERROR'])
      .subscribe((translations: Record<string, string>) => {
        this.translatedData = translations
      })
  }
}
