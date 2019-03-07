import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent implements OnInit{

  number: string;
  constructor(
    public thisDialogRef: MatDialogRef<AlertDialogComponent>,
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
