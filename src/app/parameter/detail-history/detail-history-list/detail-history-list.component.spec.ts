import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateService } from '@ngx-translate/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'

import { DetailHistoryListComponent } from './detail-history-list.component'

describe('HistoryListComponent', () => {
  let component: DetailHistoryListComponent
  let fixture: ComponentFixture<DetailHistoryListComponent>

  const mockUserService = { lang$: { getValue: jasmine.createSpy('getValue') } }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DetailHistoryListComponent],
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
    fixture = TestBed.createComponent(DetailHistoryListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  describe('construction', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
    })

    it('dataview translations', (done) => {
      const translationData = {
        'DIALOG.DATAVIEW.FILTER': 'filter'
      }
      const translateService = TestBed.inject(TranslateService)
      spyOn(translateService, 'get').and.returnValue(of(translationData))

      fixture = TestBed.createComponent(DetailHistoryListComponent)
      component = fixture.componentInstance
      fixture.detectChanges()

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
  })

  it('should apply a filter to the result table', () => {
    component.dataTable = jasmine.createSpyObj('dataTable', ['filterGlobal'])

    component.onFilterChange('test')

    expect(component.dataTable?.filterGlobal).toHaveBeenCalledWith('test', 'contains')
  })
})
