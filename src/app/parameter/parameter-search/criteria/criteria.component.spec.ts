import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MessageService } from 'primeng/api'

import { CriteriaComponent } from './criteria.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { RouterTestingModule } from '@angular/router/testing'
import { APP_CONFIG } from '@onecx/portal-integration-angular'
import { TranslateServiceMock } from 'src/app/shared/TranslateServiceMock'
import { environment } from 'src/environments/environment'
import { SharedModule } from 'src/app/shared/shared.module'
import { DialogService } from 'primeng/dynamicdialog'

describe('CriteriaComponent', () => {
  let component: CriteriaComponent
  let fixture: ComponentFixture<CriteriaComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CriteriaComponent],
      imports: [HttpClientTestingModule, TranslateModule, RouterTestingModule, SharedModule],
      providers: [
        { provide: TranslateService, useClass: TranslateServiceMock },
        { provide: DialogService, useClass: DialogService },
        { provide: APP_CONFIG, useValue: environment },
        MessageService
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CriteriaComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
