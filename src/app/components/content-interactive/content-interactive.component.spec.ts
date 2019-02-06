import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentInteractiveComponent } from './content-interactive.component';

describe('ContentInteractiveComponent', () => {
  let component: ContentInteractiveComponent;
  let fixture: ComponentFixture<ContentInteractiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentInteractiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentInteractiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
