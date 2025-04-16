import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateService } from '@ngx-translate/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'
import { Column, PortalMessageService } from '@onecx/portal-integration-angular'

import { Parameter, ParametersAPIService, Product } from 'src/app/shared/generated'
import {
  ApplicationAbstract,
  ExtendedProduct,
  ParameterHistoryComponent,
  ProductAbstract
} from './parameter-search.component'

const itemData: Parameter[] = [
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
// parameter BFF products (enriched)
/*
const usedProducts: ExtendedProduct[] = [
  { name: 'product1', displayName: 'Product 1', undeployed: false, applications: [app1] },
  { name: 'product2', displayName: 'Product 2', undeployed: true, applications: [app2] }
]*/
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

describe('ParameterHistoryComponent', () => {
  let component: ParameterHistoryComponent
  let fixture: ComponentFixture<ParameterHistoryComponent>

  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }
  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])
  const apiServiceSpy = {
    deleteParameter: jasmine.createSpy('deleteParameter').and.returnValue(of(null)),
    getAllApplications: jasmine.createSpy('getAllApplications').and.returnValue(of([])),
    searchParametersByCriteria: jasmine.createSpy('searchParametersByCriteria').and.returnValue(of({}))
  }

  beforeEach(waitForAsync(() => {
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
        provideHttpClient(),
        provideHttpClientTesting(),
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
    apiServiceSpy.getAllApplications.calls.reset()
    apiServiceSpy.deleteParameter.calls.reset()
    // to spy data: refill with neutral data
    apiServiceSpy.searchParametersByCriteria.and.returnValue(of({}))
    apiServiceSpy.getAllApplications.and.returnValue(of([]))
    apiServiceSpy.deleteParameter.and.returnValue(of(null))
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterHistoryComponent)
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

    it('should open create dialog using UI action', () => {
      spyOn(component, 'onDetail')

      component.ngOnInit()
      component.actions[0].actionCallback()

      expect(component.onDetail).toHaveBeenCalled()
    })
  })

  describe('search', () => {
    it('should search parameters without search criteria', (done) => {
      apiServiceSpy.searchParametersByCriteria.and.returnValue(of({ stream: itemData }))

      component.onSearch({})

      component.data$?.subscribe({
        next: (data) => {
          expect(data).toEqual(itemData)
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

    it('should get all products assigned to', (done) => {
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

  describe('META data', () => {
    it('should get product store products - successful', (done) => {
      component.slotEmitter.emit(allProductsOrg)
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
  })

  describe('sorting', () => {
    it('should return negative value when first product name comes before second alphabetically', () => {
      const productA = { id: 'a', name: 'name', displayName: 'Admin' }
      const productB = { id: 'b', name: 'name', displayName: 'User' }
      expect(component['sortByDisplayName'](productA, productB)).toBeLessThan(0)
    })

    it('should return positive value when first product name comes after second alphabetically', () => {
      const productA = { id: 'a', name: 'name', displayName: 'User' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(component['sortByDisplayName'](productA, productB)).toBeGreaterThan(0)
    })

    it('should return zero when product names are the same', () => {
      const productA = { id: 'a', name: 'name', displayName: 'Admin' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(component['sortByDisplayName'](productA, productB)).toBe(0)
    })

    it('should be case-insensitive', () => {
      const productA = { id: 'a', name: 'name', displayName: 'admin' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(component['sortByDisplayName'](productA, productB)).toBe(0)
    })

    it('should handle undefined names', () => {
      const productA = { id: 'a', name: 'name', displayName: undefined }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(component['sortByDisplayName'](productA, productB)).toBeLessThan(0)
    })

    it('should handle empty string names', () => {
      const productA = { id: 'a', name: 'name', displayName: '' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(component['sortByDisplayName'](productA, productB)).toBeLessThan(0)
    })

    it('should handle both names being undefined', () => {
      const productA = { id: 'a', name: 'name', displayName: undefined }
      const productB = { id: 'b', name: 'name', displayName: undefined }
      expect(component['sortByDisplayName'](productA, productB)).toBe(0)
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

      component.onDetail(mode, itemData[0])

      expect(component.changeMode).toEqual(mode)
      expect(component.item4Detail).toBe(itemData[0])
      expect(component.displayDetailDialog).toBeTrue()
    })

    it('should prepare the copy of a parameter', () => {
      const mode = 'COPY'

      component.onDetail(mode, itemData[0])

      expect(component.changeMode).toEqual(mode)
      expect(component.item4Detail).toBe(itemData[0])
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
      const ev: MouseEvent = new MouseEvent('type')
      spyOn(ev, 'stopPropagation')

      component.onDelete(ev, items4Deletion[0])

      expect(ev.stopPropagation).toHaveBeenCalled()
      expect(component.item4Delete).toBe(items4Deletion[0])
      expect(component.displayDeleteDialog).toBeTrue()
    })

    it('should delete a parameter with confirmation', () => {
      apiServiceSpy.deleteParameter.and.returnValue(of(null))
      const ev: MouseEvent = new MouseEvent('type')

      component.onDelete(ev, items4Deletion[1])
      component.onDeleteConfirmation(items4Deletion) // remove but not the last of the product

      expect(component.displayDeleteDialog).toBeFalse()
      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })

      component.onDelete(ev, items4Deletion[2])
      component.onDeleteConfirmation(items4Deletion) // remove and this was the last of the product
    })

    it('should display error if deleting a parameter fails', () => {
      const errorResponse = { status: '400', statusText: 'Error on deletion' }
      apiServiceSpy.deleteParameter.and.returnValue(throwError(() => errorResponse))
      const ev: MouseEvent = new MouseEvent('type')
      spyOn(console, 'error')

      component.onDelete(ev, items4Deletion[0])
      component.onDeleteConfirmation(items4Deletion)

      expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
      expect(console.error).toHaveBeenCalledWith('deleteParameter', errorResponse)
    })

    it('should reject confirmation if param was not set', () => {
      component.onDeleteConfirmation(items4Deletion)

      expect(apiServiceSpy.deleteParameter).not.toHaveBeenCalled()
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

  describe('onHistory', () => {
    it('should stop event propagation, set parameter, and display history dialog', () => {
      const event = new MouseEvent('click')
      spyOn(event, 'stopPropagation')

      component.onHistory(event, itemData[0])

      expect(event.stopPropagation).toHaveBeenCalled()
      expect(component.item4Detail).toEqual(itemData[0])
      expect(component.displayHistoryDialog).toBeTrue()
    })

    it('should hide the history dialog', () => {
      component.displayHistoryDialog = true

      component.onCloseHistory()

      expect(component.displayHistoryDialog).toBeFalse()
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
      fixture = TestBed.createComponent(ParameterHistoryComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
      expect(component.dateFormat).toEqual('M/d/yy, hh:mm:ss a')
    })
  })
})
