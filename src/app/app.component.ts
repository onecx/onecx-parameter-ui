import { Component } from '@angular/core'
import { StandaloneShellModule } from '@onecx/angular-standalone-shell'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [AngularAcceleratorModule, StandaloneShellModule]
})
export class AppComponent {
  title = 'onecx-ui'
}
