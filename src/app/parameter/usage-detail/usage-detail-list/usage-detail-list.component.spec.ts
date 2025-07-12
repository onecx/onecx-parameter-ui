import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { UserService } from '@onecx/angular-integration-interface'

import { UsageDetailListComponent } from './usage-detail-list.component'

describe('HistoryListComponent', () => {
  let component: UsageDetailListComponent
  let fixture: ComponentFixture<UsageDetailListComponent>

  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UsageDetailListComponent],
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
    fixture = TestBed.createComponent(UsageDetailListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  describe('construction', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
    })
  })

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
