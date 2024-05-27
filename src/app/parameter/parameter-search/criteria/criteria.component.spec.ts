import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { CriteriaComponent } from './criteria.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { RouterTestingModule } from '@angular/router/testing'
import { APP_CONFIG, PortalDialogService, PortalMessageService } from '@onecx/portal-integration-angular'
import { TranslateServiceMock } from '../../../shared/TranslateServiceMock'
import { environment } from '../../../../environments/environment'
import { SharedModule } from '../../../shared/shared.module'

describe('CriteriaComponent', () => {
  let component: CriteriaComponent
  let fixture: ComponentFixture<CriteriaComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CriteriaComponent],
      imports: [HttpClientTestingModule, TranslateModule, RouterTestingModule, SharedModule],
      providers: [
        { provide: TranslateService, useClass: TranslateServiceMock },
        { provide: PortalDialogService, useClass: PortalDialogService },
        { provide: APP_CONFIG, useValue: environment },
        PortalMessageService
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
