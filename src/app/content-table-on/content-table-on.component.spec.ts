import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTableOnComponent } from './content-table-on.component';

describe('ContentTableOnComponent', () => {
  let component: ContentTableOnComponent;
  let fixture: ComponentFixture<ContentTableOnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTableOnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTableOnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
