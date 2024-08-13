import { Component, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

import { ParameterDetailFormComponent } from '../parameter-detail-form/parameter-detail-form.component'
import { TranslateService } from '@ngx-translate/core'
import { ApplicationParameterCreate, ParametersAPIService } from 'src/app/shared/generated'
import { PortalMessageService } from '@onecx/angular-integration-interface'

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
    private readonly messageService: PortalMessageService,
    private readonly translateService: TranslateService,
    private readonly parametersApiService: ParametersAPIService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadTranslations()
  }

  public onSubmit(parameterCreate: ApplicationParameterCreate): void {
    this.parametersApiService.createParameterValue({ applicationParameterCreate: parameterCreate }).subscribe(
      () => {
        this.messageService.success({
          summaryKey: this.translatedData!['ACTIONS.CREATE.CREATE_SUCCESS']
        })
        this.router.navigate(['..'], { relativeTo: this.route })
      },
      () => {
        this.messageService.error({
          summaryKey: this.translatedData!['ACTIONS.CREATE.CREATE_ERROR']
        })
      }
    )
  }

  private loadTranslations(): void {
    this.translateService
      .get(['ACTIONS.CREATE.BREADCRUMB', 'ACTIONS.CREATE.CREATE_SUCCESS', 'ACTIONS.CREATE.CREATE_ERROR'])
      .subscribe((translations: Record<string, string>) => {
        this.translatedData = translations
      })
  }
}
