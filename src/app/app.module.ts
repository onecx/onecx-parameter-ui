import { NgModule } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { RouterModule, Routes } from '@angular/router'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { provideMissingTranslationHandler, provideTranslateLoader, provideTranslateService } from '@ngx-translate/core'

import { AngularAuthModule } from '@onecx/angular-auth'
import {
  provideTranslationPathFromMeta,
  providePermissionService,
  MultiLanguageMissingTranslationHandler,
  OnecxTranslateLoader
} from '@onecx/angular-utils'
import { provideThemeConfig } from '@onecx/angular-utils/theme/primeng'
import { APP_CONFIG } from '@onecx/angular-integration-interface'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { StandaloneShellModule, provideStandaloneProviders } from '@onecx/angular-standalone-shell'

import { environment } from 'src/environments/environment'
import { AppComponent } from './app.component'

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./parameter/parameter.module').then((m) => m.ParameterModule)
  }
]
@NgModule({
  imports: [
    AppComponent,
    BrowserAnimationsModule,
    AngularAuthModule,
    AngularAcceleratorModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
      enableTracing: true
    }),
    StandaloneShellModule
  ],
  providers: [
    { provide: APP_CONFIG, useValue: environment },
    provideTranslateService({
      defaultLanguage: 'en',
      loader: provideTranslateLoader(OnecxTranslateLoader),
      missingTranslationHandler: provideMissingTranslationHandler(MultiLanguageMissingTranslationHandler)
    }),
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
    provideHttpClient(withInterceptorsFromDi()),
    provideThemeConfig(),
    providePermissionService(),
    provideStandaloneProviders()
  ]
})
export class AppModule {}
