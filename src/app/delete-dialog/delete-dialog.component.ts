import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.css']
})
export class DeleteDialogComponent implements OnInit{

  username: string;
  constructor(public thisDialogRef: MatDialogRef<DeleteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(){
  }

  cancelDialog() {
    this.thisDialogRef.close('cancel');
    // console.log("canceled");
  }

  confirmDialog() {
    this.thisDialogRef.close('confirm');
    // console.log("confirmed");
  }
}
