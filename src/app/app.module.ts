import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { RouterModule, Routes } from '@angular/router'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { TranslateLoader, TranslateModule, MissingTranslationHandler } from '@ngx-translate/core'

import { AngularAuthModule, provideTokenInterceptor } from '@onecx/angular-auth'
import {
  createTranslateLoader,
  provideTranslationPathFromMeta,
  provideThemeConfig,
  provideAngularUtils
} from '@onecx/angular-utils'
import { APP_CONFIG } from '@onecx/angular-integration-interface'
import { AngularAcceleratorMissingTranslationHandler, AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { StandaloneShellModule } from '@onecx/angular-standalone-shell'

import { environment } from 'src/environments/environment'
import { AppComponent } from './app.component'

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./parameter/parameter.module').then((m) => m.ParameterModule)
  }
]
@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AngularAuthModule,
    AngularAcceleratorModule,
    StandaloneShellModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
      enableTracing: true
    }),
    TranslateModule.forRoot({
      isolate: true,
      loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: AngularAcceleratorMissingTranslationHandler
      }
    })
  ],
  providers: [
    { provide: APP_CONFIG, useValue: environment },
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
    provideThemeConfig(),
    provideAngularUtils(),
    provideTokenInterceptor(),
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule {
  constructor() {
    console.info('OneCX Parameter Module constructor')
  }
}
