import { DoBootstrap, inject, Injector, NgModule, provideAppInitializer } from '@angular/core'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule, Routes, Router } from '@angular/router'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'

import { AngularAuthModule, provideTokenInterceptor } from '@onecx/angular-auth'
import {
  createTranslateLoader,
  PortalApiConfiguration,
  provideTranslationPathFromMeta,
  provideThemeConfig,
  provideAngularUtils
} from '@onecx/angular-utils'
import { createAppEntrypoint, initializeRouter, startsWith } from '@onecx/angular-webcomponents'
import { AppConfigService, AppStateService } from '@onecx/angular-integration-interface'
import { AngularAcceleratorMissingTranslationHandler, AngularAcceleratorModule } from '@onecx/angular-accelerator'

import { Configuration } from './shared/generated'
import { environment } from 'src/environments/environment'
import { AppEntrypointComponent } from './app-entrypoint.component'

function apiConfigProvider() {
  return new PortalApiConfiguration(Configuration, environment.apiPrefix)
}

export function appConfigServiceInitializer(appStateService: AppStateService, appConfigService: AppConfigService) {
  return async () => {
    const mfe = await firstValueFrom(appStateService.currentMfe$.asObservable())
    await appConfigService.init(mfe.remoteBaseUrl)
  }
}

const routes: Routes = [
  {
    matcher: startsWith(''),
    loadChildren: () => import('./parameter/parameter.module').then((m) => m.ParameterModule)
  }
]
@NgModule({
  declarations: [AppEntrypointComponent],
  imports: [
    AngularAuthModule,
    BrowserModule,
    BrowserAnimationsModule,
    AngularAcceleratorModule,
    RouterModule.forRoot(routes),
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
    { provide: Configuration, useFactory: apiConfigProvider },
    provideAppInitializer(() => {
      const router = inject(Router)
      const appStateService = inject(AppStateService)
      return initializeRouter(router, appStateService)()
    }),
    provideAppInitializer(() => {
      const appStateService = inject(AppStateService)
      const appConfigService = inject(AppConfigService)
      return appConfigServiceInitializer(appStateService, appConfigService)()
    }),
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
    provideThemeConfig(),
    provideAngularUtils(),
    provideTokenInterceptor(),
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class OneCXParameterModule implements DoBootstrap {
  constructor(
    private readonly injector: Injector,
    private readonly appConfigService: AppConfigService
  ) {
    console.info('OneCX Parameter Module constructor')
  }

  ngDoBootstrap(): void {
    const envElementName = this.appConfigService.getProperty('APP_ELEMENT_NAME')
    createAppEntrypoint(
      AppEntrypointComponent,
      envElementName && !envElementName.includes('$') ? envElementName : 'ocx-parameter-component',
      this.injector
    )
  }
}
