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
import { DetailHistoryComponent } from './detail-history.component'
import { ExtendedHistory } from '../parameter-history/parameter-history.component'

// response data of parameter search service
// response data of parameter search service
const historyRespData: History[] = [
  {
    id: 'id0',
    productName: 'product1',
    applicationId: 'app1',
    name: 'name0',
    usedValue: 'Val',
    defaultValue: 'Val',
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-01T00:10:00Z'
  },
  {
    id: 'id1',
    productName: 'product1',
    applicationId: 'app1',
    name: 'name1',
    usedValue: 1234,
    defaultValue: true,
    start: '2024-01-01T00:20:00Z',
    end: '2024-01-01T00:25:00Z'
  },
  {
    id: 'id2',
    productName: 'product1',
    applicationId: 'app1',
    name: 'name2',
    usedValue: { hallo: 'test', hi: 'all' },
    defaultValue: { hallo: 'test' },
    start: '2024-01-01T00:20:00Z',
    end: '2024-01-01T00:25:00Z'
  },
  {
    id: 'id3',
    productName: 'product1',
    applicationId: 'app1',
    name: 'name3',
    usedValue: { hallo: 'test', hi: 'all' },
    start: '2024-01-01T00:20:00Z',
    end: '2024-01-01T00:25:00Z'
  },
  {
    id: 'id4',
    productName: 'product1',
    applicationId: 'app1',
    name: 'no data',
    start: '2024-01-01T00:20:00Z',
    end: '2024-01-01T00:25:00Z'
  },
  {
    id: 'id5',
    productName: 'product1',
    applicationId: 'app1',
    name: 'boolean comparison',
    usedValue: false,
    defaultValue: false,
    start: '2024-01-01T00:20:00Z',
    end: '2024-01-01T00:25:00Z'
  }
]
const historyData: ExtendedHistory[] = [
  {
    ...historyRespData[0],
    valueType: 'STRING',
    defaultValueType: 'STRING',
    displayValue: 'Val',
    defaultDisplayValue: 'Val',
    isEqual: 'TRUE'
  },
  {
    ...historyRespData[1],
    valueType: 'NUMBER',
    defaultValueType: 'BOOLEAN',
    displayValue: '1234',
    defaultDisplayValue: 'true',
    isEqual: 'FALSE'
  },
  {
    ...historyRespData[2],
    valueType: 'OBJECT',
    defaultValueType: 'OBJECT',
    displayValue: '{ ... }',
    defaultDisplayValue: '{ ... }',
    isEqual: 'FALSE'
  },
  {
    ...historyRespData[3],
    valueType: 'OBJECT',
    defaultValueType: 'UNKNOWN',
    displayValue: '{ ... }',
    defaultDisplayValue: '',
    isEqual: 'FALSE'
  },
  {
    ...historyRespData[4],
    valueType: 'UNKNOWN',
    defaultValueType: 'UNKNOWN',
    displayValue: '',
    defaultDisplayValue: '',
    isEqual: 'UNDEFINED'
  },
  {
    ...historyRespData[5],
    valueType: 'BOOLEAN',
    defaultValueType: 'BOOLEAN',
    displayValue: 'false',
    defaultDisplayValue: 'false',
    isEqual: 'TRUE'
  }
]
const parameter: Parameter = {
  id: 'pid',
  productName: 'prod1',
  applicationId: 'app1',
  name: 'name',
  displayName: 'displayName',
  value: 'value'
}

describe('HistoryComponent', () => {
  let component: DetailHistoryComponent
  let fixture: ComponentFixture<DetailHistoryComponent>
  let datePipe: DatePipe

  const historyApiSpy = {
    getAllHistory: jasmine.createSpy('getAllHistory').and.returnValue(of({}))
  }
  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }

  beforeEach(waitForAsync(() => {
    datePipe = new DatePipe('en-US')

    TestBed.configureTestingModule({
      declarations: [DetailHistoryComponent],
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
    fixture = TestBed.createComponent(DetailHistoryComponent)
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
      const response: HistoryPageResult = { stream: historyRespData }
      historyApiSpy.getAllHistory.and.returnValue(of(response))

      component.onSearch(criteria)

      component.data$?.subscribe({
        next: (data) => {
          expect(data).toEqual(historyData)
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
      const response: HistoryPageResult = { stream: [] }
      historyApiSpy.getAllHistory.and.returnValue(of(response))

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

      expect(console.error).toHaveBeenCalledWith('Missing search criteria for getting parameter usage', criteria)
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
          expect(component.exceptionKey).toBe('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.USAGE')
          expect(console.error).toHaveBeenCalledWith('getAllHistory', errorResponse)
          done.fail
        }
      })
    })
  })
})
