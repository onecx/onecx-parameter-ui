import { Component, NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormsModule } from '@angular/forms'
import { By } from '@angular/platform-browser'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError } from 'rxjs'
import { SelectItem } from 'primeng/api'

import { UserService } from '@onecx/angular-integration-interface'
import { PortalMessageService } from '@onecx/portal-integration-angular'

import { Parameter, ParametersAPIService } from 'src/app/shared/generated'
import { ExtendedProduct, ApplicationAbstract } from '../parameter-search/parameter-search.component'
import { ParameterDetailComponent } from './parameter-detail.component'

const parameterBase: Parameter = {
  modificationCount: 0,
  id: 'id',
  productName: 'prod1',
  applicationId: 'app1',
  name: 'name',
  displayName: 'displayName',
  description: 'description'
}

const app1: ApplicationAbstract = { appId: 'app1-svc', appName: 'OneCX app svc 1' }
const app2: ApplicationAbstract = { appId: 'app2-svc', appName: 'OneCX app svc 2' }
const allProducts: ExtendedProduct[] = [
  { name: 'product1', displayName: 'Product 1', applications: [app1, app2] },
  { name: 'product2', displayName: 'Product 2', applications: [app2] }
]
const allProductsSI: SelectItem[] = [
  { label: 'Product 1', value: 'product1' },
  { label: 'Product 2', value: 'product2' }
]
const appOptionsP1: SelectItem[] = [
  { label: app1.appName, value: app1.appId },
  { label: app2.appName, value: app2.appId }
]

