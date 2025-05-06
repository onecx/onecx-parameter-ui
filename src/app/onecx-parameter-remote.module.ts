import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { APP_INITIALIZER, DoBootstrap, Injector, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router, RouterModule, Routes } from '@angular/router'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'

import { AngularAuthModule } from '@onecx/angular-auth'
import {
  addInitializeModuleGuard,
  AppConfigService,
  AppStateService,
  ConfigurationService
} from '@onecx/angular-integration-interface'
import { createTranslateLoader, TRANSLATION_PATH, translationPathFactory } from '@onecx/angular-utils'
import { createAppEntrypoint, initializeRouter, startsWith } from '@onecx/angular-webcomponents'

import {
  PortalApiConfiguration,
  PortalCoreModule,
  PortalMissingTranslationHandler
} from '@onecx/portal-integration-angular'

import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'
import { AppEntrypointComponent } from './app-entrypoint.component'
import { Configuration } from './shared/generated'

function apiConfigProvider(configService: ConfigurationService, appStateService: AppStateService) {
  return new PortalApiConfiguration(Configuration, environment.apiPrefix, configService, appStateService)
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
    PortalCoreModule.forMicroFrontend(),
    RouterModule.forRoot(addInitializeModuleGuard(routes)),
    TranslateModule.forRoot({
      isolate: true,
      loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: PortalMissingTranslationHandler }
    })
  ],
  providers: [
    ConfigurationService,
    { provide: Configuration, useFactory: apiConfigProvider, deps: [ConfigurationService, AppStateService] },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeRouter,
      multi: true,
      deps: [Router, AppStateService]
    },
    {
      provide: TRANSLATION_PATH,
      useFactory: (appStateService: AppStateService) => translationPathFactory('assets/i18n/')(appStateService),
      multi: true,
      deps: [AppStateService]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appConfigServiceInitializer,
      multi: true,
      deps: [AppStateService, AppConfigService]
    },
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class OneCXParameterModule implements DoBootstrap {
  constructor(
    private readonly injector: Injector,
    private appConfigService: AppConfigService
  ) {
    console.info('OneCX Parameter Module constructor')
  }

  ngDoBootstrap(): void {
    const envElementName = this.appConfigService.getProperty('elementName')
    createAppEntrypoint(
      AppEntrypointComponent,
      envElementName && envElementName !== '' ? envElementName : 'ocx-parameter-component',
      this.injector
    )
  }
}
