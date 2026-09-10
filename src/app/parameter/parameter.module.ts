import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { providePermissionService, provideThemeConfig } from '@onecx/angular-utils'

import { LabelResolver } from 'src/app/shared/label.resolver'
import { ParameterSearchComponent } from './parameter-search/parameter-search.component'
import { UsageSearchComponent } from './usage-search/usage-search.component'

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
  imports: [ParameterSearchComponent, UsageSearchComponent, [RouterModule.forChild(routes)]],
  providers: [providePermissionService(), provideThemeConfig()]
})
export class ParameterModule {}
