import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-unlock-dialog',
  templateUrl: './unlock-dialog.component.html',
  styleUrls: ['./unlock-dialog.component.css']
})
export class UnlockDialogComponent implements OnInit {

  username: string;
  constructor(
    public thisDialogRef: MatDialogRef<UnlockDialogComponent>, 
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
  }

  cancelDialog() {
    this.thisDialogRef.close(this.translate.instant('app.cancel'));
  }

  confirmDialog() {
    this.thisDialogRef.close(this.translate.instant('app.confirm'));
  }

}
