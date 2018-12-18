import {Inject, Injectable, OnInit} from '@angular/core';
import {GodService} from './god.service';
import {LocationService} from './location.service';
import {LocationActions} from '../actions/LocationActions';
import {UtilitiesService} from './utilities.service';
import {Router} from '@angular/router';
import {UserActions} from '../actions/UserActions';
import {StatusActions} from '../actions/StatusActions';
import {MatDialog} from '@angular/material';
import {Subscription} from 'rxjs/Subscription';
import {AlertService} from './alert.service';
import {ExhibitService} from './exhibit.service';

@Injectable()
export class NativeCommunicationService implements OnInit {
  public registerName: string;
  public registerEmail: string;
  public registerPassword: string;
  public registerIsGuest: boolean;
  public loginName: string;
  public loginPassword: string;
  public changeName: string;
  public changeEmail: string;
  public changeOldPassword: string;
  public changeNewPassword: string;
  private subscription: Subscription;
  private subscriptionWifi: Subscription;
  private subscriptionBluetooth: Subscription;

  constructor(
    private router: Router,
    private godService: GodService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private utilitiesService: UtilitiesService,
    private userActions: UserActions,
    private statusActions: StatusActions,
    private dialog: MatDialog,
    private alertService: AlertService,
    private exhibitService: ExhibitService
  ) {
    this.subscription = this.alertService.getMessageResponse().subscribe(message => {
      if (message.result === 'confirm') {
        this.godService.registerLocation(message.location, false);
      }
      else {
        this.godService.registerLocation(message.location, true);
      }
      this.locationService.startLocationScanning();
    });
    this.subscriptionBluetooth = this.alertService.getMessageNativeBluetoothSettingCheckResult().subscribe(message => {
      if (message.result === 'confirm') {
        this.utilitiesService.sendToNative('turnOnBluetooth', 'activateBluetooth');
      } else if (message.result === 'cancel') {
        // TODO: when alert for turning on Bluetooth was canceled
      }
    });
    this.subscriptionWifi = this.alertService.getMessageNativeWifiSettingCheckResult().subscribe(message => {
      if (message.result === 'confirm') {
        this.utilitiesService.sendToNative('wrongWifi', 'activateWifiSettings');
        this.utilitiesService.sendToNative('bluetoothCheck', 'activateBluetoothCheck');
      } else if (message.result === 'cancel') {
        this.utilitiesService.sendToNative('bluetoothCheck', 'activateBluetoothCheck');
        // TODO: when alert for switching to correct wifi was canceled
      }
    });
  }

  ngOnInit() {
  }

  public transmitODRegister(result: any): void {
    const deviceAddress: string = result.deviceAddress;
    const deviceOS: string = result.deviceOS;
    const deviceVersion: string = result.deviceVersion;
    const deviceModel: string = result.deviceModel;

    const state = this.appStore.getState();
    const language = state.language;

    if (this.registerIsGuest) {
      const data = {deviceAddress, deviceOS, deviceVersion, deviceModel, language};
      this.godService.registerODGuest(data);
    }
    else {
      const data = {
        identifier: this.registerName, password: this.registerPassword, email: this.registerEmail,
        deviceAddress, deviceOS, deviceVersion, deviceModel, language
      };
      const isUsernameExisting = this.godService.checkUsernameExists(this.registerName);
      const isEmailExisting = this.godService.checkEmailExists(this.registerEmail);
      if (!isUsernameExisting && !isEmailExisting) {
        console.log('transmitRegisterOD ' + data.identifier + ' ' + data.email);
        this.godService.registerOD(data);
      } else {
        // TODO: Alert with error message of existing username
        console.log('ERROR: username already exists');
      }
    }
  }

  public transmitODLogin(): void {
    const isEmail = this.utilitiesService.checkIfEmail(this.loginName);
    if (isEmail) {
      const data = {user: undefined, email: this.loginName, password: this.loginPassword};
      this.godService.loginOD(data);
    } else {
      const data = {user: this.loginName, email: undefined, password: this.loginPassword};
      this.godService.loginOD(data);
    }
  }

  public transmitLocationRegister(result: any) {
    const state = this.appStore.getState();
    const minor: number = result.minor;

    const location = this.locationService.findLocation(minor);

    if (!location) {
      this.utilitiesService.sendToNative('this is not a valid location', 'print');
      return;
    }

    const exhibitParentId = state.atExhibitParentId;
    const onExhibit = state.onExhibit;

    if ((location.locationTypeId !== 2 && !onExhibit) || (location.locationTypeId === 2 && exhibitParentId === location.parentId)) {
      if (location.locationTypeId === 2) {
        this.godService.checkLocationStatus(location.id, res => {
          if (res === 'FREE') {
            this.godService.registerLocation(location.id, false);
            this.appStore.dispatch(this.locationActions.changeLocationSocketStatus(res));
          }
          else {
            this.appStore.dispatch(this.locationActions.changeLocationSocketStatus(res));
          }
        });
      }
      else {
        this.locationService.stopLocationScanning();
        const data = {location: location.id, resStatus: null};

        this.alertService.sendMessageLocationid(data);
        const elm: HTMLElement = document.getElementById('ghostButton') as HTMLElement;
        elm.click();
      }
    }

  }

  public transmitUserCredentialChange(){
    const state = this.appStore.getState();
    const data = {id: state.user.id, username: this.changeName, email: this.loginName, password: this.changeOldPassword,
      newPassword: this.changeNewPassword};
    this.godService.updateUserCredentials(data);
  }

