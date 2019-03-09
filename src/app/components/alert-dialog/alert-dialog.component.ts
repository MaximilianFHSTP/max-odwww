import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent implements OnInit{
  public counter: number;
  public intervalId: any;
  number: string;
  constructor(
    public thisDialogRef: MatDialogRef<AlertDialogComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(){
    this.counter = 45;
    this.intervalId = setInterval(() => {
      this.counter = this.counter - 1;
      if(this.counter === 0){ this.confirmDialog(); }
    }, 1000);
  }

  cancelDialog() {
    clearInterval(this.intervalId);
    this.thisDialogRef.close(this.translate.instant('app.cancel'));
  }

  confirmDialog() {
    clearInterval(this.intervalId);
    this.thisDialogRef.close(this.translate.instant('app.confirm'));
  }
}
