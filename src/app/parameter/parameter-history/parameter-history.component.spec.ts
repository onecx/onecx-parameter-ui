import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { DatePipe } from '@angular/common'
import { provideHttpClient, HttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormBuilder } from '@angular/forms'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { of, throwError } from 'rxjs'

import { AppStateService, UserService } from '@onecx/angular-integration-interface'
import { createTranslateLoader, PortalMessageService } from '@onecx/portal-integration-angular'

import { ParametersAPIService, HistoriesAPIService, Parameter } from 'src/app/shared/generated'
import { ParameterHistoryComponent } from './parameter-history.component'

const productName = 'prod1'
const app = 'app1'
const parameter: Parameter = {
  id: 'pid',
  productName: productName,
  applicationId: app,
  name: 'name',
  displayName: 'displayName',
  value: 'value'
}

describe('HistoryComponent', () => {
  let component: ParameterHistoryComponent
  let fixture: ComponentFixture<ParameterHistoryComponent>
  let datePipe: DatePipe

  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error'])
  const apiServiceSpy = {
    getParameterById: jasmine.createSpy('getParameterById').and.returnValue(of({}))
  }
  const historyServiceSpy = {
    getAllHistory: jasmine.createSpy('getAllHistory').and.returnValue(of({})),
    getCountsByCriteria: jasmine.createSpy('getCountsByCriteria').and.returnValue(of({}))
  }
  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }

  beforeEach(waitForAsync(() => {
    datePipe = new DatePipe('en-US')

    TestBed.configureTestingModule({
      declarations: [ParameterHistoryComponent],
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
        FormBuilder,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: mockUserService },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: ParametersAPIService, useValue: apiServiceSpy },
        { provide: HistoriesAPIService, useValue: historyServiceSpy },
        { provide: DatePipe, useValue: datePipe }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    // to spy data: reset
    apiServiceSpy.getParameterById.calls.reset()
    historyServiceSpy.getAllHistory.calls.reset()
    historyServiceSpy.getCountsByCriteria.calls.reset()
    // to spy data: refill with neutral data
    apiServiceSpy.getParameterById.and.returnValue(of({}))
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterHistoryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    component.displayDialog = true
  })

  afterEach(() => {
    component.formGroup.reset()
  })

  describe('construction', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
    })
  })

  describe('ngOnChanges', () => {
    it('should reject initializing if dialog is not open', () => {
      apiServiceSpy.getParameterById.and.returnValue(of(parameter))
      component.parameter = parameter
      component.displayDialog = false

      component.ngOnChanges()

      expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
    })

    it('should getting parameter ', () => {
      apiServiceSpy.getParameterById.and.returnValue(of(parameter))
      component.parameter = { id: 'id' }

      component.ngOnChanges()

      expect(apiServiceSpy.getParameterById).toHaveBeenCalled()
    })

    it('should prepare viewing a parameter - failed: missing id', () => {
      apiServiceSpy.getParameterById.and.returnValue(of(parameter))
      component.parameter = { ...parameter, id: undefined }

      component.ngOnChanges()

      expect(apiServiceSpy.getParameterById).not.toHaveBeenCalled()
    })

    it('should getting parameter - failed: missing permissions', () => {
      const errorResponse = { status: 403, statusText: 'No permissions' }
      apiServiceSpy.getParameterById.and.returnValue(throwError(() => errorResponse))
      component.parameter = parameter
      spyOn(console, 'error')

      component.ngOnChanges()

      expect(apiServiceSpy.getParameterById).toHaveBeenCalled()
      expect(component.exceptionKey).toBe('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.PARAMETER')
      expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.SEARCH.SEARCH_FAILED' })
      expect(console.error).toHaveBeenCalledWith('getParameterById', errorResponse)
    })
  })

  /*
   * UI ACTIONS
   */
  it('should close the dialog', () => {
    spyOn(component.hideDialog, 'emit')
    component.onDialogHide()

    expect(component.displayDialog).toBeFalse()
    expect(component.hideDialog.emit).toHaveBeenCalled()
  })
})
