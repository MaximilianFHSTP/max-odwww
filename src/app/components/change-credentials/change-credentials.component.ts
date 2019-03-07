import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import {UserActions} from '../../store/actions/UserActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import {TransmissionService} from '../../services/transmission.service';
import {AlertService} from '../../services/alert.service';
import { Subscription } from 'rxjs';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import * as languageTypes from '../../config/LanguageTypes';
import {LanguageService} from '../../services/language.service';

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
  public newConfirmPassword_: string;
  private subscriptionChangeCred: Subscription;
  public wrongCredChange: boolean;
  private subscriptionExistingChangeCred: Subscription;
  private subscriptionNativeBackbutton: Subscription;
  public existingCred: boolean;
  public changeForm: FormGroup;
  public nameFormControl: FormControl;
  public emailFormControl: FormControl;
  public passwordFormControl: FormControl;
  public newPasswordFormControl: FormControl;
  public newConfirmPasswordFormControl: FormControl;
  public language: string;
  changeUsernameEnable = false;
  changeEmailEnable = false;
  changePasswordEnable = false;
  changeLanguageEnable = false;
  lastUpdated = '';

  constructor(
    private router: Router,
    private transmissionService: TransmissionService,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private nativeCommunicationService: NativeCommunicationService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private alertService: AlertService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private snackBar: MatSnackBar

  ) {
    this.subscriptionChangeCred = this.alertService.getMessageChangedCred().subscribe(message => {
      if (message){
        const config = new MatSnackBarConfig();
        config.duration = 3000;
        config.panelClass = ['success-snackbar'];
        this.snackBar.open(this.translate.instant('changeCredentials.credentialsChanged'), 'OK', config);
      }else{
        this.wrongCredChange = true;
      }
    });
    this.subscriptionExistingChangeCred = this.alertService.getMessageExistingCredentialsOnChange().subscribe(message =>{
      this.existingCred = message;

      if(this.existingCred){
        if(this.lastUpdated === 'changeUsernameEnable'){
          this.changeUsernameEnable = true;
        }else if(this.lastUpdated === 'changeEmailEnable'){
          this.changeEmailEnable = true;
        }else if(this.lastUpdated === 'changePasswordEnable'){
          this.changePasswordEnable = true;
        }
      }
    });

    this.subscriptionNativeBackbutton = this.alertService.getMessageNativeBackbutton().subscribe(() => {
      const elm: HTMLElement = document.getElementById('closebutton') as HTMLElement;
      if(elm){ elm.click(); }
    });
  }

  public submitCredentialsChange()
  {
    if(this.nameFormControl.value === undefined || this.nameFormControl.value === ''){
      this.transmissionService.changeName = undefined;
    }else{
      this.transmissionService.changeName = this.nameFormControl.value;
      this.changeName = this.nameFormControl.value;
    }
    if(this.emailFormControl.value === undefined || this.emailFormControl.value === ''){
      this.transmissionService.changeEmail = undefined;
    }else{
      this.transmissionService.changeEmail = this.emailFormControl.value;
      this.changeEmail = this.emailFormControl.value;
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

    this.transmissionService.transmitUserCredentialChange();

    this.changeUsernameEnable = false;
    this.changeEmailEnable = false;
    this.changePasswordEnable = false;
    this.changeLanguageEnable = false;
  }

  ngOnInit()
  {
    const state = this.appStore.getState();

    this.changeName = state.user.name;
    this.oldPassword = '';
    this.changeEmail = state.user.email;
    // console.log('cred name ' + this.changeName + ' email ' + this.changeEmail);

    this.nameFormControl = new FormControl(this.changeName, /*[Validators.required]*/);
    this.emailFormControl = new FormControl(this.changeEmail, /*[Validators.required]*/);
    this.passwordFormControl = new FormControl('', /*[Validators.required]*/);
    this.newPasswordFormControl = new FormControl('', [/*[Validators.required]*/
      Validators.pattern('(?=.*[a-z])((?=.*[0-9])|(?=.*[!@#$%^*&?)§(\/]))[A-Za-z0-9!@#$%^*&?)§(\/].{5,}')]);
    this.newConfirmPasswordFormControl = new FormControl('', /*[Validators.required]*/);

    this.changeForm = new FormGroup({
      name: this.nameFormControl,
      email: this.emailFormControl,
      password: this.passwordFormControl,
      newPassword: this.newPasswordFormControl,
      newConfirmPassword: this.newConfirmPasswordFormControl
    });

    this.changeForm.get('newConfirmPassword').setValidators(this.matchingpassword('newPassword'));
    this.language = this.languageService.getCurrentLanguageAsString();
  }

  getPasswordErrorMessage() {
    return this.newPasswordFormControl.hasError('required') ? 'You must enter a value' :
    this.newPasswordFormControl.hasError('pattern') ?
    this.translate.instant('changeCredentials.infoPassword1') +
    this.translate.instant('changeCredentials.infoPassword2') : '';
  }
  getConfirmPasswordErrorMessage() {

    return this.newConfirmPasswordFormControl.hasError('required') ? this.translate.instant('changeCredentials.enterValue') :
    this.newConfirmPasswordFormControl.hasError('matchingpassword') ? this.translate.instant('changeCredentials.notSamePassword') :
    this.translate.instant('changeCredentials.notSamePassword');
  }
  getRequiredErrorMessage(field) {
    return this.changeForm.get(field).hasError('required') ? this.translate.instant('changeCredentials.enterValue') : '';
  }



  matchingpassword(field: string): ValidatorFn {
    return (control: FormControl): {[key: string]: any} => {
      const group = control.parent;
      const fieldToCompare = group.get(field);
      let notMatching;

      notMatching = !(String(fieldToCompare.value) === String(control.value) && String(control.value) !== '');

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
        // console.log('Account NOT deleted!');
      }
    });
  }

  getCredChangeErrorMessage(field) {
    return this.translate.instant('changeCredentials.credentialsNotChanged');
  }

  getCredChangeExistingCred(field) {
    return this.translate.instant('changeCredentials.credentialsTaken');
  }

  public useLanguage(language: string) {
    this.translate.use(language);

    if(language === 'de')
    {
      this.languageService.transmitChangeUserLanguage(languageTypes.DE);
    }
    else {
      this.languageService.transmitChangeUserLanguage(languageTypes.ENG);
    }
    this.language = language;
  }

  public closeWindow(){
    if(!this.changeUsernameEnable && !this.changeEmailEnable && !this.changePasswordEnable && !this.changeLanguageEnable){
      this.router.navigate(['mainview']).then( () => {
        this.nativeCommunicationService.sendToNative('Main View', 'print');
      });
    }
  }

  changeUsernamePreview(){
    this.changeUsernameEnable = true;
    this.lastUpdated = 'changeUsernameEnable';

    this.changeEmailEnable = false;
    this.changePasswordEnable = false;
    this.changeLanguageEnable = false;
  }

  changeEmailPreview(){
    this.changeEmailEnable = true;
    this.lastUpdated = 'changeEmailEnable';

    this.changeUsernameEnable = false;
    this.changePasswordEnable = false;
    this.changeLanguageEnable = false;
  }

  changePasswordPreview(){
    this.changePasswordEnable = true;
    this.lastUpdated = 'changePasswordPreview';

    this.changeUsernameEnable = false;
    this.changeEmailEnable = false;
    this.changeLanguageEnable = false;
  }

  changeLanguagePreview(){
    this.changeLanguageEnable = true;

    this.changeUsernameEnable = false;
    this.changeEmailEnable = false;
    this.changePasswordEnable = false;
  }

  cancelCredentialsChange(){
    this.changeLanguageEnable = false;
    this.changeUsernameEnable = false;
    this.changeEmailEnable = false;
    this.changePasswordEnable = false;
  }

}
