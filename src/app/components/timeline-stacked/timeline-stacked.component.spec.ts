import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineStackedComponent } from './timeline-stacked.component';

describe('TimelineStackedComponent', () => {
  let component: TimelineStackedComponent;
  let fixture: ComponentFixture<TimelineStackedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineStackedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineStackedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
