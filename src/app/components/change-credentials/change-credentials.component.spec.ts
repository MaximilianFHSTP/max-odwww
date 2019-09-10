import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeCredentialsComponent } from './change-credentials.component';

describe('ChangeCredentialsComponent', () => {
  let component: ChangeCredentialsComponent;
  let fixture: ComponentFixture<ChangeCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeCredentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
