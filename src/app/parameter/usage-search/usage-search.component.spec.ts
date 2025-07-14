import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideRouter, Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError } from 'rxjs'

import { PortalMessageService, UserService } from '@onecx/angular-integration-interface'
import { Column } from '@onecx/portal-integration-angular'

import { History, HistoriesAPIService, Product } from 'src/app/shared/generated'
import {
  ApplicationAbstract,
  ExtendedHistory,
  ExtendedProduct,
  UsageSearchComponent,
  ProductAbstract
} from './usage-search.component'
import { ParameterSearchComponent } from '../parameter-search/parameter-search.component'

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
    displayUsedValue: 'Val',
    displayDefaultValue: 'Val',
    isEqual: 'TRUE'
  },
  {
    ...historyRespData[1],
    valueType: 'NUMBER',
    defaultValueType: 'BOOLEAN',
    displayUsedValue: '1234',
    displayDefaultValue: 'true',
    isEqual: 'FALSE'
  },
  {
    ...historyRespData[2],
    valueType: 'OBJECT',
    defaultValueType: 'OBJECT',
    displayUsedValue: '{ ... }',
    displayDefaultValue: '{ ... }',
    isEqual: 'FALSE'
  },
  {
    ...historyRespData[3],
    valueType: 'OBJECT',
    defaultValueType: 'UNKNOWN',
    displayUsedValue: '{ ... }',
    displayDefaultValue: '',
    isEqual: 'FALSE'
  },
  {
    ...historyRespData[4],
    valueType: 'UNKNOWN',
    defaultValueType: 'UNKNOWN',
    displayUsedValue: '',
    displayDefaultValue: '',
    isEqual: 'UNDEFINED'
  },
  {
    ...historyRespData[5],
    valueType: 'BOOLEAN',
    defaultValueType: 'BOOLEAN',
    displayUsedValue: 'false',
    displayDefaultValue: 'false',
    isEqual: 'TRUE'
  }
]
// Original form BFF: unsorted and not complete
const usedProductsOrg: Product[] = [
  { productName: 'product2', displayName: undefined, applications: ['app2-svc'] },
  { productName: 'product1', displayName: undefined, applications: ['app1-svc'] }
]
const app1: ApplicationAbstract = {
  appId: 'app1-svc',
  appName: 'OneCX app svc 1',
  undeployed: false,
  deprecated: false
}
const app2: ApplicationAbstract = {
  appId: 'app2-svc',
  appName: 'OneCX app svc 2',
  undeployed: false,
  deprecated: false
}
// product store products
const allProductsOrg: ProductAbstract[] = [
  { name: 'product1', displayName: 'Product 1', undeployed: false, applications: [app1] },
  { name: 'product2', displayName: 'Product 2', undeployed: true, applications: [app2] },
  { name: 'product3', displayName: 'Product 3', applications: [{ appId: 'app3-svc' }, { appId: 'app3-bff' }] },
  { name: 'product4', displayName: 'Product 4', applications: [{ appId: 'app4-svc' }, { appId: 'app4-bff' }] },
  { name: 'product5' }
]
const allProducts: ExtendedProduct[] = [
  { name: 'product1', displayName: 'Product 1', undeployed: false, applications: [app1] },
  { name: 'product2', displayName: 'Product 2', undeployed: true, applications: [app2] },
  { name: 'product3', displayName: 'Product 3', applications: [{ appId: 'app3-svc' }, { appId: 'app3-bff' }] },
  { name: 'product4', displayName: 'Product 4', applications: [{ appId: 'app4-svc' }, { appId: 'app4-bff' }] },
  { name: 'product5', displayName: 'product5', applications: [] }
]

