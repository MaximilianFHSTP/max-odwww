import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import {UserActions} from '../../store/actions/UserActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import {TranslateService} from '@ngx-translate/core';

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
  private existingUser: boolean;
  private existingEmail: boolean;
  public wrongCred: boolean;
  private errorCredentialMessage: string;
  private subscriptionNativeBackbutton: Subscription;

  nameFormControl = new FormControl('', [Validators.required]);
  emailFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required,
    Validators.pattern('(?=.*[a-z])((?=.*[0-9])|(?=.*[!@#$%^*&?)§(\/]))[A-Za-z0-9!@#$%^*&?)§(\/].{5,}')]);
  confirmPasswordFormControl = new FormControl('', [Validators.required]);

  registerRealUserForm: FormGroup = new FormGroup({
    name: this.nameFormControl,
    email: this.emailFormControl,
    password: this.passwordFormControl,
    confirmPassword: this.confirmPasswordFormControl
  });

  constructor(
    private router: Router,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private nativeCommunicationService: NativeCommunicationService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private translate: TranslateService
  ) {
    this.subscriptionExistingCred = this.alertService.getMessageExistingCredentialsRealUser().subscribe(message => {
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

    this.subscriptionNativeBackbutton = this.alertService.getMessageNativeBackbutton().subscribe(() => {
      const elm: HTMLElement = document.getElementById('closebutton') as HTMLElement;
      if(elm){ elm.click(); }
    });
  }

  public registerAsRealuser()
  {

  }

  ngOnInit()
  {
    this.registerName = '';
    this.registerPassword = '';
    this.registerEmail = '';

    this.registerRealUserForm.get('confirmPassword').setValidators(this.matchingpassword('password'));
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
    return this.registerRealUserForm.get(field).hasError('required') ? this.translate.instant('changeCredentials.enterValue') : '';
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

  public closeWindow(){
    this.router.navigate(['mainview']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Main View', 'print');
      }
    );
  }

}