  public deleteUserAccount(){
    const state = this.appStore.getState();
    // const data = {username: state.user.name, email: state.user.email};
    this.godService.deleteUserAccount(state.user.id);
    this.logout();
  }

  public transmitTimelineUpdate(result: any) {
    const state = this.appStore.getState();
    const minor: number = result.minor;

    const location = this.locationService.findLocation(minor);

    if (!location) {
      this.utilitiesService.sendToNative('this is not a valid location', 'print');
      return;
    }

    const currLoc = this.locationService.currentLocation.value;

    // if the location is not the same as before
    if (!this.locationService.sameAsCurrentLocation(location.id)) {
      // update the closestExhibit if the location is not already the closest one
      if (location.id !== this.appStore.getState().closestExhibit && location.locationTypeId !== 2) {
        this.appStore.dispatch(this.locationActions.changeClosestExhibit(location.id));
      }
      // If the current location is from type activeExhibitOn the redirection should be disabled
      if (currLoc && currLoc.locationTypeId === 2) {
        this.utilitiesService.sendToNative('this is not a valid location - type 2', 'print');
        return;
      }

      // If the new location is a tableOn beacon and the user is currently tableat transmit location register directly
      if (currLoc && currLoc.locationTypeId === 3 && location.locationTypeId === 2 && location.parentId === currLoc.id) {
        console.log('TimelineUdate: Redirect to transmitLocationRegister');
        this.transmitLocationRegister({minor: location.id, major: location.parentId});
      }

      // check if the location is still locked. If so unlock it
      if (location.locked && state.locationScanning === true) {
        this.godService.registerTimelineUpdate(location.id);
        this.utilitiesService.sendToNative(location.id, 'showBackgroundNotification');
      }
    }
  }

  public transmitLocationRegisterTableBehavior(): void {
    const location = this.locationService.findBehaviorChildLocation();

    if (!location) {
      this.utilitiesService.sendToNative('this is not a valid location', 'print');
      return;
    }

    // location is not the same as before
    if (!this.locationService.sameAsCurrentLocation(location.id)) {

      const state = this.appStore.getState();
      const exhibitParentId = state.atExhibitParentId;

      this.utilitiesService.sendToNative('new valid location found - check and registerLocation at GoD', 'print');

      if (location.locationTypeId === 7 && exhibitParentId === location.parentId) {
        this.godService.registerLocation(location.id, false);
      }
    }
  }

  public autoLogin(data): void {
    const token: String = data.token;
    this.utilitiesService.sendToNative('Autologin', 'print');

    if (token !== undefined && token !== null && token !== '') {
      this.godService.autoLogin(token);
    }
  }

  public checkWifi(data: any): void {
    const wifiSSSID: String = data.ssid;
    this.utilitiesService.sendToNative('Received SSID: ' + wifiSSSID, 'print');

    if (wifiSSSID !== undefined && wifiSSSID !== null && wifiSSSID !== '') {
      this.godService.checkWifi(wifiSSSID);
    }
  }

  public checkBluetooth(): void {
    const nativeSettingType = 'Bluetooth';
    const data = {nativeSettingType: nativeSettingType};

    this.alertService.sendMessageNativeSettingCheck(data);
    const elm: HTMLElement = document.getElementById('ghostButtonBluetooth') as HTMLElement;
    elm.click();
  }

  public logout(): void {
    this.utilitiesService.sendToNative('clearToken', 'clearToken');

    if (this.utilitiesService.isWeb === true) {
      this.logoutSuccess();
    }
  }

  public logoutSuccess(): void {
    this.appStore.dispatch(this.statusActions.changeLoggedIn(false));

    /*this.router.navigate(['']).then(() => {
      this.utilitiesService.sendToNative('User Logged out', 'print');
    });*/
    const elm: HTMLElement = document.getElementById('logout') as HTMLElement;
    elm.click();

    this.appStore.dispatch(this.userActions.changeToken(undefined));
    this.appStore.dispatch(this.locationActions.changeLocationStatus(undefined));
    this.appStore.dispatch(this.locationActions.changeLocationSocketStatus(undefined));
    this.appStore.dispatch(this.locationActions.changeConnectedExhibit(false));
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(undefined));
    this.appStore.dispatch(this.locationActions.changeOnExhibit(false));
    this.appStore.dispatch(this.locationActions.changeClosestExhibit(undefined));
  }

  public transmitLocationLike(like: boolean): void {
    const currLoc = this.locationService.currentLocation.value;

    if (like) {
      this.utilitiesService.sendToNative('Like location ' + currLoc.name, 'print');
    }
    else {
      this.utilitiesService.sendToNative('Unlike location ' + currLoc.name, 'print');
    }


    this.godService.registerLocationLike(currLoc, like);
  }

  public changeUserLanguage(lang: number)
  {
    this.godService.updateUserLanguage(lang);
  }

  public redirectToTimeline()
  {
    this.alertService.sendMessageNativeBackbuttonTimeline();
    /*this.locationService.setToStartPoint();
    this.router.navigate(['/mainview']).then( () =>
      {
        // send success to native & start beacon scan
        this.utilitiesService.sendToNative('success', 'redirectToTimeline');
      }
    );*/
  }

  public redirectToStart()
  {
    this.alertService.sendMessageNativeBackbuttonStart();
    /*this.locationService.setToStartPoint();
    this.router.navigate(['']).then( () =>
      {
        // send success to native & start beacon scan
        this.utilitiesService.sendToNative('success', 'redirectToStart');
      }
    );*/
  }
}
