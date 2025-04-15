import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { DatePipe } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormBuilder } from '@angular/forms'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'

import { History, HistoriesAPIService, HistoryCriteria, HistoryPageResult, Parameter } from 'src/app/shared/generated'
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
const history: History[] = [
  {
    id: 'h1',
    applicationId: parameter.applicationId!,
    productName: parameter.productName!,
    name: parameter.name!,
    usedValue: 'val1',
    defaultValue: 'val1',
    instanceId: '123',
    count: 3
  }
]

describe('HistoryComponent', () => {
  let component: ParameterHistoryComponent
  let fixture: ComponentFixture<ParameterHistoryComponent>
  let datePipe: DatePipe

  const historyApiSpy = {
    getAllHistory: jasmine.createSpy('getAllHistory').and.returnValue(of({}))
  }
  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }

  beforeEach(waitForAsync(() => {
    datePipe = new DatePipe('en-US')

    TestBed.configureTestingModule({
      declarations: [ParameterHistoryComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: mockUserService },
        { provide: HistoriesAPIService, useValue: historyApiSpy },
        { provide: DatePipe, useValue: datePipe }
      ]
    }).compileComponents()
    // to spy data: reset
    historyApiSpy.getAllHistory.calls.reset()
    // to spy data: refill with neutral data
    historyApiSpy.getAllHistory.and.returnValue(of({}))
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterHistoryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    component.displayDialog = true
  })

  afterEach(() => {})

  describe('construction', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
    })
  })

  it('should close the dialog', () => {
    spyOn(component.hideDialog, 'emit')
    component.onDialogHide()

    expect(component.hideDialog.emit).toHaveBeenCalled()
  })

  describe('search', () => {
    it('should search history - get result', (done) => {
      const criteria: HistoryCriteria = {
        name: parameter.name,
        productName: parameter.productName,
        applicationId: parameter.applicationId
      }
      const result: HistoryPageResult = { stream: history }
      historyApiSpy.getAllHistory.and.returnValue(of(result))

      component.onSearch(criteria)

      component.data$?.subscribe({
        next: (data) => {
          expect(data).toEqual(history)
          done()
        },
        error: done.fail
      })
    })

    it('should search history - get empty result', (done) => {
      const criteria: HistoryCriteria = {
        name: parameter.name,
        productName: parameter.productName,
        applicationId: parameter.applicationId
      }
      const result: HistoryPageResult = { stream: [] }
      historyApiSpy.getAllHistory.and.returnValue(of(result))

      component.onSearch(criteria)

      component.data$?.subscribe({
        next: (data) => {
          expect(data.length).toEqual(0)
          done()
        },
        error: done.fail
      })
    })

    it('should search history - get no result', (done) => {
      const criteria: HistoryCriteria = {
        name: parameter.name,
        productName: parameter.productName,
        applicationId: parameter.applicationId
      }
      const result: HistoryPageResult = { stream: undefined }
      historyApiSpy.getAllHistory.and.returnValue(of(result))

      component.onSearch(criteria)

      component.data$?.subscribe({
        next: (data) => {
          expect(data.length).toEqual(0)
          done()
        },
        error: done.fail
      })
    })

    it('should search history - missing criteria', () => {
      const criteria: HistoryCriteria = {
        name: parameter.name,
        productName: parameter.productName
      }
      spyOn(console, 'error')

      component.onSearch(criteria)

      expect(console.error).toHaveBeenCalledWith('Missing search criteria for getting parameter history', criteria)
    })

    it('should search history - get error', (done) => {
      const criteria: HistoryCriteria = {
        name: parameter.name,
        productName: parameter.productName,
        applicationId: parameter.applicationId
      }
      const errorResponse = { status: '403', statusText: 'Not authorized' }
      historyApiSpy.getAllHistory.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.onSearch(criteria)

      component.data$?.subscribe({
        next: (data) => {
          expect(data).toEqual([])
          done()
        },
        error: () => {
          expect(component.exceptionKey).toBe('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.HISTORY')
          expect(console.error).toHaveBeenCalledWith('getAllHistory', errorResponse)
          done.fail
        }
      })
    })
  })
})
