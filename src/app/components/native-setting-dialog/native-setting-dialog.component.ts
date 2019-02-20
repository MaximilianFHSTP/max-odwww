import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-native-setting-dialog',
  templateUrl: './native-setting-dialog.component.html',
  styleUrls: ['./native-setting-dialog.component.scss']
})
export class NativeSettingDialogComponent implements OnInit{

  settingtype: string;
  confirmDialogText: string;
  constructor(
    public thisDialogRef: MatDialogRef<NativeSettingDialogComponent>, 
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(){
  }

  cancelDialog() {
    this.thisDialogRef.close(this.translate.instant('app.cancel'));
    // console.log("canceled");
  }

  confirmDialog() {
    this.thisDialogRef.close(this.translate.instant('app.confirm'));
    // console.log("confirmed");
  }
}
