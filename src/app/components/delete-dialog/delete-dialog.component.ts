import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.css']
})
export class DeleteDialogComponent implements OnInit{

  username: string;
  constructor(
    public thisDialogRef: MatDialogRef<DeleteDialogComponent>, 
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(){
  }

  cancelDialog() {
    this.thisDialogRef.close(this.translate.instant('app.cancel'));
  }

  confirmDialog() {
    this.thisDialogRef.close(this.translate.instant('app.confirm'));
  }
}
