import { Component, OnInit, ViewChild } from '@angular/core'
import { ParameterDetailFormComponent } from '../parameter-detail-form/parameter-detail-form.component'
import { TranslateService } from '@ngx-translate/core'
import { ParametersAPIService } from 'src/app/shared/generated'
import { PortalMessageService } from '@onecx/angular-integration-interface'
import { Observable } from 'rxjs'
import { Action } from '@onecx/portal-integration-angular'

@Component({
  selector: 'app-parameter-detail',
  templateUrl: './parameter-detail.component.html',
  styleUrls: ['./parameter-detail.component.scss']
})
export class ParameterDetailComponent implements OnInit {
  @ViewChild(ParameterDetailFormComponent, { static: false })
  parameterDetailFormComponent: ParameterDetailFormComponent | undefined

  public translatedData: Record<string, string> | undefined
  public actions$: Observable<Action[]> | undefined
  public saveEnabled: boolean = false

  constructor(
    private readonly messageService: PortalMessageService,
    private readonly translateService: TranslateService,
    private readonly parametersApiService: ParametersAPIService
  ) {}

  ngOnInit(): void {
    this.loadTranslations()
  }

  public onSubmit(parameterWrapper: any): void {
    this.parametersApiService
      .updateParameterValue({ applicationParameterUpdate: { ...parameterWrapper.parameter }, id: parameterWrapper.id })
      .subscribe(
        () => {
          this.messageService.success({
            summaryKey: this.translatedData!['EDIT.UPDATE_SUCCESS']
          })
        },
        () => {
          this.messageService.error({
            summaryKey: this.translatedData!['EDIT.UPDATE_ERROR']
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
