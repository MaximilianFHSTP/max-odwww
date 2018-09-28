import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTableAtComponent } from './content-table-at.component';

describe('ContentTableAtComponent', () => {
  let component: ContentTableAtComponent;
  let fixture: ComponentFixture<ContentTableAtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTableAtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTableAtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
