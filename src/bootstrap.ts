import { environment } from 'src/environments/environment'
import { OneCXParameterModule } from './app/onecx-parameter-remote.module'
import { bootstrapModule } from '@onecx/angular-webcomponents'

bootstrapModule(OneCXParameterModule, 'microfrontend', environment.production)
