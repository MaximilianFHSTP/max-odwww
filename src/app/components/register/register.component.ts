import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import {UserActions} from '../../store/actions/UserActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn } from '@angular/forms';
import {TransmissionService} from '../../services/transmission.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
@Injectable()
export class RegisterComponent implements OnInit
{
  public registerName: string;
  public registerEmail: string;
  public registerPassword: string;
  public confirmPassword_: string;
  private errorCredentialMessage: string;

  public subscriptionExistingCred: Subscription;
  private existingEmail: boolean;
  private existingUser: boolean;
  public wrongCred: boolean;

  nameFormControl = new FormControl('', [Validators.required]);
  emailFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required,
    Validators.pattern('(?=.*[a-z])((?=.*[0-9])|(?=.*[!@#$%^*&?)§(\/]))[A-Za-z0-9!@#$%^*&?)§(\/].{5,}')]);
  confirmPasswordFormControl = new FormControl('', [Validators.required]);

  signupForm: FormGroup = new FormGroup({
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
    private fb: FormBuilder,
    private alertService: AlertService,
    private translate: TranslateService
  ) {
    this.subscriptionExistingCred = this.alertService.getMessageExistingCredentials().subscribe(message => {
      this.existingUser = message.user;
      this.existingEmail = message.email;
      if(this.existingUser && this.existingEmail){
        this.wrongCred = true;
        this.errorCredentialMessage = this.translate.instant('register.userEmailAlreadyExists');
      }else if(this.existingUser){
        this.wrongCred = true;
        this.errorCredentialMessage = this.translate.instant('register.userAlreadyExists');
      }else if(this.existingEmail){
        this.wrongCred = true;
        this.errorCredentialMessage = this.translate.instant('register.emailAlreadyExists');
      }else{
        this.wrongCred = true;
        this.errorCredentialMessage = this.translate.instant('register.credentialsNotMatch');
      }
    });
  }

  public requestDeviceInfos(isGuest: boolean)
  {
    this.transmissionService.registerName = this.nameFormControl.value;
    this.transmissionService.registerEmail = this.emailFormControl.value;
    this.transmissionService.registerPassword = this.passwordFormControl.value;
    this.transmissionService.registerIsGuest = isGuest;
    // console.log(this.registerEmail + ' ' + this.registerName + ' ' + this.registerPassword);

    const state = this.appStore.getState();
    const platform = state.platform;

    this.nativeCommunicationService.sendToNative('register', 'getDeviceInfos');

    if (platform !== 'IOS' && platform !== 'Android')
    {
      const data = {deviceAddress: 'deviceAddress', deviceOS: 'deviceOS', deviceVersion: 'deviceVersion', deviceModel: 'deviceModel'};
      this.transmissionService.transmitODRegister(data);
    }
  }

  ngOnInit()
  {
    this.registerName = '';
    this.registerPassword = '';
    this.registerEmail = '';

    this.signupForm.get('confirmPassword').setValidators(this.matchingpassword('password'));
  }

  getPasswordErrorMessage() {
    return this.passwordFormControl.hasError('required') ? this.translate.instant('changeCredentials.enterValue') :
      this.passwordFormControl.hasError('pattern') ?
      this.translate.instant('changeCredentials.infoPassword1') +
      this.translate.instant('changeCredentials.infoPassword2') : '';
  }
  getConfirmPasswordErrorMessage() {

    return this.confirmPasswordFormControl.hasError('required') ? this.translate.instant('changeCredentials.enterValue') :
      this.confirmPasswordFormControl.hasError('matchingpassword') ? this.translate.instant('changeCredentials.notSamePassword') :
      this.translate.instant('changeCredentials.notSamePassword');
  }
  getRequiredErrorMessage(field) {
    return this.signupForm.get(field).hasError('required') ? this.translate.instant('changeCredentials.enterValue') : '';
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
      return notMatching ? {'matching': {value: control.value}} : null;
    };
  }

  getExistsErrorMessage(){
    return this.errorCredentialMessage;
  }

}