describe('ParameterDetailComponent', () => {
  let component: ParameterDetailComponent
  let fixture: ComponentFixture<ParameterDetailComponent>

  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error'])
  const apiServiceSpy = {
    getParameterById: jasmine.createSpy('getParameterById').and.returnValue(of({})),
    createParameter: jasmine.createSpy('createParameter').and.returnValue(of({})),
    updateParameter: jasmine.createSpy('updateParameter').and.returnValue(of({}))
  }
  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }

  function initializeComponent(): void {
    fixture = TestBed.createComponent(ParameterDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ParameterDetailComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: mockUserService },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: ParametersAPIService, useValue: apiServiceSpy }
      ]
    }).compileComponents()
    // reset
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    // to spy data: reset
    apiServiceSpy.getParameterById.calls.reset()
    apiServiceSpy.createParameter.calls.reset()
    apiServiceSpy.updateParameter.calls.reset()
    // to spy data: refill with neutral data
    apiServiceSpy.getParameterById.and.returnValue(of({}))
    apiServiceSpy.createParameter.and.returnValue(of({}))
    apiServiceSpy.updateParameter.and.returnValue(of({}))
  }))

  beforeEach(() => {
    initializeComponent()
    component.displayDialog = true
    component.allProducts = allProducts
  })

  afterEach(() => {
    component.formGroup.reset()
  })

  describe('construction', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
    })

    it('should not initialize if dialog is not open', () => {
      expect(component).toBeTruthy()
      component.displayDialog = false
      component.ngOnChanges()
    })
  })

  describe('ngOnChange - init form', () => {
    describe('VIEW basics', () => {
      beforeEach(() => {
        component.displayDialog = true
      })

      it('should reject initializing if dialog is not open', () => {
        component.displayDialog = false

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
      })

      it('should reject initializing if data is missed', () => {
        apiServiceSpy.getParameterById.and.returnValue(of({}))
        component.parameter = undefined
        component.changeMode = 'VIEW'

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
      })

      it('should prepare viewing a parameter - successful', () => {
        const p: Parameter = { ...parameterBase, value: 'text' }
        apiServiceSpy.getParameterById.and.returnValue(of(p))
        component.parameter = p
        component.changeMode = 'VIEW'

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).toHaveBeenCalled()
        expect(component.loading).toBeFalse()
        expect(component.formGroup.disabled).toBeTrue()
        expect(component.formGroup.controls['name'].value).toBe(p.name)
        expect(component.productOptions).toEqual(allProductsSI)
      })

      it('should prepare viewing a parameter - failed: missing id', () => {
        const p: Parameter = { ...parameterBase, id: undefined, value: 'text' }
        apiServiceSpy.getParameterById.and.returnValue(of({}))
        component.parameter = p
        component.changeMode = 'VIEW'

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
      })

      it('should prepare viewing a parameter - failed', () => {
        const errorResponse = { status: 403, statusText: 'No permissions' }
        apiServiceSpy.getParameterById.and.returnValue(throwError(() => errorResponse))
        component.parameter = parameterBase
        component.changeMode = 'VIEW'
        spyOn(component.formGroup, 'reset')
        spyOn(console, 'error')

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).toHaveBeenCalled()
        expect(component.formGroup.reset).toHaveBeenCalled()
        expect(component.formGroup.disabled).toBeTrue()
        expect(component.exceptionKey).toBe('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.PARAMETER')
        expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: component.exceptionKey })
        expect(console.error).toHaveBeenCalledWith('getParameterById', errorResponse)
      })
    })

    describe('VIEW extras', () => {
      beforeEach(() => {
        component.displayDialog = true
      })

      it('should display string - default', () => {
        const p: Parameter = { ...parameterBase, value: 'text' }
        apiServiceSpy.getParameterById.and.returnValue(of(p))
        component.parameter = p
        component.changeMode = 'VIEW'

        component.ngOnChanges()

        expect(component.formGroup.controls['valueType'].value).toBe('STRING')
        expect(component.formGroup.controls['value'].value).toBe(p.value)
      })

      it('should display boolean', () => {
        const p: Parameter = { ...parameterBase, value: false }
        apiServiceSpy.getParameterById.and.returnValue(of(p))
        component.parameter = p
        component.changeMode = 'VIEW'

        component.ngOnChanges()

        expect(component.formGroup.controls['valueType'].value).toBe('BOOLEAN')
        expect(component.formGroup.controls['valueBoolean'].value).toBe(p.value)
      })

      it('should display number', () => {
        const p: Parameter = { ...parameterBase, value: 123 }
        apiServiceSpy.getParameterById.and.returnValue(of(p))
        component.parameter = p
        component.changeMode = 'VIEW'

        component.ngOnChanges()

        expect(component.formGroup.controls['valueType'].value).toBe('NUMBER')
        expect(component.formGroup.controls['value'].value).toBe(p.value)
      })

      it('should display string', () => {
        const p: Parameter = { ...parameterBase, value: 'text' }
        apiServiceSpy.getParameterById.and.returnValue(of(p))
        component.parameter = p
        component.changeMode = 'VIEW'

        component.ngOnChanges()

        expect(component.formGroup.controls['valueType'].value).toBe('STRING')
        expect(component.formGroup.controls['value'].value).toBe(p.value)
      })

      it('should display object', () => {
        const p: Parameter = { ...parameterBase, value: {} }
        apiServiceSpy.getParameterById.and.returnValue(of(p))
        component.parameter = p
        component.changeMode = 'VIEW'

        component.ngOnChanges()

        expect(component.formGroup.controls['valueType'].value).toBe('OBJECT')
      })
    })

    describe('EDIT', () => {
      it('should prepare editing a parameter - successful', () => {
        const p: Parameter = { ...parameterBase, value: 'text' }
        apiServiceSpy.getParameterById.and.returnValue(of(p))
        component.changeMode = 'EDIT'
        component.parameter = p

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).toHaveBeenCalled()
        expect(component.loading).toBeFalse()
        expect(component.formGroup.enabled).toBeTrue()
        expect(component.formGroup.controls['name'].value).toEqual(p.name)
      })

      it('should prepare editing a parameter - failed: id missed', () => {
        const p: Parameter = { ...parameterBase, id: undefined }
        component.changeMode = 'EDIT'
        component.parameter = p

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
      })

      it('should display error if getting the parameter fails', () => {
        const errorResponse = { status: 404, statusText: 'Not Found' }
        apiServiceSpy.getParameterById.and.returnValue(throwError(() => errorResponse))
        component.changeMode = 'EDIT'
        component.parameter = parameterBase
        spyOn(console, 'error')

        component.ngOnChanges()

        expect(component.exceptionKey).toEqual('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.PARAMETER')
        expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: component.exceptionKey })
        expect(console.error).toHaveBeenCalledWith('getParameterById', errorResponse)
      })
    })

    describe('CREATE', () => {
      it('should prepare copying a parameter - start with data from other parameter', () => {
        component.changeMode = 'CREATE'
        component.parameter = parameterBase // will be rejected due to filled

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()

        component.parameter = undefined // correct

        component.ngOnChanges()

        expect(component.formGroup.enabled).toBeTrue()
        expect(component.formGroup.controls['name'].value).toEqual(null)
      })

      it('should prepare creating a parameter - start with empty form', () => {
        component.changeMode = 'CREATE'
        spyOn(component.formGroup, 'reset')

        component.ngOnChanges()

        expect(component.formGroup.reset).toHaveBeenCalled()
        expect(component.formGroup.enabled).toBeTrue()
        expect(component.formGroup.controls['name'].value).toBe(null)
      })
    })

    describe('COPY', () => {
      it('should prepare copying a parameter - use data from other parameter', () => {
        const p: Parameter = { ...parameterBase, value: 'text' }
        component.changeMode = 'COPY'
        component.parameter = p

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
        expect(component.formGroup.enabled).toBeTrue()
        expect(component.formGroup.controls['name'].value).toBe(p.name)
      })
    })
  })

  describe('onSave - CREATE', () => {
    beforeEach(() => {
      component.displayDialog = true
      component.changeMode = 'CREATE'
      component.parameter = { ...parameterBase, id: undefined }
    })

    it('should create a STRING parameter - valid', () => {
      apiServiceSpy.createParameter.and.returnValue(of({}))
      spyOn(component.hideDialogAndChanged, 'emit')

      component.ngOnChanges()
      // manipulate user settings
      component.formGroup.controls['value'].setValue('text')
      component.formGroup.controls['valueType'].setValue('STRING')
      expect(component.formGroup.valid).toBeTrue()
      component.onSave()

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.CREATE.MESSAGE.OK' })
      expect(component.hideDialogAndChanged.emit).toHaveBeenCalledWith(true)
    })

    it('should create a BOOLEAN parameter - valid', () => {
      apiServiceSpy.createParameter.and.returnValue(of({}))

      component.ngOnChanges()
      // manipulate user settings
      component.formGroup.controls['valueBoolean'].setValue(true)
      component.formGroup.controls['valueType'].setValue('BOOLEAN')
      expect(component.formGroup.valid).toBeTrue()
      component.onSave()

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.CREATE.MESSAGE.OK' })
    })

    it('should create a NUMBER parameter - valid number', () => {
      component.ngOnChanges()
      // manipulate user settings
      component.formGroup.controls['value'].setValue(12345)
      component.formGroup.controls['valueType'].setValue('NUMBER')
      expect(component.formGroup.valid).toBeTrue()
      component.onSave()
    })

    it('should create a NUMBER parameter - invalid number', () => {
      component.ngOnChanges()
      // manipulate user settings
      component.formGroup.controls['valueType'].setValue('NUMBER')
      component.formGroup.controls['value'].setValue({})
      expect(component.formGroup.valid).toBeFalse()
      component.onSave()
    })

    it('should create a OBJECT parameter - valid object', () => {
      apiServiceSpy.createParameter.and.returnValue(of({}))

      component.ngOnChanges()
      // manipulate user settings
      const obj = JSON.stringify({})
      component.formGroup.controls['valueObject'].setValue(obj)
      component.formGroup.controls['valueType'].setValue('OBJECT')
      expect(component.formGroup.valid).toBeTrue()
      component.onSave()

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.CREATE.MESSAGE.OK' })
    })

    it('should display error if creation fails', () => {
      const errorResponse = { status: 400, statusText: 'Could not create ...' }
      apiServiceSpy.createParameter.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.ngOnChanges()
      // manipulate user settings
      component.formGroup.controls['value'].setValue('text')
      component.formGroup.controls['valueType'].setValue('STRING')
      expect(component.formGroup.valid).toBeTrue()
      component.onSave()

      expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.CREATE.MESSAGE.NOK' })
      expect(console.error).toHaveBeenCalledWith('createParameter', errorResponse)
    })
  })

  describe('onSave - COPY', () => {
    it('should create a parameter based on another', () => {
      const p: Parameter = { ...parameterBase, value: 'text' }
      apiServiceSpy.createParameter.and.returnValue(of({}))
      component.changeMode = 'COPY'
      component.parameter = p
      spyOn(component.hideDialogAndChanged, 'emit')

      component.ngOnChanges()
      expect(component.formGroup.valid).toBeTrue()
      component.onSave()

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.CREATE.MESSAGE.OK' })
      expect(component.hideDialogAndChanged.emit).toHaveBeenCalledWith(true)
    })
  })

  describe('onSave - EDIT', () => {
    beforeEach(() => {
      const p: Parameter = { ...parameterBase, value: 'text' }
      apiServiceSpy.getParameterById.and.returnValue(of(p))
      component.changeMode = 'EDIT'
      component.parameter = p

      component.ngOnChanges()

      expect(component.formGroup.valid).toBeTrue()
    })

    it('should update a parameter - successful', () => {
      apiServiceSpy.updateParameter.and.returnValue(of({}))
      spyOn(component.hideDialogAndChanged, 'emit')

      component.onSave()

      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.EDIT.MESSAGE.OK' })
      expect(component.hideDialogAndChanged.emit).toHaveBeenCalledWith(true)
    })

    it('should display error if update fails', () => {
      const errorResponse = { status: 400, statusText: 'Could not update ...' }
      apiServiceSpy.updateParameter.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.onSave()

      expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.EDIT.MESSAGE.NOK' })
      expect(console.error).toHaveBeenCalledWith('updateParameter', errorResponse)
    })

    it('should display error if update fails due to unique constraint violation', () => {
      const errorResponse = {
        status: 400,
        statusText: 'Could not update ...',
        error: { errorCode: 'PERSIST_ENTITY_FAILED' }
      }
      apiServiceSpy.updateParameter.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.onSave()

      expect(msgServiceSpy.error).toHaveBeenCalledWith({
        summaryKey: 'ACTIONS.EDIT.MESSAGE.NOK',
        detailKey: 'VALIDATION.ERRORS.PERSIST_ENTITY_FAILED'
      })
      expect(console.error).toHaveBeenCalledWith('updateParameter', errorResponse)
    })

    it('should display error if update fails due to unique constraint violation', () => {
      apiServiceSpy.getParameterById.and.returnValue(of(parameterBase))
      const errorResponse = {
        status: 400,
        statusText: 'Could not update ...',
        error: { errorCode: 'ANY_OTHER_ERROR_KEY' }
      }
      apiServiceSpy.updateParameter.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.onSave()

      expect(msgServiceSpy.error).toHaveBeenCalledWith({
        summaryKey: 'ACTIONS.EDIT.MESSAGE.NOK',
        detailKey: errorResponse.error.errorCode
      })
      expect(console.error).toHaveBeenCalledWith('updateParameter', errorResponse)
    })
  })

  describe('Extra logging', () => {
    beforeEach(() => {
      component.displayDialog = true
      const p: Parameter = { ...parameterBase, id: undefined, value: 'text' }
      component.parameter = p
    })

    it('should NOT log if form is not valide', () => {
      component.logErrors = false
      component.changeMode = 'CREATE'

      component.ngOnChanges()
      // manipulate user settings
      const obj = { hallo: 'test' }
      component.formGroup.controls['valueObject'].setValue(obj)
      component.formGroup.controls['valueType'].setValue('OBJECT')
      component.onSave()
    })

    it('should log if form is not valide', () => {
      component.logErrors = true
      component.changeMode = 'CREATE'
      spyOn(console, 'error')

      component.ngOnChanges()
      // manipulate user settings
      const obj = { hallo: 'test' }
      component.formGroup.controls['valueObject'].setValue(obj)
      component.formGroup.controls['valueType'].setValue('OBJECT')
      component.onSave()

      expect(console.error).toHaveBeenCalledWith('form error: ', 'valueObject', 'pattern')
    })
  })

  /*
   * UI ACTIONS
   */
  describe('Extra UI actions', () => {
    describe('Closing dialog', () => {
      it('should close the dialog if user triggers hiding', () => {
        spyOn(component.hideDialogAndChanged, 'emit')
        component.onDialogHide()

        expect(component.hideDialogAndChanged.emit).toHaveBeenCalledWith(false)
      })
    })

    describe('onChangeProductName', () => {
      it('should reject update appOptions if no product name is provided', () => {
        component.onChangeProductName(undefined)

        expect(component.appOptions).toEqual([])
      })

      it('should update appOptions based on the product name', () => {
        component.allProducts = allProducts
        component.onChangeProductName(allProducts[0].name)

        expect(component.appOptions).toEqual(appOptionsP1)
        expect(component.formGroup.controls['applicationId'].value).toBeNull()
      })

      it('should clear appOptions if productName does not match', () => {
        component.allProducts = allProducts
        component.onChangeProductName('unknown')

        expect(component.appOptions).toEqual([])
        expect(component.formGroup.controls['applicationId'].value).toBeNull()
      })
    })
  })

  xdescribe('DefaultValueAccessor - does not work', () => {
    beforeEach(() => {
      const p: Parameter = { ...parameterBase, value: 'text' }
      apiServiceSpy.getParameterById.and.returnValue(of(p))
      component.changeMode = 'EDIT'
      component.parameter = p

      component.ngOnChanges()

      expect(component.formGroup.valid).toBeTrue()
    })

    it('should trim the value on model change: value is of type string', fakeAsync(() => {
      const inputElement = fixture.debugElement.query(By.css('input#pam_detail_form_value'))
      inputElement.nativeElement.dispatchEvent(new Event('input'))
      inputElement.nativeElement.value = '  test  '
      fixture.detectChanges()
      tick(300)

      expect(component.formGroup?.get('value')?.value).toBe('test')
    }))
  })
})

/* Test modification of built-in Angular class registerOnChange at top of the file  */
@Component({
  template: `<input type="text" [(ngModel)]="value" />`
})
class TestComponent {
  value: any = ''
}
describe('DefaultValueAccessor prototype modification', () => {
  let component: TestComponent
  let fixture: ComponentFixture<TestComponent>
  let inputElement: HTMLInputElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [FormsModule]
    }).compileComponents()

    fixture = TestBed.createComponent(TestComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

    inputElement = fixture.nativeElement.querySelector('input')
  })

  it('should trim the value on model change: value is of type string', () => {
    inputElement.value = '  test  '
    inputElement.dispatchEvent(new Event('input'))
    fixture.detectChanges()

    expect(component.value).toBe('test')
  })
})
