import { HttpClientTestingModule } from '@angular/common/http/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { APP_CONFIG } from '@onecx/portal-integration-angular'
import { MessageService } from 'primeng/api'
import { TranslateServiceMock } from 'src/app/test/TranslateServiceMock'
import { environment } from 'src/environments/environment'

import { ParameterDetailComponent } from './parameter-detail.component'
import { SharedModule } from '../../shared/shared.module'

describe('ParameterDetailComponent', () => {
  let component: ParameterDetailComponent
  let fixture: ComponentFixture<ParameterDetailComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParameterDetailComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, TranslateModule, SharedModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: TranslateService, useClass: TranslateServiceMock },
        { provide: MessageService, useClass: MessageService },
        { provide: APP_CONFIG, useValue: environment }
      ]
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
