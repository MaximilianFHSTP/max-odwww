import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageStartComponent } from './language-start.component';

describe('LanguageStartComponent', () => {
  let component: LanguageStartComponent;
  let fixture: ComponentFixture<LanguageStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LanguageStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
