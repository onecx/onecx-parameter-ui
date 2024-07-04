import { HttpClient } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { APP_INITIALIZER, DoBootstrap, Injector, NgModule } from '@angular/core'
import { createCustomElement } from '@angular/elements'
import { Router, RouterModule, Routes } from '@angular/router'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'

import {
  AppStateService,
  ConfigurationService,
  createTranslateLoader,
  PortalCoreModule,
  PortalMissingTranslationHandler
} from '@onecx/portal-integration-angular'
import { addInitializeModuleGuard } from '@onecx/angular-integration-interface'
import { initializeRouter, startsWith } from '@onecx/angular-webcomponents'
import { AppEntrypointComponent } from './app-entrypoint.component'

const routes: Routes = [
  {
    matcher: startsWith(''),
    loadChildren: () => import('./parameter/parameter.module').then((m) => m.ParameterModule)
  }
]
@NgModule({
  declarations: [AppEntrypointComponent],
  imports: [
    BrowserModule,
    PortalCoreModule.forMicroFrontend(),
    RouterModule.forRoot(addInitializeModuleGuard(routes)),
    TranslateModule.forRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient, AppStateService]
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: PortalMissingTranslationHandler }
    })
  ],
  exports: [],
  providers: [
    ConfigurationService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeRouter,
      multi: true,
      deps: [Router, AppStateService]
    }
  ],
  schemas: []
})
export class OneCXParameterModule implements DoBootstrap {
  constructor(private injector: Injector) {
    console.info('OneCX Parameter Module constructor')
  }

  ngDoBootstrap(): void {
    const appEntrypoint = createCustomElement(AppEntrypointComponent, {
      injector: this.injector
    })
    customElements.define('ocx-parameter-component', appEntrypoint)
  }
}
