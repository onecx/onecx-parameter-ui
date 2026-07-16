import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideRouter, Router, ActivatedRoute } from '@angular/router'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError } from 'rxjs'

import { PortalMessageService, UserService } from '@onecx/angular-integration-interface'
import { Filter } from '@onecx/angular-accelerator'

import { Parameter, ParametersAPIService, Product } from 'src/app/shared/generated'
import {
  ApplicationAbstract,
  ExtendedParameter,
  ExtendedProduct,
  ParameterSearchComponent,
  ProductAbstract
} from './parameter-search.component'
import { UsageSearchComponent } from '../usage-search/usage-search.component'

// response data of parameter search service
const paramRespData: Parameter[] = [
  {
    modificationCount: 0,
    id: 'id0',
    productName: 'product1',
    applicationId: 'app1',
    name: 'name0',
    displayName: 'Name 0',
    value: 'val1',
    importValue: 'val1'
  },
  {
    modificationCount: 0,
    id: 'id1',
    productName: 'product1',
    applicationId: 'app2',
    name: 'name1',
    displayName: 'Name 1',
    value: true,
    importValue: false
  },
  {
    modificationCount: 0,
    id: 'id2',
    productName: 'product1',
    applicationId: 'app2',
    name: 'name2',
    displayName: 'name2',
    value: { v: 'v2' },
    importValue: { v: 'v2' }
  },
  {
    modificationCount: 0,
    id: 'id4',
    productName: 'product1',
    applicationId: 'app2',
    name: 'name3',
    displayName: 'Name 3',
    value: { v: 'v2' },
    importValue: { v: 'v2', w: true }
  },
  {
    modificationCount: 0,
    id: 'id4',
    productName: 'product1',
    applicationId: 'app2',
    name: 'name4',
    displayName: 'Name 4',
    value: 'text',
    importValue: false
  },
  {
    modificationCount: 0,
    id: 'id5',
    productName: 'product1',
    applicationId: 'app2',
    name: 'name5',
    displayName: 'Name 5',
    importValue: false
  },
  {
    modificationCount: 0,
    id: 'id6',
    productName: 'product1',
    applicationId: 'app2',
    name: 'name6',
    value: undefined,
    importValue: undefined
  },
  {
    modificationCount: 0,
    productName: 'product1',
    applicationId: 'app2',
    name: 'name7',
    displayName: 'Name 7',
    value: 'val7',
    importValue: 'val7'
  } as Parameter
]
// data in component
const parameterData = [
  {
    ...paramRespData[0],
    valueType: 'STRING',
    importValueType: 'STRING',
    displayValue: 'val1',
    isEqual: 'TRUE',
    imagePath: ''
  },
  {
    ...paramRespData[1],
    valueType: 'BOOLEAN',
    importValueType: 'BOOLEAN',
    displayValue: 'true',
    isEqual: 'FALSE',
    imagePath: ''
  },
  {
    ...paramRespData[2],
    valueType: 'OBJECT',
    importValueType: 'OBJECT',
    displayValue: '{ ... }',
    isEqual: 'TRUE',
    imagePath: ''
  },
  {
    ...paramRespData[3],
    valueType: 'OBJECT',
    importValueType: 'OBJECT',
    displayValue: '{ ... }',
    isEqual: 'FALSE',
    imagePath: ''
  },
  {
    ...paramRespData[4],
    valueType: 'STRING',
    importValueType: 'BOOLEAN',
    displayValue: 'text',
    isEqual: 'FALSE',
    imagePath: ''
  },
  {
    ...paramRespData[5],
    valueType: 'UNKNOWN',
    importValueType: 'BOOLEAN',
    displayValue: 'false',
    isEqual: 'FALSE',
    imagePath: ''
  },
  {
    ...paramRespData[6],
    valueType: 'UNKNOWN',
    importValueType: 'UNKNOWN',
    displayValue: '',
    isEqual: 'UNDEFINED',
    displayName: 'name6',
    imagePath: ''
  },
  {
    ...paramRespData[7],
    id: '',
    valueType: 'STRING',
    importValueType: 'STRING',
    displayValue: 'val7',
    isEqual: 'TRUE',
    imagePath: ''
  }
] as ExtendedParameter[]
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

