import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'

import { InitializeModuleGuard, addInitializeModuleGuard } from '@onecx/angular-integration-interface'
import { PortalCoreModule, providePortalDialogService } from '@onecx/portal-integration-angular'

import { SharedModule } from 'src/app/shared/shared.module'

import { ParameterSearchComponent } from './parameter-search/parameter-search.component'
import { ParameterCriteriaComponent } from './parameter-search/parameter-criteria/parameter-criteria.component'
import { ParameterDetailComponent } from './parameter-detail/parameter-detail.component'
import { ParameterHistoryComponent } from './parameter-history/parameter-history.component'

const routes: Routes = [
  {
    path: '',
    component: ParameterSearchComponent,
    pathMatch: 'full'
  }
]
@NgModule({
  declarations: [
    ParameterSearchComponent,
    ParameterCriteriaComponent,
    ParameterDetailComponent,
    ParameterHistoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PortalCoreModule.forMicroFrontend(),
    [RouterModule.forChild(addInitializeModuleGuard(routes))],
    SharedModule
  ],
  providers: [InitializeModuleGuard, providePortalDialogService(), DatePipe],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class ParameterModule {
  constructor() {
    console.info('Parameter Module constructor')
  }
}
