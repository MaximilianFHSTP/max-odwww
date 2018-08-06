import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import { Alert } from 'selenium-webdriver';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss']
})
export class AlertDialogComponent implements OnInit{

  number:string;
  constructor(public thisDialogRef: MatDialogRef<AlertDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(){
  }

  cancelDialog() {
    this.thisDialogRef.close('cancel');
    console.log("canceled");
  }

  confirmDialog() {
    this.thisDialogRef.close('confirm');
    console.log("confirmed");
  }
}
