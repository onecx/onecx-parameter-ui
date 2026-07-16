import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'

import { AngularAcceleratorModule } from '@onecx/angular-accelerator'

import { SharedModule } from 'src/app/shared/shared.module'
import { LabelResolver } from 'src/app/shared/label.resolver'

import { ParameterSearchComponent } from './parameter-search/parameter-search.component'
import { ParameterCriteriaComponent } from './parameter-criteria/parameter-criteria.component'
import { ParameterDetailComponent } from './parameter-detail/parameter-detail.component'
import { UsageSearchComponent } from './usage-search/usage-search.component'
import { UsageDetailComponent } from './usage-detail/usage-detail.component'
import { UsageDetailCriteriaComponent } from './usage-detail/usage-detail-criteria/usage-detail-criteria.component'
import { UsageDetailListComponent } from './usage-detail/usage-detail-list/usage-detail-list.component'
import { ParameterDeleteComponent } from './parameter-delete/parameter-delete.component'

const routes: Routes = [
  {
    path: '',
    component: ParameterSearchComponent,
    pathMatch: 'full'
  },
  {
    path: 'usage',
    component: UsageSearchComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.USAGE',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  }
]
@NgModule({
  declarations: [
    ParameterSearchComponent,
    ParameterCriteriaComponent,
    ParameterDetailComponent,
    ParameterDeleteComponent,
    UsageSearchComponent,
    UsageDetailComponent,
    UsageDetailCriteriaComponent,
    UsageDetailListComponent
  ],
  imports: [CommonModule, AngularAcceleratorModule, [RouterModule.forChild(routes)], SharedModule],
  providers: [DatePipe]
})
export class ParameterModule {
  constructor() {
    console.info('Parameter Module constructor')
  }
}
