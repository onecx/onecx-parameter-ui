import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'

import { PortalCoreModule, providePortalDialogService } from '@onecx/portal-integration-angular'
import { SharedModule } from '../shared/shared.module'

import { ParameterSearchComponent } from './parameter-search/parameter-search.component'
import { ResultsComponent } from './parameter-search/results/results.component'
import { ParameterDetailFormComponent } from './parameter-detail/parameter-detail-form/parameter-detail-form.component'
import { ParameterDetailComponent } from './parameter-detail/parameter-detail/parameter-detail.component'
import { ParameterDetailNewComponent } from './parameter-detail/parameter-detail-new/parameter-detail-new.component'
import { ParameterCreateComponent } from './parameter-detail/parameter-create/parameter-create.component'
import { ParameterCriteriaComponent } from './parameter-search/parameter-criteria/parameter-criteria.component'
import { ParameterHistoryComponent } from './parameter-detail/parameter-history/parameter-history.component'
import { InitializeModuleGuard, addInitializeModuleGuard } from '@onecx/angular-integration-interface'

const routes: Routes = [
  {
    path: '',
    component: ParameterSearchComponent,
    pathMatch: 'full'
  },
  {
    path: 'create',
    component: ParameterCreateComponent,
    pathMatch: 'full'
  },
  {
    path: 'edit/:id',
    component: ParameterDetailComponent,
    pathMatch: 'full'
  }
]
@NgModule({
  declarations: [
    ParameterSearchComponent,
    ParameterCriteriaComponent,
    ResultsComponent,
    ParameterDetailFormComponent,
    ParameterDetailComponent,
    ParameterDetailNewComponent,
    ParameterCreateComponent,
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
