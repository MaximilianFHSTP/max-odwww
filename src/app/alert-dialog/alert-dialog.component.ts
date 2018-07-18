import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Alert } from 'selenium-webdriver';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent implements OnInit{

  constructor(public thisDialogRef: MatDialogRef<AlertDialogComponent>) { }

  ngOnInit(){

  }

  cancelDialog() {
    console.log("canceled");
    console.log(this.thisDialogRef);
    this.thisDialogRef.close('cancel');
  }

  confirmDialog() {
    console.log("confirmed");
    console.log(this.thisDialogRef);
    this.thisDialogRef.close('confirm');
  }
}
