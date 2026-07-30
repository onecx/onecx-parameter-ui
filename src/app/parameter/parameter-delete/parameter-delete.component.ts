import { Component, EventEmitter, Input, Output, inject } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { PortalMessageService } from '@onecx/angular-integration-interface'

import { Parameter, ParametersAPIService } from 'src/app/shared/generated'

@Component({
  selector: 'app-parameter-delete',
  templateUrl: './parameter-delete.component.html',
  standalone: false
})
export class ParameterDeleteComponent {
  private readonly parameterApi = inject(ParametersAPIService)
  private readonly msgService = inject(PortalMessageService)
  private readonly translate = inject(TranslateService)

  @Input() parameter: Parameter | undefined
  @Input() productDisplayName: string | undefined
  @Input() appDisplayName: string | undefined
  @Input() visible = false
  @Output() visibleChange = new EventEmitter<boolean>()

  /**
   * DELETE
   */
  public onDeleteParameter(parameter: Parameter | undefined): void {
    if (parameter?.id)
      this.parameterApi.deleteParameter({ id: parameter.id }).subscribe({
        next: () => {
          this.visibleChange.emit(true)
          this.msgService.success({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
        },
        error: (err) => {
          console.error('deleteParameter', err)
          this.msgService.error({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK', detailKey: err.error.message })
        }
      })
  }
}
