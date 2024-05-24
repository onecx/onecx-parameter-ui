import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MessageService } from 'primeng/api'
import { ResultsComponent } from './results.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TranslateServiceMock } from 'src/app/shared/TranslateServiceMock'
import { APP_CONFIG } from '@onecx/portal-integration-angular'
import { environment } from 'src/environments/environment'
import { SharedModule } from 'src/app/shared/shared.module'

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
        { provide: MessageService, useClass: MessageService }
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
