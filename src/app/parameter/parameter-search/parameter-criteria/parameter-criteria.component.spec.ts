import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient, HttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormControl, FormGroup } from '@angular/forms'
import { By } from '@angular/platform-browser'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { SelectItem } from 'primeng/api'

import { AppStateService, UserService } from '@onecx/angular-integration-interface'
import { createTranslateLoader } from '@onecx/portal-integration-angular'

import { Product } from 'src/app/shared/generated'
import { ParameterCriteriaComponent, ParameterCriteriaForm } from './parameter-criteria.component'

const filledCriteria = new FormGroup<ParameterCriteriaForm>({
  name: new FormControl<string | null>('name'),
  productName: new FormControl<string | null>('productName'),
  applicationId: new FormControl<string | null>('applicationId')
})
const emptyCriteria = new FormGroup<ParameterCriteriaForm>({
  name: new FormControl<string | null>(null),
  productName: new FormControl<string | null>(null),
  applicationId: new FormControl<string | null>(null)
})
const usedProducts: Product[] = [
  { productName: 'prod1', displayName: 'prod1_display' },
  { productName: 'prod2', displayName: 'prod2_display' }
]
const usedProductsSI: SelectItem[] = [
  { label: 'prod1_display', value: 'prod1' },
  { label: 'prod2_display', value: 'prod2' }
]

describe('ParameterCriteriaComponent', () => {
  let component: ParameterCriteriaComponent
  let fixture: ComponentFixture<ParameterCriteriaComponent>
  let appDropdownElement: any

  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ParameterCriteriaComponent],
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
    beforeEach(() => {
      appDropdownElement = fixture.debugElement.query(By.css('#pm_search_criteria_application_id')).nativeElement
    })
    it('should reject update appIdOptions if no product name is provided', () => {
      component.onChangeProductName(null, appDropdownElement)

      expect(component.appIdOptions).toEqual([])
    })

    it('should update appIdOptions based on the product name', () => {
      component.usedProducts = [
        { productName: 'productA', applications: ['app1', 'app2'] },
        { productName: 'productB', displayName: 'Prouct B', applications: ['app3'] }
      ]
      component.onChangeProductName(component.usedProducts[0].productName!, appDropdownElement)

      expect(component.appIdOptions).toEqual([
        { label: 'app1', value: 'app1' },
        { label: 'app2', value: 'app2' }
      ])
    })

    it('should clear appIdOptions if productName does not match', () => {
      component.usedProducts = [{ productName: 'Product A', applications: ['App1', 'App2'] }]

      if (appDropdownElement) appDropdownElement.click()
      component.onChangeProductName('Product C', appDropdownElement)

      expect(component.appIdOptions).toEqual([])
    })
  })
})
