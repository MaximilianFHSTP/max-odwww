import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTableNotifyOnComponent } from './content-table-notify-on.component';

describe('ContentTableNotifyOnComponent', () => {
  let component: ContentTableNotifyOnComponent;
  let fixture: ComponentFixture<ContentTableNotifyOnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTableNotifyOnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTableNotifyOnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
