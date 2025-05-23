import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { UserService } from '@onecx/angular-integration-interface'

import { HistoryCriteria, Parameter } from 'src/app/shared/generated'
import { DetailHistoryCriteriaComponent } from './detail-history-criteria.component'

const parameter: Parameter = {
  id: 'pid',
  productName: 'prod1',
  applicationId: 'app1',
  name: 'name',
  displayName: 'displayName',
  value: 'value'
}

describe('HistoryCriteriaComponent', () => {
  let component: DetailHistoryCriteriaComponent
  let fixture: ComponentFixture<DetailHistoryCriteriaComponent>

  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DetailHistoryCriteriaComponent],
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
    fixture = TestBed.createComponent(DetailHistoryCriteriaComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    mockUserService.lang$.getValue.and.returnValue('de')
  })

  describe('construction', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
      expect(component.criteriaForm).toBeDefined()
    })
  })

  describe('ngOnChange', () => {
    it('should fill form', () => {
      component.parameter = parameter
      const criteria: HistoryCriteria = {
        name: parameter.name,
        productName: parameter.productName,
        applicationId: parameter.applicationId
      }
      spyOn(component.criteriaEmitter, 'emit')

      component.ngOnChanges()

      expect(component.criteriaForm.value).toEqual(criteria)
      expect(component.criteriaEmitter.emit).toHaveBeenCalled()
    })
  })
})
