import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NativeCommunicationService } from '../services/native-communication.service';
import { WindowRef } from '../WindowRef';
import {UserActions} from '../actions/UserActions';
import { UtilitiesService } from '../services/utilities.service';
import { AppComponent } from '../app.component';
import { ClassGetter } from '@angular/compiler/src/output/output_ast';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn } from '@angular/forms';

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

  nameFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required]);

  loginForm: FormGroup = new FormGroup({
    name: this.nameFormControl,
    password: this.passwordFormControl
  });

  constructor(
    private router: Router,
    private nativeCommunicationService: NativeCommunicationService,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private utilitiesService: UtilitiesService,
    private fb: FormBuilder
  ) { }

  public loginDevice()
  {
    this.nativeCommunicationService.loginName = this.nameFormControl.value;
    this.nativeCommunicationService.loginPassword = this.passwordFormControl.value;

    const state = this.appStore.getState();
    const platform = state.platform;

    // this.checkEmailValue(this.nameFormControl.value);
    this.nativeCommunicationService.transmitODLogin();
  }

  ngOnInit()
  {
    this.loginName = '';
    this.loginPassword = '';
  }

  getRequiredErrorMessage(field) {
    return this.loginForm.get(field).hasError('required') ? 'You must enter a value' : '';
  }

  forwardToRegister(){
    this.router.navigate(['/register']);
  }

}
