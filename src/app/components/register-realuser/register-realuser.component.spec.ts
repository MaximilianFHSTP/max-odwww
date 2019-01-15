import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterRealuserComponent } from './register-realuser.component';

describe('RegisterRealuserComponent', () => {
  let component: RegisterRealuserComponent;
  let fixture: ComponentFixture<RegisterRealuserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterRealuserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterRealuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
