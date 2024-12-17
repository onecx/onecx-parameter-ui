import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient, HttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { of, throwError } from 'rxjs'
import { FormControl, FormGroup } from '@angular/forms'

import {
  AppStateService,
  createTranslateLoader,
  PortalMessageService,
  UserService
} from '@onecx/portal-integration-angular'
import { Parameter, ParametersAPIService } from 'src/app/shared/generated'
import { ParameterDetailComponent } from './parameter-detail.component'

const productName = 'prod1'
const app = 'app1'

const parameter: Parameter = {
  id: 'id',
  productName: productName,
  applicationId: app,
  name: 'name',
  displayName: 'displayName',
  value: 'value'
}

describe('ParameterDetailComponent', () => {
  let component: ParameterDetailComponent
  let fixture: ComponentFixture<ParameterDetailComponent>

  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error'])
  const apiServiceSpy = {
    createParameterValue: jasmine.createSpy('createParameterValue').and.returnValue(of({})),
    updateParameterValue: jasmine.createSpy('updateParameterValue').and.returnValue(of({}))
  }
  const formGroup = new FormGroup({
    id: new FormControl('id'),
    name: new FormControl('name'),
    value: new FormControl('value'),
    productName: new FormControl('prod name'),
    displayName: new FormControl('display name'),
    applicationId: new FormControl('app')
  })
  const mockUserService = {
    lang$: {
      getValue: jasmine.createSpy('getValue')
    }
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ParameterDetailComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient, AppStateService]
          }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: ParametersAPIService, useValue: apiServiceSpy },
        { provide: UserService, useValue: mockUserService }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    apiServiceSpy.createParameterValue.calls.reset()
    apiServiceSpy.updateParameterValue.calls.reset()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    component.formGroup.reset()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnChange, i.e. opening detail dialog', () => {
    it('should prepare editing a parameter', () => {
      component.changeMode = 'EDIT'
      component.parameter = parameter

      component.ngOnChanges()

      //expect(component.parameterId).toEqual(parameter.id)
    })

    it('should prepare copying a parameter', () => {
      component.changeMode = 'CREATE'
      component.parameter = parameter
      component.ngOnChanges()

      // expect(component.parameterId).toBeUndefined()
    })

    it('should prepare creating a parameter', () => {
      component.changeMode = 'CREATE'
      spyOn(component.formGroup, 'reset')

      component.ngOnChanges()

      expect(component.formGroup.reset).toHaveBeenCalled()
    })
  })

  describe('onSave - creating and updating a parameter', () => {
    it('should create a parameter', () => {
      apiServiceSpy.createParameterValue.and.returnValue(of({}))
      component.changeMode = 'CREATE'
      spyOn(component.hideDialogAndChanged, 'emit')
      component.formGroup = formGroup

      component.onSave()

      expect(msgServiceSpy.success).toHaveBeenCalledWith({
        summaryKey: 'ACTIONS.CREATE.MESSAGE.OK'
      })
      expect(component.hideDialogAndChanged.emit).toHaveBeenCalledWith(true)
    })

    it('should display error if creation fails', () => {
      apiServiceSpy.createParameterValue.and.returnValue(throwError(() => new Error()))
      component.changeMode = 'CREATE'
      component.formGroup = formGroup

      component.onSave()

      expect(component.formGroup.valid).toBeTrue()
      expect(msgServiceSpy.error).toHaveBeenCalledWith({
        summaryKey: 'ACTIONS.CREATE.MESSAGE.NOK'
      })
    })

    it('should update a parameter', () => {
      apiServiceSpy.updateParameterValue.and.returnValue(of({}))
      component.changeMode = 'EDIT'
      component.formGroup = formGroup
      spyOn(component.hideDialogAndChanged, 'emit')

      component.onSave()

      expect(msgServiceSpy.success).toHaveBeenCalledWith({
        summaryKey: 'ACTIONS.EDIT.MESSAGE.OK'
      })
      expect(component.hideDialogAndChanged.emit).toHaveBeenCalledWith(true)
    })

    it('should display error if update fails', () => {
      apiServiceSpy.updateParameterValue.and.returnValue(throwError(() => new Error()))
      component.changeMode = 'EDIT'
      component.formGroup = formGroup

      component.onSave()

      expect(msgServiceSpy.error).toHaveBeenCalledWith({
        summaryKey: 'ACTIONS.EDIT.MESSAGE.NOK'
      })
    })
  })

  describe('onChangeProductName', () => {
    it('should update appIdOptions based on the product name', () => {
      component.allProducts = [
        { productName: 'Product A', applications: ['app1', 'app2'] },
        { productName: 'Product B', applications: ['app3'] }
      ]
      component.onChangeProductName('Product A')

      expect(component.appIdOptions).toEqual([
        { label: 'App1', value: 'app1' },
        { label: 'App2', value: 'app2' }
      ])
      expect(component.formGroup.controls['applicationId'].value).toBeNull()
    })

    it('should clear appIdOptions if productName does not match', () => {
      component.allProducts = [{ productName: 'Product A', applications: ['App1', 'App2'] }]
      component.onChangeProductName('Product C')

      expect(component.appIdOptions).toEqual([])
      expect(component.formGroup.controls['applicationId'].value).toBeNull()
    })
  })

  /*
   * UI ACTIONS
   */
  it('should close the dialog', () => {
    spyOn(component.hideDialogAndChanged, 'emit')
    component.onDialogHide()

    expect(component.displayDialog).toBeFalse()
    expect(component.hideDialogAndChanged.emit).toHaveBeenCalledWith(false)
  })
})
