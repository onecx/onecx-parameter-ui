import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient, HttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormControl, FormGroup } from '@angular/forms'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { of, throwError } from 'rxjs'
import { SelectItem } from 'primeng/api'

import { AppStateService, UserService } from '@onecx/angular-integration-interface'
import { createTranslateLoader, PortalMessageService } from '@onecx/portal-integration-angular'

import { Parameter, ParametersAPIService, Product } from 'src/app/shared/generated'
import { ParameterDetailComponent } from './parameter-detail.component'

const parameter: Parameter = {
  modificationCount: 0,
  id: 'id',
  productName: 'prod1',
  applicationId: 'app1',
  name: 'name',
  displayName: 'displayName',
  value: 'value'
}
const allProducts: Product[] = [
  { productName: 'prod1', displayName: 'prod1_display' },
  { productName: 'prod2', displayName: 'prod2_display' }
]
const allProductsSI: SelectItem[] = [
  { label: 'prod1_display', value: 'prod1' },
  { label: 'prod2_display', value: 'prod2' }
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
  const formGroup = new FormGroup({
    name: new FormControl('name'),
    value: new FormControl('value'),
    productName: new FormControl('prod name'),
    displayName: new FormControl('display name'),
    applicationId: new FormControl('app')
  })
  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }

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
        { provide: UserService, useValue: mockUserService },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: ParametersAPIService, useValue: apiServiceSpy }
      ]
    }).compileComponents()
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
    fixture = TestBed.createComponent(ParameterDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
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
  })

  describe('ngOnChange - init form', () => {
    it('should create but not initialize if dialog is not open', () => {
      expect(component).toBeTruthy()
      component.displayDialog = false
      component.ngOnChanges()
    })

    describe('VIEW', () => {
      it('should reject initializing if dialog is not open', () => {
        apiServiceSpy.getParameterById.and.returnValue(of(parameter))
        component.parameter = parameter
        component.changeMode = 'VIEW'
        component.displayDialog = false

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
      })

      it('should reject initializing if data is missed', () => {
        apiServiceSpy.getParameterById.and.returnValue(of(parameter))
        component.parameter = undefined
        component.changeMode = 'VIEW'

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
      })

      it('should prepare viewing a parameter - successful', () => {
        apiServiceSpy.getParameterById.and.returnValue(of(parameter))
        component.parameter = parameter
        component.changeMode = 'VIEW'

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).toHaveBeenCalled()
        expect(component.loading).toBeFalse()
        expect(component.formGroup.disabled).toBeTrue()
        expect(component.formGroup.controls['name'].value).toBe(parameter.name)
        expect(component.productOptions).toEqual(allProductsSI)
      })

      it('should prepare viewing a parameter - failed: missing id', () => {
        apiServiceSpy.getParameterById.and.returnValue(of(parameter))
        component.parameter = { ...parameter, id: undefined }
        component.changeMode = 'VIEW'

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
      })

      it('should prepare viewing a parameter - failed: missing permissions', () => {
        const errorResponse = { status: 403, statusText: 'No permissions' }
        apiServiceSpy.getParameterById.and.returnValue(throwError(() => errorResponse))
        component.parameter = parameter
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

    describe('EDIT', () => {
      it('should prepare editing a parameter - successful', () => {
        apiServiceSpy.getParameterById.and.returnValue(of(parameter))
        component.changeMode = 'EDIT'
        component.parameter = parameter

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).toHaveBeenCalled()
        expect(component.loading).toBeFalse()
        expect(component.formGroup.enabled).toBeTrue()
        expect(component.formGroup.controls['name'].value).toEqual(parameter.name)
      })

      it('should prepare editing a parameter - failed: id missed', () => {
        component.changeMode = 'EDIT'
        component.parameter = { ...parameter, id: undefined }

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
      })

      it('should display error if getting the parameter fails', () => {
        const errorResponse = { status: 404, statusText: 'Not Found' }
        apiServiceSpy.getParameterById.and.returnValue(throwError(() => errorResponse))
        component.changeMode = 'EDIT'
        component.parameter = parameter
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
        component.parameter = parameter // will be rejected due to filled

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
        component.changeMode = 'COPY'
        component.parameter = parameter

        component.ngOnChanges()

        expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
        expect(component.formGroup.enabled).toBeTrue()
        expect(component.formGroup.controls['name'].value).toBe(parameter.name)
      })
    })
  })

  describe('onSave - creating and updating a parameter', () => {
    describe('CREATE', () => {
      it('should create a parameter', () => {
        apiServiceSpy.createParameter.and.returnValue(of({}))
        component.changeMode = 'CREATE'
        spyOn(component.hideDialogAndChanged, 'emit')
        component.formGroup = formGroup

        component.onSave()

        expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.CREATE.MESSAGE.OK' })
        expect(component.hideDialogAndChanged.emit).toHaveBeenCalledWith(true)
      })

      it('should display error if creation fails', () => {
        const errorResponse = { status: 400, statusText: 'Could not create ...' }
        apiServiceSpy.createParameter.and.returnValue(throwError(() => errorResponse))
        spyOn(console, 'error')
        component.changeMode = 'CREATE'
        component.formGroup = formGroup

        component.onSave()

        expect(component.formGroup.valid).toBeTrue()
        expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.CREATE.MESSAGE.NOK' })
        expect(console.error).toHaveBeenCalledWith('createParameter', errorResponse)
      })
    })

    describe('COPY', () => {
      it('should create a parameter based on another', () => {
        apiServiceSpy.createParameter.and.returnValue(of({}))
        component.changeMode = 'COPY'
        spyOn(component.hideDialogAndChanged, 'emit')
        component.formGroup = formGroup

        component.onSave()

        expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.CREATE.MESSAGE.OK' })
        expect(component.hideDialogAndChanged.emit).toHaveBeenCalledWith(true)
      })
    })

    describe('EDIT', () => {
      it('should update a parameter - successful', () => {
        apiServiceSpy.updateParameter.and.returnValue(of({}))
        component.changeMode = 'EDIT'
        component.parameter = parameter
        component.formGroup = formGroup
        spyOn(component.hideDialogAndChanged, 'emit')

        component.onSave()

        expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.EDIT.MESSAGE.OK' })
        expect(component.hideDialogAndChanged.emit).toHaveBeenCalledWith(true)
      })

      it('should display error if update fails', () => {
        const errorResponse = { status: 400, statusText: 'Could not update ...' }
        apiServiceSpy.updateParameter.and.returnValue(throwError(() => errorResponse))
        spyOn(console, 'error')
        component.changeMode = 'EDIT'
        component.parameter = parameter
        component.formGroup = formGroup

        component.onSave()

        expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.EDIT.MESSAGE.NOK' })
        expect(console.error).toHaveBeenCalledWith('updateParameter', errorResponse)
      })
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
      it('should reject update appIdOptions if no product name is provided', () => {
        component.onChangeProductName(undefined)

        expect(component.appIdOptions).toEqual([])
      })

      it('should update appIdOptions based on the product name', () => {
        component.allProducts = [
          { productName: 'productA', applications: ['app1', 'app2'] },
          { productName: 'productB', displayName: 'Prouct B', applications: ['app3'] }
        ]
        component.onChangeProductName('productA')

        expect(component.appIdOptions).toEqual([
          { label: 'app1', value: 'app1' },
          { label: 'app2', value: 'app2' }
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
  })
})
