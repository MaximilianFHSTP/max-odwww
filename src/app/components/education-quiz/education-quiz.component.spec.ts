import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationQuizComponent } from './education-quiz.component';

describe('EducationQuizComponent', () => {
  let component: EducationQuizComponent;
  let fixture: ComponentFixture<EducationQuizComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EducationQuizComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
