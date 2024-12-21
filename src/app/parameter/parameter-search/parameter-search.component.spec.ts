import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient, HttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { of, throwError } from 'rxjs'

import { AppStateService, UserService } from '@onecx/angular-integration-interface'
import { Column, createTranslateLoader, PortalMessageService } from '@onecx/portal-integration-angular'

import { Parameter, ParametersAPIService, Product, ProductsAPIService } from 'src/app/shared/generated'
import { TranslateServiceMock } from 'src/app/shared/TranslateServiceMock'
import { ParameterSearchComponent } from './parameter-search.component'

let params: Parameter[] = []
const parameterData: Parameter[] = [
  {
    modificationCount: 0,
    id: 'id1',
    productName: 'product1',
    applicationId: 'app1',
    name: 'name1',
    value: 'val1',
    importValue: 'val1'
  },
  {
    modificationCount: 0,
    id: 'id2',
    productName: 'product1',
    applicationId: 'app2',
    name: 'name1',
    value: { v: 'v2' },
    importValue: { v: 'v2' }
  },
  {
    modificationCount: 0,
    id: 'id3',
    productName: 'product3',
    applicationId: 'app3',
    name: 'name3',
    value: 3,
    importValue: 4
  }
]
// Original form BFF: unsorted and not complete
const usedProductsOrg: Product[] = [
  { productName: 'product3', displayName: undefined, applications: ['p3-svc'] },
  { productName: 'product1', displayName: undefined, applications: ['p1-svc'] }
]
// Final: sorted and complete
const usedProducts: Product[] = [
  { productName: 'product1', displayName: 'Product 1', applications: ['p1-svc'] },
  { productName: 'product3', displayName: 'product3', applications: ['p3-svc'] }
]
const allProducts: Product[] = [
  { productName: 'product1', displayName: 'Product 1', applications: ['p1-svc', 'p1-bff'] },
  { productName: 'product2', displayName: 'Product 2', applications: ['p2-svc', 'p2-bff'] },
  { productName: 'product3', displayName: undefined, applications: ['p3-svc', 'p3-bff'] },
  { productName: 'product5', displayName: undefined, applications: ['p5-svc', 'p5-bff'] },
  { productName: 'product4', displayName: undefined, applications: ['p4-svc', 'p4-bff'] }
]

