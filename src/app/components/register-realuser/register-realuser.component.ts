import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import {UserActions} from '../../store/actions/UserActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import {TransmissionService} from '../../services/transmission.service';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-register-realuser',
  templateUrl: './register-realuser.component.html',
  styleUrls: ['./register-realuser.component.css']
})
@Injectable()
export class RegisterRealuserComponent implements OnInit
{
  public registerName: string;
  public registerEmail: string;
  public registerPassword: string;
  public confirmPassword_: string;
  private subscriptionExistingCred: Subscription;
  private alertService: AlertService;
  private existingUser: boolean;
  private existingEmail: boolean;
  private wrongCred: boolean;

  nameFormControl = new FormControl('', [Validators.required]);
  emailFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required,
    Validators.pattern('(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^*&?)§(\/])[A-Za-z0-9!@#$%^*&?)§(\/].{5,}')]);
  confirmPasswordFormControl = new FormControl('', [Validators.required]);

  registerRealUserForm: FormGroup = new FormGroup({
    name: this.nameFormControl,
    email: this.emailFormControl,
    password: this.passwordFormControl,
    confirmPassword: this.confirmPasswordFormControl
  });

  constructor(
    private router: Router,
    private transmissionService: TransmissionService,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private nativeCommunicationService: NativeCommunicationService,
    private fb: FormBuilder
  ) {
    this.subscriptionExistingCred = this.alertService.getMessageExistingCredentials().subscribe(message => {
      this.existingUser = message.user;
      this.existingEmail = message.email;
      // console.log('RegComp user' + message.user + ' email' + message.email);
    });
  }

  public registerAsRealuser()
  {
    console.log('ODGuestToReal Method in Component');
    this.transmissionService.registerName = this.nameFormControl.value;
    this.transmissionService.registerEmail = this.emailFormControl.value;
    this.transmissionService.registerPassword = this.passwordFormControl.value;
    console.log(this.registerEmail + ' ' + this.registerName + ' ' + this.registerPassword);

    const state = this.appStore.getState();
    const platform = state.platform;

    // this.nativeCommunicationService.sendToNative('getDeviceInfos', 'getDeviceInfos');

    // if (platform !== 'IOS' && platform !== 'Android')
    // {
      console.log('ODGuestToReal Component before');
      this.transmissionService.transmitODGuestToRealRegister();
    // }
  }

  ngOnInit()
  {
    this.registerName = '';
    this.registerPassword = '';
    this.registerEmail = '';

    this.registerRealUserForm.get('confirmPassword').setValidators(this.matchingpassword('password'));
  }

  getPasswordErrorMessage() {
    return this.passwordFormControl.hasError('required') ? 'You must enter a value' :
      this.passwordFormControl.hasError('pattern') ?
      'Please use at least 6 characters with at least 1 upper case, 1 lower case, ' +
      '1 number and 1 special character! Example: ! $ § % & / ( ) = ?' : '';
  }
  getConfirmPasswordErrorMessage() {

    return this.confirmPasswordFormControl.hasError('required') ? 'You must enter a value' :
      this.confirmPasswordFormControl.hasError('matchingpassword') ? 'The password is not the same' : '';
  }
  getRequiredErrorMessage(field) {
    return this.registerRealUserForm.get(field).hasError('required') ? 'You must enter a value' : '';
  }



  matchingpassword(field: string): ValidatorFn {
    return (control: FormControl): {[key: string]: any} => {
      const group = control.parent;
      const fieldToCompare = group.get(field);
      let notMatching;

      if(String(fieldToCompare.value) === String(control.value) && String(control.value) !== ''){
        notMatching = false;
      }else{
        notMatching = true;
      }
      // const matching = String(fieldToCompare.value) === String(control.value);
      console.log('matchingpassword ' + notMatching + ' ' + String(control.value) + ' ' + String(fieldToCompare.value));
      return notMatching ? {'matching': {value: control.value}} : null;
    };
  }

  getExistsErrorMessage(){
    if(this.existingEmail === null || this.existingEmail === undefined){
      this.existingEmail = false;
    }
    if(this.existingUser === null || this.existingUser === undefined){
      this.existingUser = false;
    }
    // console.log('user ' + this.existingUser + ' email '+ this.existingEmail);
    if(this.existingUser && this.existingEmail){
      console.log('ERROR: username and email already exists');
      this.wrongCred = false;
      return 'These username and email already exists';
    }else if(this.existingUser){
      console.log('ERROR: username already exists');
      this.wrongCred = false;
      return 'This username already exists';
    }else if(this.existingEmail){
      console.log('ERROR: email already exists');
      this.wrongCred = false;
      return 'This email already exists';
    }
    return 'These credentials don\'t match';
  }

}