describe('ParameterSearchComponent', () => {
  let component: ParameterSearchComponent
  let fixture: ComponentFixture<ParameterSearchComponent>
  const routerSpy = jasmine.createSpyObj('router', ['navigate'])
  const routeMock = { snapshot: { paramMap: new Map() } }

  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }
  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])
  const apiServiceSpy = {
    getAllProducts: jasmine.createSpy('getAllProducts').and.returnValue(of([])),
    searchParametersByCriteria: jasmine.createSpy('searchParametersByCriteria').and.returnValue(of({}))
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ParameterSearchComponent],
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
        provideRouter([{ path: 'usage', component: UsageSearchComponent }]),
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: UserService, useValue: mockUserService },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: ParametersAPIService, useValue: apiServiceSpy }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    msgServiceSpy.info.calls.reset()
    mockUserService.lang$.getValue.and.returnValue('de')
    // reset data services
    apiServiceSpy.searchParametersByCriteria.calls.reset()
    apiServiceSpy.getAllProducts.calls.reset()
    // to spy data: refill with neutral data
    apiServiceSpy.searchParametersByCriteria.and.returnValue(of({}))
    apiServiceSpy.getAllProducts.and.returnValue(of([]))
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  describe('construction', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
    })

    it('should call OnInit and populate columns correctly', () => {
      component.ngOnInit()
      expect(component.columns[0].id).toEqual('name')
      expect(component.columns.length).toBeGreaterThan(0)
    })
  })

  describe('page actions', () => {
    it('should open create dialog', () => {
      spyOn(component, 'onDetail')

      component.ngOnInit()
      component.actions[0].actionCallback?.()

      expect(component.onDetail).toHaveBeenCalled()
    })

    it('should go to latest usage page', () => {
      spyOn(component, 'onGoToLatestUsagePage')

      component.ngOnInit()
      component.actions[1].actionCallback?.()

      expect(component.onGoToLatestUsagePage).toHaveBeenCalled()
    })

    it('should navigate to latest usage page', () => {
      component.onGoToLatestUsagePage()

      expect(routerSpy.navigate).toHaveBeenCalledWith(['./usage'], { relativeTo: routeMock })
    })
  })

  describe('search', () => {
    it('should search parameters without search criteria', (done) => {
      apiServiceSpy.searchParametersByCriteria.and.returnValue(of({ stream: paramRespData }))

      component.onSearch({})

      component.data$?.subscribe({
        next: (data) => {
          expect(data).toEqual(parameterData)
          done()
        },
        error: done.fail
      })
    })

    it('should display an info message if there is no result', (done) => {
      apiServiceSpy.searchParametersByCriteria.and.returnValue(of({ totalElements: 0, stream: [] }))

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
      apiServiceSpy.searchParametersByCriteria.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.onSearch({})

      component.data$?.subscribe({
        next: (data) => {
          expect(data).toEqual([])
          done()
        },
        error: () => {
          expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.SEARCH.MESSAGE.SEARCH_FAILED' })
          expect(console.error).toHaveBeenCalledWith('searchParametersByCriteria', errorResponse)
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
      apiServiceSpy.getAllProducts.and.returnValue(of(usedProductsOrg))

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
      apiServiceSpy.getAllProducts.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.ngOnInit()

      component.usedProducts$?.subscribe({
        next: (data) => {
          expect(data).toEqual([])
          done()
        },
        error: () => {
          expect(component.exceptionKeyMeta).toBe('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.PRODUCTS')
          expect(console.error).toHaveBeenCalledOnceWith('getAllProducts', errorResponse)
          done.fail
        }
      })
    })
  })

  describe('META data', () => {
    it('should get product store products - successful', (done) => {
      component.slotEmitter.emit(allProductsOrg)
      apiServiceSpy.getAllProducts.and.returnValue(of(usedProductsOrg))

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
      expect(component.item4Detail).toEqual({})
      expect(component.displayDetailDialog).toBeTrue()

      component.onCloseDetail(false)

      expect(component.displayDetailDialog).toBeFalse()
    })

    it('should show details of a parameter', () => {
      const mode = 'EDIT'

      component.onDetail(mode, parameterData[0])

      expect(component.changeMode).toEqual(mode)
      expect(component.itemId).toBe(parameterData[0].id)
      expect(component.displayDetailDialog).toBeTrue()
    })

    it('should prepare the copy of a parameter', () => {
      const mode = 'COPY'

      component.onDetail(mode, parameterData[0])

      expect(component.changeMode).toEqual(mode)
      expect(component.item4Detail).toEqual(parameterData[0])
      expect(component.displayDetailDialog).toBeTrue()

      component.onCloseDetail(true)

      expect(component.displayDetailDialog).toBeFalse()
    })
  })

  describe('deletion', () => {
    let items4Deletion: Parameter[] = []

    beforeEach(() => {
      items4Deletion = [
        { id: 'id1', productName: 'product1', applicationId: 'app1', name: 'name1' },
        { id: 'id2', productName: 'product1', applicationId: 'app1', name: 'name2' },
        { id: 'id3', productName: 'product3', applicationId: 'app1', name: 'name2' }
      ]
    })

    it('should prepare the deletion of a parameter - ok', () => {
      component.onDelete(items4Deletion[0])

      expect(component.item4Delete).toEqual(items4Deletion[0])
      expect(component.displayDeleteDialog).toBeTrue()
    })

    it('should manage data after parameter deletion', () => {
      expect(items4Deletion.length).toBe(3)

      component.onDelete(items4Deletion[1])
      component.onDeleteClosed(true, items4Deletion) // remove but not the last of the product

      expect(component.displayDeleteDialog).toBeFalse()
      expect(component.item4Delete).toBeUndefined()

      component.onDelete(items4Deletion[2])
      component.onDeleteClosed(true, items4Deletion) // remove and this was the last of the product

      expect(component.displayDeleteDialog).toBeFalse()
      expect(component.item4Delete).toBeUndefined()
    })

    it('should manage data after parameter delete dialog is only closed', () => {
      component.onDelete(items4Deletion[0])
      component.onDeleteClosed(false, items4Deletion)

      expect(component.item4Delete).toBeUndefined()
    })
  })

  describe('filter change', () => {
    it('should update the filters used by the data view', () => {
      const filters: Filter[] = [{ columnId: 'applicationId', value: 'app1' }]

      component.onFilterChange(filters)

      expect(component.filters).toEqual(filters)
    })
  })

  describe('UI displaying product/app names', () => {
    it('should manage empty product lists', () => {
      const name = component.getProductDisplayName(allProducts[0].name, [])

      expect(name).toBe(allProducts[0].name)
    })

    it('should get product display name - found', () => {
      const name = component.getProductDisplayName(allProducts[0].name, allProducts)

      expect(name).toBe(allProducts[0].displayName)
    })

    it('should get product display name - not found', () => {
      const name = component.getProductDisplayName('unknown', allProducts)

      expect(name).toBe('unknown')
    })

    describe('apps', () => {
      const ap = allProducts[0]
      const apps = ap.applications
      const app = apps[0]

      it('should manage empty product lists', () => {
        const name = component.getAppDisplayName(allProducts[0].name, app.appId, [])

        expect(name).toBe(allProducts[0].name)
      })

      it('should get app display name - found', () => {
        const name = component.getAppDisplayName(allProducts[0].name, app.appId, allProducts)

        expect(name).toBe(app.appName)
      })

      it('should get product display name - not found', () => {
        const name = component.getAppDisplayName(allProducts[2].name, 'unknown', allProducts)

        expect(name).toBe('unknown')
      })
    })
  })

  describe('row actions', () => {
    it('should display usage detail dialog', () => {
      component.onDetailUsage(parameterData[0])

      expect(component.item4Detail).toEqual(parameterData[0])
      expect(component.displayUsageDetailDialog).toBeTrue()
    })

    it('should hide the usage detail dialog', () => {
      component.displayUsageDetailDialog = true

      component.onCloseUsageDetail()

      expect(component.displayUsageDetailDialog).toBeFalse()
    })

    it('should invoke onDetail via the copy additionalAction callback', () => {
      spyOn(component, 'onDetail')
      const copyAction = component.additionalActions.find((a) => a.id === 'copy')

      copyAction?.callback?.(parameterData[0])

      expect(component.onDetail).toHaveBeenCalledWith('COPY', parameterData[0])
    })

    it('should invoke onDetailUsage via the usage additionalAction callback', () => {
      spyOn(component, 'onDetailUsage')
      const usageAction = component.additionalActions.find((a) => a.id === 'usage')

      usageAction?.callback?.(parameterData[0])

      expect(component.onDetailUsage).toHaveBeenCalledWith(parameterData[0])
    })
  })

  describe('onCriteriaReset', () => {
    it('should reset criteria, reset the form group, and disable the applicationId control', () => {
      component.criteria = { name: 'name' }

      component.onCriteriaReset()

      expect(component.criteria).toEqual({})
    })
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
      fixture = TestBed.createComponent(ParameterSearchComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
      expect(component.dateFormat).toEqual('M/d/yy, hh:mm:ss a')
    })
  })
})
