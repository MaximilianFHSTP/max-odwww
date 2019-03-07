import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTableNotifyAtComponent } from './content-table-notify-at.component';

describe('ContentTableNotifyAtComponent', () => {
  let component: ContentTableNotifyAtComponent;
  let fixture: ComponentFixture<ContentTableNotifyAtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTableNotifyAtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTableNotifyAtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
