import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineChangeComponent } from './timeline-change.component';

describe('TimelineChangeComponent', () => {
  let component: TimelineChangeComponent;
  let fixture: ComponentFixture<TimelineChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
