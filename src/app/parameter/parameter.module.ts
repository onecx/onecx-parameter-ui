import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'

import { InitializeModuleGuard, addInitializeModuleGuard } from '@onecx/angular-integration-interface'
import { PortalCoreModule } from '@onecx/portal-integration-angular'

import { SharedModule } from 'src/app/shared/shared.module'

import { ParameterSearchComponent } from './parameter-search/parameter-search.component'
import { ParameterCriteriaComponent } from './parameter-search/parameter-criteria/parameter-criteria.component'
import { ParameterDetailComponent } from './parameter-detail/parameter-detail.component'
import { ParameterHistoryComponent } from './parameter-history/parameter-history.component'
import { ParameterHistoryCriteriaComponent } from './parameter-history/parameter-history-criteria/parameter-history-criteria.component'
import { ParameterHistoryListComponent } from './parameter-history/parameter-history-list/parameter-history-list.component'
import { DetailHistoryComponent } from './detail-history/detail-history.component'
import { DetailHistoryCriteriaComponent } from './detail-history/detail-history-criteria/detail-history-criteria.component'
import { DetailHistoryListComponent } from './detail-history/detail-history-list/detail-history-list.component'

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
    ParameterHistoryComponent,
    ParameterHistoryCriteriaComponent,
    ParameterHistoryListComponent,
    DetailHistoryComponent,
    DetailHistoryCriteriaComponent,
    DetailHistoryListComponent
  ],
  imports: [
    CommonModule,
    PortalCoreModule.forMicroFrontend(),
    [RouterModule.forChild(addInitializeModuleGuard(routes))],
    SharedModule
  ],
  providers: [InitializeModuleGuard, DatePipe]
})
export class ParameterModule {
  constructor() {
    console.info('Parameter Module constructor')
  }
}
