import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateModule, provideTranslateService } from '@ngx-translate/core'

import { UserService } from '@onecx/angular-integration-interface'

import { provideTestTranslateLoader } from 'src/app/shared/translate-loader-testing'

import { HistoryCriteria, Parameter } from 'src/app/shared/generated'
import { UsageDetailCriteriaComponent } from './usage-detail-criteria.component'
import { ExtendedHistory } from '../../usage-search/usage-search.component'

const parameter: Parameter = {
  id: 'pid',
  productName: 'prod1',
  applicationId: 'app1',
  name: 'name',
  displayName: 'displayName',
  value: 'value'
}

const history: ExtendedHistory = {
  id: 'pid',
  productName: 'prod1',
  applicationId: 'app1',
  name: 'name',
  usedValue: 'used value',
  defaultValue: 'default value',
  valueType: 'STRING',
  defaultValueType: 'STRING',
  displayUsedValue: '',
  displayDefaultValue: '',
  isEqual: 'FALSE',
  imagePath: ''
}

describe('HistoryCriteriaComponent', () => {
  let component: UsageDetailCriteriaComponent
  let fixture: ComponentFixture<UsageDetailCriteriaComponent>

  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UsageDetailCriteriaComponent],
      imports: [TranslateModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideTranslateService({
          defaultLanguage: 'en',
          loader: provideTestTranslateLoader({
            de: require('src/assets/i18n/de.json'),
            en: require('src/assets/i18n/en.json')
          })
        }),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: mockUserService }
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageDetailCriteriaComponent)
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
    it('should fill form with parameter', () => {
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

  it('should fill form with history', () => {
    component.history = history
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