describe('ParameterSearchComponent', () => {
  let component: ParameterSearchComponent
  let fixture: ComponentFixture<ParameterSearchComponent>

  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }
  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])
  const apiServiceSpy = {
    getAllApplications: jasmine.createSpy('getAllApplications').and.returnValue(of([])),
    searchParametersByCriteria: jasmine.createSpy('searchParametersByCriteria').and.returnValue(of({})),
    deleteParameter: jasmine.createSpy('deleteParameter').and.returnValue(of(null))
  }
  const productApiSpy = {
    searchAllAvailableProducts: jasmine.createSpy('searchAllAvailableProducts').and.returnValue(of({}))
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ParameterSearchComponent],
      imports: [
        TranslateModule.forRoot({
          isolate: true,
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
        { provide: TranslateService, useClass: TranslateServiceMock },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: ParametersAPIService, useValue: apiServiceSpy },
        { provide: ProductsAPIService, useValue: productApiSpy }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    msgServiceSpy.info.calls.reset()
    mockUserService.lang$.getValue.and.returnValue('de')
    // reset data services
    apiServiceSpy.searchParametersByCriteria.calls.reset()
    apiServiceSpy.getAllApplications.calls.reset()
    apiServiceSpy.deleteParameter.calls.reset()
    productApiSpy.searchAllAvailableProducts.calls.reset()
    // to spy data: refill with neutral data
    apiServiceSpy.searchParametersByCriteria.and.returnValue(of({}))
    apiServiceSpy.getAllApplications.and.returnValue(of([]))
    apiServiceSpy.deleteParameter.and.returnValue(of(null))
    productApiSpy.searchAllAvailableProducts.and.returnValue(of({}))
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

    it('should call OnInit and populate filteredColumns/actions correctly', () => {
      component.ngOnInit()

      expect(component.filteredColumns[0]).toEqual(component.columns[0])
    })
  })

  describe('search', () => {
    it('should search parameters without search criteria', (done) => {
      apiServiceSpy.searchParametersByCriteria.and.returnValue(of({ stream: parameterData }))

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
  describe('META data: load used products', () => {
    it('should get all products which are assigned to data', (done) => {
      apiServiceSpy.getAllApplications.and.returnValue(of(usedProductsOrg))

      component.ngOnInit()

      component.usedProducts$?.subscribe({
        next: (data) => {
          expect(data).toEqual(usedProductsOrg)
          done()
        },
        error: done.fail
      })
    })

    it('should get all announcements assigned to workspaces', (done) => {
      const errorResponse = { status: '404', statusText: 'An error occur' }
      apiServiceSpy.getAllApplications.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.ngOnInit()

      component.usedProducts$?.subscribe({
        next: (data) => {
          expect(data).toEqual([])
          done()
        },
        error: () => {
          expect(console.error).toHaveBeenCalledOnceWith('getAllApplications', errorResponse)
          done.fail
        }
      })
    })
  })

  describe('META data: load all products', () => {
    it('should get all existing products - successful', (done) => {
      productApiSpy.searchAllAvailableProducts.and.returnValue(of({ stream: allProducts }))

      component.ngOnInit()

      component.allProducts$.subscribe({
        next: (products) => {
          if (products) {
            expect(products.length).toBe(allProducts.length)
            expect(products[0].applications?.length).toBe(allProducts[0].applications?.length)
            done()
          }
        },
        error: done.fail
      })
    })

    it('should get all existing products - failed', (done) => {
      const errorResponse = { status: '404', statusText: 'Not found' }
      productApiSpy.searchAllAvailableProducts.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.ngOnInit()

      component.allProducts$.subscribe({
        next: () => {
          expect(console.error).toHaveBeenCalledWith('searchAllAvailableProducts', errorResponse)
          done()
        },
        error: done.fail
      })
    })
  })

  describe('META data: load all meta data together and check enrichments', () => {
    it('should get all meta data - successful', (done) => {
      productApiSpy.searchAllAvailableProducts.and.returnValue(of({ stream: allProducts }))
      apiServiceSpy.getAllApplications.and.returnValue(of(usedProductsOrg))

      component.ngOnInit()

      component.metaData$.subscribe({
        next: (meta) => {
          if (meta) {
            expect(meta.allProducts.length).toBe(5)
            expect(meta.usedProducts?.length).toBe(2)
            expect(meta.usedProducts).toEqual(usedProducts)
            done()
          }
        }
      })
    })
  })

  /*
   * UI ACTIONS
   */
  describe('create + copy', () => {
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

      component.onDetail(mode, parameterData[0])

      expect(component.changeMode).toEqual(mode)
      expect(component.item4Detail).toBe(parameterData[0])
      expect(component.displayDetailDialog).toBeTrue()
    })

    it('should prepare the copy of a parameter', () => {
      const mode = 'COPY'

      component.onDetail(mode, parameterData[0])

      expect(component.changeMode).toEqual(mode)
      expect(component.item4Detail).toBe(parameterData[0])
      expect(component.displayDetailDialog).toBeTrue()

      component.onCloseDetail(true)

      expect(component.displayDetailDialog).toBeFalse()
    })
  })

  describe('deletion', () => {
    beforeEach(() => {
      params = [
        { id: 'id1', productName: 'product1', applicationId: 'app1', name: 'name1' },
        { id: 'id2', productName: 'product1', applicationId: 'app1', name: 'name2' },
        { id: 'id3', productName: 'product3', applicationId: 'app1', name: 'name2' }
      ]
    })

    it('should prepare the deletion of a parameter - ok', () => {
      const ev: MouseEvent = new MouseEvent('type')
      spyOn(ev, 'stopPropagation')

      component.onDelete(ev, params[0])

      expect(ev.stopPropagation).toHaveBeenCalled()
      expect(component.item4Delete).toBe(params[0])
      expect(component.displayDeleteDialog).toBeTrue()
    })

    it('should delete a parameter with confirmation', () => {
      apiServiceSpy.deleteParameter.and.returnValue(of(null))
      const ev: MouseEvent = new MouseEvent('type')

      component.onDelete(ev, params[1])
      component.onDeleteConfirmation(params) // remove but not the last of the product

      expect(component.displayDeleteDialog).toBeFalse()
      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })

      component.onDelete(ev, params[2])
      component.onDeleteConfirmation(params) // remove and this was the last of the product
    })

    it('should display error if deleting a parameter fails', () => {
      const errorResponse = { status: '400', statusText: 'Error on deletion' }
      apiServiceSpy.deleteParameter.and.returnValue(throwError(() => errorResponse))
      const ev: MouseEvent = new MouseEvent('type')
      spyOn(console, 'error')

      component.onDelete(ev, params[0])
      component.onDeleteConfirmation(params)

      expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
      expect(console.error).toHaveBeenCalledWith('deleteParameter', errorResponse)
    })

    it('should reject confirmation if param was not set', () => {
      component.onDeleteConfirmation(params)

      expect(apiServiceSpy.deleteParameter).not.toHaveBeenCalled()
    })
  })

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

  it('should open create dialog using UI action', () => {
    spyOn(component, 'onDetail')
    component.ngOnInit()
    component.actions$?.subscribe((action) => {
      action[0].actionCallback()
    })

    expect(component.onDetail).toHaveBeenCalled()
  })

  describe('onHistory', () => {
    it('should stop event propagation, set parameter, and display history dialog', () => {
      const event = new MouseEvent('click')
      spyOn(event, 'stopPropagation')

      component.onHistory(event, parameterData[0])

      expect(event.stopPropagation).toHaveBeenCalled()
      expect(component.item4Detail).toEqual(parameterData[0])
      expect(component.displayHistoryDialog).toBeTrue()
    })
  })

  it('should hide the history dialog', () => {
    component.displayHistoryDialog = true

    component.onCloseHistory()

    expect(component.displayHistoryDialog).toBeFalse()
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
      expect(component.dateFormat).toEqual('dd.MM.yyyy HH:mm')
    })

    it('should set default date format', () => {
      mockUserService.lang$.getValue.and.returnValue('en')
      fixture = TestBed.createComponent(ParameterSearchComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
      expect(component.dateFormat).toEqual('M/d/yy, h:mm a')
    })
  })
})
