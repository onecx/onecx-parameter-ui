import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient, HttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { of } from 'rxjs'
import { DatePipe } from '@angular/common'
import { FormBuilder } from '@angular/forms'

import { AppStateService, createTranslateLoader, PortalMessageService } from '@onecx/portal-integration-angular'

import { ParametersAPIService, HistoriesAPIService, Parameter } from 'src/app/shared/generated'
import { ParameterHistoryComponent } from './parameter-history.component'

const productName = 'prod1'
const app = 'app1'

const parameter: Parameter = {
  id: 'id',
  productName: productName,
  applicationId: app,
  name: 'name',
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
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: ParametersAPIService, useValue: apiServiceSpy },
        { provide: HistoriesAPIService, useValue: historyServiceSpy },
        { provide: DatePipe, useValue: datePipe }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    apiServiceSpy.getParameterById.calls.reset()
    historyServiceSpy.getAllHistory.calls.reset()
    historyServiceSpy.getCountsByCriteria.calls.reset()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterHistoryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    component.formGroup.reset()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnChanges', () => {
    it('should call getParameter and loadTranslations if parameter is defined', () => {
      component.parameter = parameter

      spyOn(component as any, 'getParameter')
      spyOn(component as any, 'loadTranslations')

      component.ngOnChanges()

      expect(component['getParameter']).toHaveBeenCalledWith('id')
      expect(component['loadTranslations']).toHaveBeenCalled()
    })

    it('should only loadTranslations if parameter is undefined', () => {
      spyOn(component as any, 'getParameter')
      spyOn(component as any, 'loadTranslations')

      component.ngOnChanges()

      expect(component['getParameter']).not.toHaveBeenCalled()
      expect(component['loadTranslations']).toHaveBeenCalled()
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
