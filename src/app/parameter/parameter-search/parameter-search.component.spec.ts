import { NO_ERRORS_SCHEMA } from '@angular/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { TranslateServiceMock } from '../../shared/TranslateServiceMock'
import { of, throwError } from 'rxjs'

import { AppStateService, Column, createTranslateLoader, PortalMessageService } from '@onecx/portal-integration-angular'

import { ParameterSearchComponent } from './parameter-search.component'
import {
  ApplicationParameter,
  ParametersAPIService,
  ProductsAPIService,
  ProductStorePageResult
} from 'src/app/shared/generated'
import { SelectItem } from 'primeng/api'

const parameterData: ApplicationParameter[] = [
  { id: 'id', productName: 'prod1', applicationId: 'app1', key: 'key1', setValue: 'value1' },
  { id: 'id2', productName: 'prod2', applicationId: 'app2', key: 'key2', setValue: 'value2' },
  { id: 'id3', productName: 'prod3', applicationId: 'app3', key: 'key3', setValue: 'value3' }
]

describe('ParameterSearchComponent', () => {
  let component: ParameterSearchComponent
  let fixture: ComponentFixture<ParameterSearchComponent>

  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])
  const apiServiceSpy = {
    searchApplicationParametersByCriteria: jasmine
      .createSpy('searchApplicationParametersByCriteria')
      .and.returnValue(of({})),
    deleteParameter: jasmine.createSpy('deleteParameter').and.returnValue(of({}))
  }
  const productApiSpy = {
    searchAllAvailableProducts: jasmine.createSpy('searchAllAvailableProducts').and.returnValue(of({})),
    deleteParameter: jasmine.createSpy('deleteParameter').and.returnValue(of({}))
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ParameterSearchComponent],
      imports: [
        HttpClientTestingModule,
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
        { provide: TranslateService, useClass: TranslateServiceMock },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: ParametersAPIService, useValue: apiServiceSpy },
        { provide: ProductsAPIService, useValue: productApiSpy }
      ]
    }).compileComponents()
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    apiServiceSpy.searchApplicationParametersByCriteria.calls.reset()
    apiServiceSpy.deleteParameter.calls.reset()
    productApiSpy.searchAllAvailableProducts.calls.reset()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('search', () => {
    it('should search parameters without search criteria', () => {
      apiServiceSpy.searchApplicationParametersByCriteria.and.returnValue(of({ stream: parameterData }))

      component.search({})

      component.results$?.subscribe({
        next: (data) => {
          expect(data).toEqual(parameterData)
        }
      })
    })

    it('should display an info message if there are no parameters', () => {
      apiServiceSpy.searchApplicationParametersByCriteria.and.returnValue(of({ totalElements: 0, stream: [] }))

      component.search({})

      component.results$?.subscribe({
        next: (data) => {
          expect(data.length).toEqual(0)
          // expect(msgServiceSpy.info).toHaveBeenCalledOnceWith({ summaryKey: 'SEARCH.MSG_NO_RESULTS' })
        }
      })
    })

    it('should display an error message if the search call fails', () => {
      const err = { status: '400' }
      apiServiceSpy.searchApplicationParametersByCriteria.and.returnValue(throwError(() => err))

      component.search({})

      component.results$?.subscribe({
        error: () => {
          expect(msgServiceSpy.error).toHaveBeenCalledWith({
            summaryKey: 'SEARCH.MSG_SEARCH_FAILED'
          })
        }
      })
    })
  })

  describe('getAllProductNames', () => {
    it('should log an error if the API call fails', () => {
      const mockError = new Error('API error')
      spyOn(console, 'error')
      productApiSpy.searchAllAvailableProducts.and.returnValue(throwError(() => mockError))

      component['getAllProductNames']()

      component.products$!.subscribe((data) => {
        expect(data).toEqual([] as any)
      })

      expect(console.error).toHaveBeenCalledWith('getAllProductNames():', mockError)
    })

    it('should set allProductNames$ observable and map product names correctly', () => {
      const mockProductStorePageResult: ProductStorePageResult = {
        stream: [
          { displayName: 'Prod A', productName: 'prod-a' },
          { displayName: 'Prod B', productName: 'prod-b' }
        ]
      } as ProductStorePageResult
      const sortedItems: SelectItem[] = [
        { label: 'Prod A', value: 'prod-a' },
        { label: 'Prod B', value: 'prod-b' }
      ]
      productApiSpy.searchAllAvailableProducts.and.returnValue(of(mockProductStorePageResult))

      component['getAllProductNames']()

      component.allProductNames$!.subscribe((data) => {
        expect(data).toEqual(sortedItems)
      })
    })
  })

  /*
   * UI ACTIONS
   */
  it('should prepare the creation of a new parameter', () => {
    component.onCreate()

    expect(component.changeMode).toEqual('NEW')
    expect(component.usedProductsChanged).toBeFalse()
    expect(component.parameter).toBe(undefined)
    expect(component.displayDetailDialog).toBeTrue()
  })

  it('should show details of a parameter', () => {
    const ev: MouseEvent = new MouseEvent('type')
    spyOn(ev, 'stopPropagation')
    const mode = 'EDIT'

    component.onDetail(ev, parameterData[0], mode)

    expect(ev.stopPropagation).toHaveBeenCalled()
    expect(component.changeMode).toEqual(mode)
    expect(component.usedProductsChanged).toBeFalse()
    expect(component.parameter).toBe(parameterData[0])
    expect(component.displayDetailDialog).toBeTrue()
  })

  it('should prepare the copy of a parameter', () => {
    const ev: MouseEvent = new MouseEvent('type')
    spyOn(ev, 'stopPropagation')

    component.onCopy(ev, parameterData[0])

    expect(ev.stopPropagation).toHaveBeenCalled()
    expect(component.changeMode).toEqual('NEW')
    expect(component.usedProductsChanged).toBeFalse()
    expect(component.parameter).toBe(parameterData[0])
    expect(component.displayDetailDialog).toBeTrue()
  })

  it('should prepare the deletion of a parameter', () => {
    const ev: MouseEvent = new MouseEvent('type')
    spyOn(ev, 'stopPropagation')

    component.onDelete(ev, parameterData[0])

    expect(ev.stopPropagation).toHaveBeenCalled()
    expect(component.usedProductsChanged).toBeFalse()
    expect(component.parameter).toBe(parameterData[0])
    expect(component.displayDeleteDialog).toBeTrue()
  })

  it('should delete a parameter item', () => {
    const ev: MouseEvent = new MouseEvent('type')
    apiServiceSpy.deleteParameter.and.returnValue(of({}))
    component.parameters = [
      { id: 'a1', key: 'a1' },
      { id: 'a2', key: 'a2', productName: 'prod' }
    ]
    component.onDelete(ev, component.parameters[0])
    component.onDeleteConfirmation()

    expect(component.parameters.length).toBe(1)
    expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.DELETE.MESSAGES.OK' })

    component.onDelete(ev, component.parameters[0])
    component.onDeleteConfirmation()
    expect(component.parameters.length).toBe(0)
  })

  it('should display error if deleting an parameter fails', () => {
    apiServiceSpy.deleteParameter.and.returnValue(throwError(() => new Error()))
    component.parameter = {
      id: 'definedHere'
    }
    component.parameters = [{ id: 'id', productName: 'prod1', applicationId: 'app1', key: 'key1', setValue: 'value1' }]

    component.onDeleteConfirmation()

    expect(msgServiceSpy.error).toHaveBeenCalledWith({
      summaryKey: 'ACTIONS.DELETE.MESSAGES.NOK'
    })
  })

  it('should set correct values when detail dialog is closed', () => {
    spyOn(component, 'search')

    component.onCloseDetail(true)

    expect(component.search).toHaveBeenCalled()
    expect(component.displayDeleteDialog).toBeFalse()
  })

  it('should update the columns that are seen in results', () => {
    const columns: Column[] = [
      {
        field: 'productName',
        header: 'PRODUCT_NAME'
      },
      {
        field: 'description',
        header: 'DESCRIPTION'
      }
    ]
    const expectedColumn = { field: 'productName', header: 'PRODUCT_NAME' }
    component.columns = columns

    component.onColumnsChange(['productName'])

    expect(component.filteredColumns).not.toContain(columns[1])
    expect(component.filteredColumns).toEqual([jasmine.objectContaining(expectedColumn)])
  })

  it('should apply a filter to the result table', () => {
    component.parameterTable = jasmine.createSpyObj('parameterTable', ['filterGlobal'])

    component.onFilterChange('test')

    expect(component.parameterTable?.filterGlobal).toHaveBeenCalledWith('test', 'contains')
  })

  it('should open create dialog', () => {
    spyOn(component, 'onCreate')

    component.ngOnInit()
    component.actions$?.subscribe((action) => {
      action[0].actionCallback()
    })

    expect(component.onCreate).toHaveBeenCalled()
  })

  describe('onHistory', () => {
    it('should stop event propagation, set parameter, and display history dialog', () => {
      const event = new MouseEvent('click')
      spyOn(event, 'stopPropagation')

      component.onHistory(event, parameterData[0])

      expect(event.stopPropagation).toHaveBeenCalled()
      expect(component.parameter).toEqual(parameterData[0])
      expect(component.displayHistoryDialog).toBeTrue()
    })
  })

  it('should hide the history dialog', () => {
    component.displayHistoryDialog = true

    component.onCloseHistory()

    expect(component.displayHistoryDialog).toBeFalse()
  })

  describe('onReset', () => {
    it('should reset criteria, reset the form group, and disable the applicationId control', () => {
      component.criteria = { key: 'key' }
      component.criteriaGroup.controls['applicationId'].enable()

      component.onReset()

      expect(component.criteria).toEqual({})
      expect(component.criteriaGroup.pristine).toBeTrue()
      expect(component.criteriaGroup.dirty).toBeFalse()
      expect(component.criteriaGroup.controls['applicationId'].disabled).toBeTrue()
    })
  })
})
