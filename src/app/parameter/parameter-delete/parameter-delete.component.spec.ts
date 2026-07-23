import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideRouter, Router } from '@angular/router'
import { TranslateModule, provideTranslateService } from '@ngx-translate/core'
import { of, throwError } from 'rxjs'

import { provideTestTranslateLoader } from 'src/app/shared/translate-loader-testing'

import { PortalMessageService } from '@onecx/angular-integration-interface'

import { ParametersAPIService } from 'src/app/shared/generated'

import { ParameterDeleteComponent } from './parameter-delete.component'

describe('ParameterDeleteComponent', () => {
  let component: ParameterDeleteComponent
  let fixture: ComponentFixture<ParameterDeleteComponent>

  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error'])
  const parametersApiSpy = jasmine.createSpyObj<ParametersAPIService>('ParametersAPIService', ['deleteParameter'])

  function initTestComponent(): void {
    fixture = TestBed.createComponent(ParameterDeleteComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ParameterDeleteComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        provideTranslateService({
          defaultLanguage: 'de',
          loader: provideTestTranslateLoader({
            de: require('src/assets/i18n/de.json'),
            en: require('src/assets/i18n/en.json')
          })
        }),
        provideHttpClientTesting(),
        provideHttpClient(),
        provideRouter([{ path: '', component: ParameterDeleteComponent }]),
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: ParametersAPIService, useValue: parametersApiSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    // to spy data: reset
    parametersApiSpy.deleteParameter.calls.reset()
    // to spy data: refill with neutral data
    parametersApiSpy.deleteParameter.and.returnValue(of({}) as any)

    initTestComponent()
  })

  describe('construction', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })
  })

  describe('Parameter deletion', () => {
    it('should hide dialog, inform and navigate on successfull deletion', () => {
      const router = TestBed.inject(Router)
      spyOn(router, 'navigate')
      parametersApiSpy.deleteParameter.and.returnValue(of({}) as any)

      component.onDeleteParameter({ id: 'parameterId' } as any)

      expect(component.visible).toBe(false)
      expect(msgServiceSpy.success).toHaveBeenCalledOnceWith({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
    })

    it('should hide dialog and display error on failed deletion', () => {
      const errorResponse = { error: { message: 'Error on deleting parameter' }, status: 400 }
      parametersApiSpy.deleteParameter.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.onDeleteParameter({ id: 'parameterId' } as any)

      expect(component.visible).toBe(false)
      expect(console.error).toHaveBeenCalledWith('deleteParameter', errorResponse)
      expect(msgServiceSpy.error).toHaveBeenCalledOnceWith({
        summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK',
        detailKey: errorResponse.error.message
      })
    })
  })
})
