import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient, HttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormControl, FormGroup } from '@angular/forms'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'

import { AppStateService, UserService } from '@onecx/angular-integration-interface'
import { createTranslateLoader } from '@onecx/portal-integration-angular'

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

describe('ParameterCriteriaComponent', () => {
  let component: ParameterCriteriaComponent
  let fixture: ComponentFixture<ParameterCriteriaComponent>

  const mockUserService = {
    lang$: {
      getValue: jasmine.createSpy('getValue')
    }
  }

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

  it('should create', () => {
    expect(component).toBeTruthy()
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
})
