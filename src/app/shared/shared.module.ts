import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { provideErrorTailorConfig, errorTailorImports } from '@ngneat/error-tailor'

import { AutoCompleteModule } from 'primeng/autocomplete'
import { BadgeModule } from 'primeng/badge'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { CheckboxModule } from 'primeng/checkbox'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ConfirmPopupModule } from 'primeng/confirmpopup'
import { ConfirmationService } from 'primeng/api'
import { DataViewModule } from 'primeng/dataview'
import { DialogModule } from 'primeng/dialog'
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog'
import { SelectModule } from 'primeng/select'
import { FieldsetModule } from 'primeng/fieldset'
import { InputTextModule } from 'primeng/inputtext'
import { TextareaModule } from 'primeng/textarea'
import { KeyFilterModule } from 'primeng/keyfilter'
import { ListboxModule } from 'primeng/listbox'
import { MessageModule } from 'primeng/message'
import { MultiSelectModule } from 'primeng/multiselect'
import { SelectButtonModule } from 'primeng/selectbutton'
import { TableModule } from 'primeng/table'
import { TabsModule } from 'primeng/tabs'
import { ToastModule } from 'primeng/toast'
import { TooltipModule } from 'primeng/tooltip'

import { AngularAcceleratorModule, PortalDialogService } from '@onecx/angular-accelerator'
import { PortalPageComponent } from '@onecx/angular-utils'

import { LabelResolver } from './label.resolver'

@NgModule({
  declarations: [],
  imports: [
    AngularAcceleratorModule,
    AutoCompleteModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    CommonModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    DataViewModule,
    DialogModule,
    SelectModule,
    DynamicDialogModule,
    FieldsetModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    KeyFilterModule,
    ListboxModule,
    MessageModule,
    MultiSelectModule,
    PortalPageComponent,
    ReactiveFormsModule,
    SelectButtonModule,
    TableModule,
    TabsModule,
    ToastModule,
    TooltipModule,
    TranslateModule,
    errorTailorImports
  ],
  exports: [
    AutoCompleteModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    CommonModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    DataViewModule,
    DialogModule,
    SelectModule,
    DynamicDialogModule,
    FieldsetModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    KeyFilterModule,
    ListboxModule,
    MessageModule,
    MultiSelectModule,
    PortalPageComponent,
    ReactiveFormsModule,
    SelectButtonModule,
    TableModule,
    TabsModule,
    ToastModule,
    TooltipModule,
    TranslateModule,
    errorTailorImports
  ],
  //this is not elegant, for some reason the injection token from primeng does not work across federated module
  providers: [
    ConfirmationService,
    LabelResolver,
    { provide: DialogService, useClass: PortalDialogService },
    provideErrorTailorConfig({
      controlErrorsOn: { async: true, blur: true, change: true },
      errors: {
        useFactory: (i18n: TranslateService) => {
          return {
            required: () => i18n.instant('VALIDATION.ERRORS.EMPTY_REQUIRED_FIELD'),
            maxlength: ({ requiredLength }) =>
              i18n.instant('VALIDATION.ERRORS.MAXIMUM_LENGTH').replace('{{chars}}', requiredLength),
            minlength: ({ requiredLength }) =>
              i18n.instant('VALIDATION.ERRORS.MINIMUM_LENGTH').replace('{{chars}}', requiredLength),
            pattern: () => i18n.instant('VALIDATION.ERRORS.PATTERN_ERROR')
          }
        },
        deps: [TranslateService]
      },
      //this is required because primeng wraps things in an ugly way
      blurPredicate: (element: Element) => {
        return ['INPUT', 'TEXTAREA', 'SELECT', 'CUSTOM-DATE', 'P-DATEPICKER', 'P-SELECT'].includes(element.tagName)
      }
    })
  ]
})
export class SharedModule {}
