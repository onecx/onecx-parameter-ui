import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormControl, FormGroup } from '@angular/forms'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { SelectItem } from 'primeng/api'

import { UserService } from '@onecx/angular-integration-interface'

import { ExtendedProduct, ApplicationAbstract } from '../parameter-search.component'
import { ParameterCriteriaComponent, CriteriaForm } from './parameter-criteria.component'

const filledCriteria = new FormGroup<CriteriaForm>({
  productName: new FormControl<string | null>('productName'),
  applicationId: new FormControl<string | null>('applicationId'),
  name: new FormControl<string | null>('name')
})
const emptyCriteria = new FormGroup<CriteriaForm>({
  productName: new FormControl<string | null>(null),
  applicationId: new FormControl<string | null>(null),
  name: new FormControl<string | null>(null)
})
const app1: ApplicationAbstract = { appId: 'app1-svc', appName: 'OneCX app svc 1' }
const app2: ApplicationAbstract = { appId: 'app2-svc', appName: 'OneCX app svc 2' }
const usedProducts: ExtendedProduct[] = [
  { name: 'product1', displayName: 'Product 1', applications: [app1, app2] },
  { name: 'product2', displayName: 'product 2', applications: [app2] }
]
const usedProductsSI: SelectItem[] = [
  { label: 'Product 1', value: 'product1' },
  { label: 'Product 2', value: 'product2' }
]
const appOptionsP1: SelectItem[] = [
  { label: app1.appName, value: app1.appId },
  { label: app2.appName, value: app2.appId }
]

describe('ParameterCriteriaComponent', () => {
  let component: ParameterCriteriaComponent
  let fixture: ComponentFixture<ParameterCriteriaComponent>

  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ParameterCriteriaComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: UserService, useValue: mockUserService }]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterCriteriaComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    mockUserService.lang$.getValue.and.returnValue('de')
  })

  describe('construction', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
    })
  })

  describe('ngOnChange', () => {
    it('should initialize', () => {
      component.usedProducts = usedProducts

      component.ngOnChanges()

      expect(component.productOptions).toEqual(usedProductsSI)
    })
  })

  describe('onSearch & onResetCriteria', () => {
    it('should search parameters without criteria', () => {
      component.criteriaForm = emptyCriteria
      spyOn(component.searchEmitter, 'emit')

      component.onSearch()

      expect(component.searchEmitter.emit).toHaveBeenCalled()
    })

    it('should search parameters with criteria', () => {
      component.criteriaForm = filledCriteria
      spyOn(component.searchEmitter, 'emit')

      component.onSearch()

      expect(component.searchEmitter.emit).toHaveBeenCalled()
    })

    it('should reset search criteria', () => {
      component.criteriaForm = filledCriteria
      spyOn(component.searchEmitter, 'emit')

      component.onSearch()

      expect(component.searchEmitter.emit).toHaveBeenCalled()

      spyOn(component.resetSearchEmitter, 'emit')
      spyOn(component.criteriaForm, 'reset')

      component.onResetCriteria()

      expect(component.criteriaForm.reset).toHaveBeenCalled()
      expect(component.resetSearchEmitter.emit).toHaveBeenCalled()
    })
  })

  describe('onChangeProductName', () => {
    it('should reject update appOptions and clear target dropdown if no product name is provided', () => {
      component.onChangeProductName(null) // clear product name

      expect(component.appOptions).toEqual([])
    })

    it('should update appOptions based on the product name', () => {
      component.usedProducts = usedProducts
      component.onChangeProductName(usedProducts[0].name!)

      expect(component.appOptions).toEqual(appOptionsP1)
    })

    it('should clear appOptions if productName does not match', () => {
      component.usedProducts = usedProducts
      component.onChangeProductName('unknown')

      expect(component.appOptions).toEqual([])
    })
  })
})
