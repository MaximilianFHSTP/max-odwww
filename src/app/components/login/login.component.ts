import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import {UserActions} from '../../store/actions/UserActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import {TransmissionService} from '../../services/transmission.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
@Injectable()
export class LoginComponent implements OnInit
{
  public loginName: string;
  public loginPassword: string;
  public wrongLogin: boolean;

  private subscriptionWrongLogin: Subscription;

  nameFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required]);

  loginForm: FormGroup = new FormGroup({
    name: this.nameFormControl,
    password: this.passwordFormControl
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
    this.subscriptionWrongLogin = this.alertService.getMessageWrongLoginCheck().subscribe(message => {
      this.wrongLogin = message;
      console.log('LoginComponent' + message);
    });
   }

  public loginDevice()
  {
    console.log('LoginComponentButton');
    this.transmissionService.loginName = this.nameFormControl.value;
    this.transmissionService.loginPassword = this.passwordFormControl.value;

    const state = this.appStore.getState();
    const platform = state.platform;

    // this.checkEmailValue(this.nameFormControl.value);
    this.transmissionService.transmitODLogin();
  }

  ngOnInit()
  {
    this.loginName = '';
    this.loginPassword = '';
  }

  getRequiredErrorMessage(field) {
    return this.loginForm.get(field).hasError('required') ? this.translate.instant('login.enterValue') : '';
  }

  getLoginErrorMessage(){
    return this.translate.instant('login.credentialsNotMatch');
  }

}
