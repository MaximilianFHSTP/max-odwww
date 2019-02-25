import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WappenComponent } from './wappen.component';

describe('WappenComponent', () => {
  let component: WappenComponent;
  let fixture: ComponentFixture<WappenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WappenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WappenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
