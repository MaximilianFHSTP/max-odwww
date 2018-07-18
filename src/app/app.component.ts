import {Component, NgZone, Inject, Injectable, OnInit, OnDestroy} from '@angular/core';
import {UserActions} from './actions/UserActions';
import {LocationActions} from './actions/LocationActions';
import { UtilitiesService } from './services/utilities.service';
import {Unsubscribe} from 'redux';
import {NativeCommunicationService} from './services/native-communication.service';
import {WindowRef} from './WindowRef';
import * as SuccessTypes from './config/SuccessTypes';
import * as ErrorTypes from './config/ErrorTypes';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@Injectable()
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';

  public platform: String;
  private _unsubscribe: Unsubscribe;
  private currentToken: String;
  private currentError: number;
  private currentSuccess: number;

  constructor(
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private locationActions: LocationActions,
    private utilitiesService: UtilitiesService,
    private winRef: WindowRef,
    private nativeCommunicationService: NativeCommunicationService,
    public snackBar: MatSnackBar
  )
  {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      const token = state.token;

      const errorMessage = state.errorMessage;
      const successMessage = state.successMessage;


      if (this.currentToken !== token && token !== undefined)
      {
        this.utilitiesService.sendToNative(token, 'saveToken');
        this.currentToken = token;
      }

      if(errorMessage && errorMessage.code !== this.currentError){
        let config = new MatSnackBarConfig();
        config.duration = 3000;
        config.panelClass = ['error-snackbar'];
        let snackBarRef = this.snackBar.open(errorMessage.message, 'OK', config);
      }

      if(successMessage && successMessage.code !== this.currentSuccess){
        let config = new MatSnackBarConfig();
        config.duration = 3000;
        config.panelClass = ['success-snackbar'];
        let snackBarRef = this.snackBar.open(successMessage.message, 'OK', config);
      }
    });
  }

  ngOnInit() {
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(0));
    this.appStore.dispatch(this.locationActions.changeOnExhibit(false));

    this.requestCheckedPlatform();
    this.getTokenForAutoLogin();
  }

  ngOnDestroy() {
    this._unsubscribe();
  }

  public requestCheckedPlatform(){
    this.appStore.dispatch(this.userActions.changePlatform(this.utilitiesService.checkPlatform()));
  }

  public getTokenForAutoLogin()
  {
    const state = this.appStore.getState();
    const platform = state.platform;

    this.utilitiesService.sendToNative('getToken', 'getToken');

    if (platform !== 'IOS' && platform !== 'Android')
    {
      const data = JSON.parse(localStorage.getItem('token'));
      // console.log('LOCAL STORAGE: ' + data.token);
      if (data) {
        this.nativeCommunicationService.autoLogin(data);
      }
    }
  }

  public showUnityView()
  {
    // this.utilitiesService.sendToNative('AppComponent Show Unity', 'print');
    this.nativeCommunicationService.transmitShowUnity();
  }

  public logoutUser()
  {
    this.nativeCommunicationService.logout();
  }
}
