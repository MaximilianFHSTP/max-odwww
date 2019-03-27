import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-questionnaire-dialog',
  templateUrl: './questionnaire-dialog.component.html',
  styleUrls: ['./questionnaire-dialog.component.css']
})
export class QuestionnaireDialogComponent implements OnInit {

  username: string;
  constructor(
    public thisDialogRef: MatDialogRef<QuestionnaireDialogComponent>, 
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(){
  }

  confirmDialog() {
    this.thisDialogRef.close('confirm');
  }

  laterDialog() {
    this.thisDialogRef.close('later');
  }

  doneDialog() {
    this.thisDialogRef.close('done');
  }
}
