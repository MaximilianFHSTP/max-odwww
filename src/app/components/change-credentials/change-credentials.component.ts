import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import {UserActions} from '../../store/actions/UserActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import {TransmissionService} from '../../services/transmission.service';

@Component({
  selector: 'app-change-credentials',
  templateUrl: './change-credentials.component.html',
  styleUrls: ['./change-credentials.component.css']
})
@Injectable()
export class ChangeCredentialsComponent implements OnInit
{
  public changeName: string;
  public changeEmail: string;
  public oldPassword: string;
  public newPassword_: string;

  nameFormControl = new FormControl('', /*[Validators.required]*/);
  emailFormControl = new FormControl('', /*[Validators.required]*/);
  passwordFormControl = new FormControl('', /*[Validators.required]*/);
  newPasswordFormControl = new FormControl('', [/*[Validators.required]*/
    Validators.pattern('(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^*&?)§(\/])[A-Za-z0-9!@#$%^*&?)§(\/].{5,}')]);
  newConfirmPasswordFormControl = new FormControl('', /*[Validators.required]*/);

  changeForm: FormGroup = new FormGroup({
    name: this.nameFormControl,
    email: this.emailFormControl,
    password: this.passwordFormControl,
    newPassword: this.newPasswordFormControl,
    newConfirmPassword: this.newConfirmPasswordFormControl
  });

  constructor(
    private router: Router,
    private transmissionService: TransmissionService,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private utilitiesService: NativeCommunicationService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) { }

  public submitCredentialsChange()
  {
    if(this.nameFormControl.value === undefined || this.nameFormControl.value === ''){
      this.transmissionService.changeName = undefined;
    }else{
      this.transmissionService.changeName = this.nameFormControl.value;
    }
    if(this.emailFormControl.value === undefined || this.emailFormControl.value === ''){
      this.transmissionService.changeEmail = undefined;
    }else{
      this.transmissionService.changeEmail = this.emailFormControl.value;
    }
    if(this.passwordFormControl.value === undefined || this.passwordFormControl.value === ''){
      this.transmissionService.changeOldPassword = undefined;
    }else{
      this.transmissionService.changeOldPassword = this.passwordFormControl.value;
    }
    if(this.newPasswordFormControl.value === undefined || this.newPasswordFormControl.value === ''){
      this.transmissionService.changeNewPassword = undefined;
    }else{
      this.transmissionService.changeNewPassword = this.newPasswordFormControl.value;
    }

    // console.log(this.changeEmail + ' ' + this.changeName + ' ' + this.oldPassword + ' ' + this.newPassword_);

    const state = this.appStore.getState();
    const platform = state.platform;

    this.transmissionService.transmitUserCredentialChange();
  }

  ngOnInit()
  {
    const state = this.appStore.getState();

    this.changeName = state.user.name;
    this.oldPassword = '';
    this.changeEmail = state.user.email;

    // console.log(state.user.email + ' ' + state.user.name);
    // this.nameFormControl.value = state.user.name;
    // this.emailFormControl.value = state.user.email;

    this.changeForm.get('newConfirmPassword').setValidators(this.matchingpassword('newPassword'));
  }

  getPasswordErrorMessage() {
    return this.newPasswordFormControl.hasError('required') ? 'You must enter a value' :
    this.newPasswordFormControl.hasError('pattern') ?
    'Please use at least 6 characters with at least 1 upper case, 1 lower case, ' +
    '1 number and 1 special character! Example: ! $ § % & / ( ) = ?' : '';
  }
  getConfirmPasswordErrorMessage() {

    return this.newConfirmPasswordFormControl.hasError('required') ? 'You must enter a value' :
    this.newConfirmPasswordFormControl.hasError('matchingpassword') ? 'The password is not the same' : '';
  }
  getRequiredErrorMessage(field) {
    return this.changeForm.get(field).hasError('required') ? 'You must enter a value' : '';
  }



  matchingpassword(field: string): ValidatorFn {
    return (control: FormControl): {[key: string]: any} => {
      const group = control.parent;
      const fieldToCompare = group.get(field);
      let notMatching;

      notMatching = !(String(fieldToCompare.value) === String(control.value) && String(control.value) !== '');

      // console.log('matchingpassword ' + notMatching + ' ' + String(control.value) + ' ' + String(fieldToCompare.value));
      return notMatching ? {'matching': {value: control.value}} : null;
    };
  }

  deleteAccountOfUser(){
    const dialogRef = this.dialog.open(DeleteDialogComponent,
      {data: { username: this.appStore.getState().user.name},
        disableClose: true,
        autoFocus: false
      });
    dialogRef.afterClosed().subscribe(result =>{
      if(result === 'confirm'){
        this.transmissionService.deleteUserAccount();
      }else{
        console.log('Account NOT deleted!');
      }
    });
  }

}