describe('UsageSearchComponent', () => {
  let component: UsageSearchComponent
  let fixture: ComponentFixture<UsageSearchComponent>
  const routerSpy = jasmine.createSpyObj('router', ['navigate'])
  const routeMock = { snapshot: { paramMap: new Map() } }

  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }
  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])
  const historyApiSpy = {
    getAllHistoryLatest: jasmine.createSpy('getAllHistoryLatest').and.returnValue(of([])),
    getAllHistoryProducts: jasmine.createSpy('getAllHistoryProducts').and.returnValue(of([]))
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UsageSearchComponent],
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
        provideRouter([{ path: '', component: ParameterSearchComponent }]),
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: UserService, useValue: mockUserService },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: HistoriesAPIService, useValue: historyApiSpy }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    msgServiceSpy.info.calls.reset()
    mockUserService.lang$.getValue.and.returnValue('de')
    // reset data services
    historyApiSpy.getAllHistoryLatest.calls.reset()
    historyApiSpy.getAllHistoryProducts.calls.reset()
    // to spy data: refill with neutral data
    historyApiSpy.getAllHistoryLatest.and.returnValue(of({}))
    historyApiSpy.getAllHistoryProducts.and.returnValue(of([]))
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  describe('construction', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
    })

    it('should call OnInit and populate filteredColumns/actions correctly', () => {
      component.ngOnInit()
      expect(component.filteredColumns[0]).toEqual(component.columns[0])
    })

    it('dataview translations', (done) => {
      const translationData = {
        'DIALOG.DATAVIEW.FILTER': 'filter'
      }
      const translateService = TestBed.inject(TranslateService)
      spyOn(translateService, 'get').and.returnValue(of(translationData))

      component.ngOnInit()

      component.dataViewControlsTranslations$?.subscribe({
        next: (data) => {
          if (data) {
            expect(data.filterInputPlaceholder).toEqual('filter')
          }
          done()
        },
        error: done.fail
      })
    })
  })

  describe('page actions', () => {
    it('should go to parameter search', () => {
      spyOn(component, 'onGoToParameterSearchPage')

      component.ngOnInit()
      component.actions[0].actionCallback()

      expect(component.onGoToParameterSearchPage).toHaveBeenCalled()
    })
  })

  describe('search', () => {
    it('should search parameters without search criteria', (done) => {
      historyApiSpy.getAllHistoryLatest.and.returnValue(of({ stream: historyRespData }))

      component.onSearch({})

      component.data$?.subscribe({
        next: (data) => {
          expect(data).toEqual(historyData)
          done()
        },
        error: done.fail
      })
    })

    it('should display an info message if there is no result', (done) => {
      historyApiSpy.getAllHistoryLatest.and.returnValue(of({ totalElements: 0, stream: [] }))

      component.onSearch({})

      component.data$?.subscribe({
        next: (data) => {
          expect(data.length).toEqual(0)
          expect(msgServiceSpy.info).toHaveBeenCalledOnceWith({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.NO_RESULTS' })
          done()
        },
        error: done.fail
      })
    })

    it('should display an error message if the search fails', (done) => {
      const errorResponse = { status: '403', statusText: 'Not authorized' }
      historyApiSpy.getAllHistoryLatest.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.onSearch({})

      component.data$?.subscribe({
        next: (data) => {
          expect(data).toEqual([])
          done()
        },
        error: () => {
          expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.SEARCH_FAILED' })
          expect(console.error).toHaveBeenCalledWith('getAllHistoryLatest', errorResponse)
          done.fail
        }
      })
    })
  })

  /**
   * META data: which were assigned to data
   */
  describe('service data', () => {
    it('should get products which are assigned to data', (done) => {
      historyApiSpy.getAllHistoryProducts.and.returnValue(of(usedProductsOrg))

      component.ngOnInit()

      component.usedProducts$?.subscribe({
        next: (data) => {
          expect(data).toEqual(usedProductsOrg)
          done()
        },
        error: done.fail
      })
    })

    it('should get all products assigned to', (done) => {
      const errorResponse = { status: '404', statusText: 'An error occur' }
      historyApiSpy.getAllHistoryProducts.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.ngOnInit()

      component.usedProducts$?.subscribe({
        next: (data) => {
          expect(data).toEqual([])
          done()
        },
        error: () => {
          expect(console.error).toHaveBeenCalledOnceWith('getAllHistoryProducts', errorResponse)
          done.fail
        }
      })
    })
  })

  describe('META data', () => {
    it('should get product store products - successful', (done) => {
      component.slotEmitter.emit(allProductsOrg)
      historyApiSpy.getAllHistoryProducts.and.returnValue(of(usedProductsOrg))

      component.ngOnInit()

      component.usedProducts$?.subscribe({
        next: (data) => {
          expect(data).toEqual(usedProductsOrg)
          done()
        },
        error: done.fail
      })
    })
  })

  /*
   * UI ACTIONS
   */
  describe('detail actions', () => {
    it('should prepare the creation of a new parameter', () => {
      const ev: MouseEvent = new MouseEvent('type')
      spyOn(ev, 'stopPropagation')
      const mode = 'CREATE'

      component.onDetail(mode, undefined, ev)

      expect(ev.stopPropagation).toHaveBeenCalled()
      expect(component.changeMode).toEqual(mode)
      expect(component.item4Detail).toBe(undefined)
      expect(component.displayDetailDialog).toBeTrue()

      component.onCloseDetail(false)

      expect(component.displayDetailDialog).toBeFalse()
    })

    it('should show details of a parameter', () => {
      const mode = 'EDIT'

      component.onDetail(mode, historyData[0])

      expect(component.changeMode).toEqual(mode)
      expect(component.item4Detail).toBe(historyData[0])
      expect(component.displayDetailDialog).toBeTrue()
    })

    it('should prepare the copy of a parameter', () => {
      const mode = 'COPY'

      component.onDetail(mode, historyData[0])

      expect(component.changeMode).toEqual(mode)
      expect(component.item4Detail).toBe(historyData[0])
      expect(component.displayDetailDialog).toBeTrue()

      component.onCloseDetail(true)

      expect(component.displayDetailDialog).toBeFalse()
    })
  })

  describe('filter columns', () => {
    it('should update the columns that are seen in data', () => {
      const columns: Column[] = [
        { field: 'productName', header: 'PRODUCT_NAME' },
        { field: 'description', header: 'DESCRIPTION' }
      ]
      const expectedColumn = { field: 'productName', header: 'PRODUCT_NAME' }
      component.columns = columns

      component.onColumnsChange(['productName'])

      expect(component.filteredColumns).not.toContain(columns[1])
      expect(component.filteredColumns).toEqual([jasmine.objectContaining(expectedColumn)])
    })

    it('should apply a filter to the result table', () => {
      component.dataTable = jasmine.createSpyObj('dataTable', ['filterGlobal'])

      component.onFilterChange('test')

      expect(component.dataTable?.filterGlobal).toHaveBeenCalledWith('test', 'contains')
    })
  })

  describe('display names', () => {
    it('should get product display name - found', () => {
      const name = component.getProductDisplayName(allProducts[0].name, allProducts)

      expect(name).toBe(allProducts[0].displayName)
    })

    it('should get product display name - not found', () => {
      const name = component.getProductDisplayName('unknown', allProducts)

      expect(name).toBe('unknown')
    })

    it('should get app display name - found', () => {
      const ap = allProducts[0]
      const apps = ap.applications
      const app = apps[0]
      const name = component.getAppDisplayName(allProducts[0].name, app.appId, allProducts)

      expect(name).toBe(app.appName)
    })

    it('should get product display name - not found', () => {
      const name = component.getAppDisplayName(allProducts[2].name, 'unknown', allProducts)

      expect(name).toBe('unknown')
    })
  })

  describe('onUsage', () => {
    it('should stop event propagation, set parameter, and display history dialog', () => {
      const event = new MouseEvent('click')
      spyOn(event, 'stopPropagation')

      component.onUsage(event, historyData[0])

      expect(event.stopPropagation).toHaveBeenCalled()
      expect(component.item4Detail).toEqual(historyData[0])
      expect(component.displayUsageDialog).toBeTrue()
    })

    it('should hide the history dialog', () => {
      component.displayUsageDialog = true

      component.onCloseUsage()

      expect(component.displayUsageDialog).toBeFalse()
    })
  })

  describe('onCriteriaReset', () => {
    it('should reset criteria, reset the form group, and disable the applicationId control', () => {
      component.criteria = { name: 'name' }

      component.onCriteriaReset()

      expect(component.criteria).toEqual({})
    })
  })

  it('should navigate back onBack', () => {
    component.onGoToParameterSearchPage()

    expect(routerSpy.navigate).toHaveBeenCalledWith(['../'], { relativeTo: routeMock })
  })

  /**
   * Language tests
   */
  describe('Language tests', () => {
    it('should set a German date format', () => {
      expect(component.dateFormat).toEqual('dd.MM.yyyy HH:mm:ss')
    })

    it('should set default date format', () => {
      mockUserService.lang$.getValue.and.returnValue('en')
      fixture = TestBed.createComponent(UsageSearchComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
      expect(component.dateFormat).toEqual('M/d/yy, hh:mm:ss a')
    })
  })

  /**
   * Utility tests
   */
  describe('utility functions', () => {
    it('should calc duration - with both values', () => {
      const duration = component.onCalcDuration('2024-01-01T01:00:00Z', '2024-01-01T01:10:00Z')

      expect(duration).toBe('00:10:00')
    })

    it('should calc duration - with mission values', () => {
      const duration = component.onCalcDuration('', '2024-01-01T01:10:00Z')

      expect(duration).toBe('')
    })

    it('should calc duration - with mission values', () => {
      const duration = component.onCalcDuration('2024-01-01T01:00:00Z', '')

      expect(duration).toBe('')
    })
  })
})
