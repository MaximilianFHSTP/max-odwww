import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NativeSettingDialogComponent } from './native-setting-dialog.component';

describe('NativeSettingDialogComponent', () => {
  let component: NativeSettingDialogComponent;
  let fixture: ComponentFixture<NativeSettingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NativeSettingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NativeSettingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
