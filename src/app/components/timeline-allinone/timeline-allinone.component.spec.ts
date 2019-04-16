import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineAllinoneComponent } from './timeline-allinone.component';

describe('TimelineAllinoneComponent', () => {
  let component: TimelineAllinoneComponent;
  let fixture: ComponentFixture<TimelineAllinoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineAllinoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineAllinoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
