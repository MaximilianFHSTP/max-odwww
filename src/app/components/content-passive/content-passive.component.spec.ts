import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentPassiveComponent } from './content-passive.component';

describe('ContentPassiveComponent', () => {
  let component: ContentPassiveComponent;
  let fixture: ComponentFixture<ContentPassiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentPassiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentPassiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
