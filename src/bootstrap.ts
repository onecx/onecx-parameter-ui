import { bootstrapModule } from '@onecx/angular-webcomponents'

import { environment } from 'src/environments/environment'
import { OneCXParameterModule } from './app/onecx-parameter-remote.module'

bootstrapModule(OneCXParameterModule, 'microfrontend', environment.production)
