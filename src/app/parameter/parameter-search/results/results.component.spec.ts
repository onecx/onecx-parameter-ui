import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { ResultsComponent } from './results.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TranslateServiceMock } from '../../../shared/TranslateServiceMock'
import { APP_CONFIG, PortalMessageService } from '@onecx/portal-integration-angular'
import { environment } from '../../../../environments/environment'
import { SharedModule } from '../../../shared/shared.module'

describe('ResultsComponent', () => {
  let component: ResultsComponent
  let fixture: ComponentFixture<ResultsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ResultsComponent],
      imports: [ReactiveFormsModule, TranslateModule, HttpClientTestingModule, SharedModule],
      providers: [
        { provide: APP_CONFIG, useValue: environment },
        { provide: TranslateService, useClass: TranslateServiceMock },
        { provide: PortalMessageService, useClass: PortalMessageService }
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
