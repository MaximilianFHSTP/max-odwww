import { Component } from '@angular/core';
import {MatDialog, MatDialogRef } from "@angular/material";
import { Alert } from 'selenium-webdriver';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html'
})
export class AlertDialogComponent {

  constructor(public dialogRef: MatDialogRef<AlertDialogComponent>) { }

  cancelDialog() {
    console.log("canceled");
    console.log(this.dialogRef);
    this.dialogRef.close('cancel');
  }

  confirmDialog() {
    console.log("confirmed");
    console.log(this.dialogRef);
    this.dialogRef.close('confirm');
  }
}
