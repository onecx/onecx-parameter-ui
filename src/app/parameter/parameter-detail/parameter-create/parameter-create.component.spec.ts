import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ParameterCreateComponent } from './parameter-create.component'
import { RouterTestingModule } from '@angular/router/testing'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { MessageService } from 'primeng/api'
import { APP_CONFIG } from '@onecx/portal-integration-angular'
import { TranslateServiceMock } from '../../../shared/TranslateServiceMock'
import { environment } from '../../../../environments/environment'
import { SharedModule } from '../../../shared/shared.module'

describe('ParameterCreateComponent', () => {
  let component: ParameterCreateComponent
  let fixture: ComponentFixture<ParameterCreateComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParameterCreateComponent],
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
    fixture = TestBed.createComponent(ParameterCreateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
