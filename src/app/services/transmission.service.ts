import {Inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {GodService} from './god/god.service';
import {LocationService} from './location.service';
import {LocationActions} from '../store/actions/LocationActions';
import {NativeCommunicationService} from './native/native-communication.service';
import {UserActions} from '../store/actions/UserActions';
import {StatusActions} from '../store/actions/StatusActions';
import {MatDialog} from '@angular/material';
import {AlertService} from './alert.service';
import {UtilityService} from './utility.service';
import {Subscription} from 'rxjs';
import * as LocationTypes from '../config/LocationTypes';

@Injectable({
  providedIn: 'root'
})
export class TransmissionService
{

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
  private subscriptionUsernameRegister: Subscription;
  private subscriptionEmailRegister: Subscription;
  public isUsernameNotExisting: boolean;
  public isEmailNotExisting: boolean;
  public deviceAddress: string;
  public deviceOS: string;
  public deviceVersion: string;
  public deviceModel: string;
  public language: string;

  constructor(
    private router: Router,
    private godService: GodService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private nativeCommunicationService: NativeCommunicationService,
    private userActions: UserActions,
    private statusActions: StatusActions,
    private dialog: MatDialog,
    private alertService: AlertService,
    private utilityService: UtilityService
  )
  {
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
        this.nativeCommunicationService.sendToNative('turnOnBluetooth', 'activateBluetooth');
      } else if (message.result === 'cancel') {
        // TODO: when alert for turning on Bluetooth was canceled
      }
    });
    this.subscriptionWifi = this.alertService.getMessageNativeWifiSettingCheckResult().subscribe(message => {
      if (message.result === 'confirm') {
        this.nativeCommunicationService.sendToNative('wrongWifi', 'activateWifiSettings');
        this.nativeCommunicationService.sendToNative('bluetoothCheck', 'activateBluetoothCheck');
      } else if (message.result === 'cancel') {
        this.nativeCommunicationService.sendToNative('bluetoothCheck', 'activateBluetoothCheck');
        // TODO: when alert for switching to correct wifi was canceled
      }
    });
    this.subscriptionUsernameRegister = this.alertService.getUsernameRegisterCheckResult().subscribe(message => {
      this.isUsernameNotExisting = message;
      this.godService.checkEmailExists(this.registerEmail);
    });
    this.subscriptionEmailRegister = this.alertService.getEmailRegisterCheckResult().subscribe(message => {
      this.isEmailNotExisting = message;
      console.log('username ' + this.isUsernameNotExisting + ' email '+ this.isEmailNotExisting);

      if (this.isUsernameNotExisting && this.isEmailNotExisting) {
        const data = {
          identifier: this.registerName, password: this.registerPassword, email: this.registerEmail,
          deviceAddress: this.deviceAddress, deviceOS: this.deviceOS, deviceVersion: this.deviceVersion,
          deviceModel: this.deviceModel, language: this.language
        };
        this.godService.registerOD(data);
      } else {
        // console.log('Transmissionservice send existing');
        console.log('after user ' + this.isUsernameNotExisting + ' email ' + this.isEmailNotExisting);
        const checks = {
          user: this.isUsernameNotExisting, email: this.isEmailNotExisting
        };
        this.alertService.sendMessageExistingCredentials(checks);
        // TODO: Alert with error message of existing username
        // console.log('ERROR: username already exists');
      }
    });
  }

  /***************************************************************************
   ****                           OD Methods                              ****
   ***************************************************************************/


  public transmitODRegister(result: any): void
  {
    console.log('transmitODRegister start');
    this.deviceAddress = result.deviceAddress;
    this.deviceOS = result.deviceOS;
    this.deviceVersion = result.deviceVersion;
    this.deviceModel = result.deviceModel;

    const state = this.appStore.getState();
    this.language = state.language;

    if (this.registerIsGuest) {
      const data = {deviceAddress: this.deviceAddress, deviceOS: this.deviceOS, deviceVersion: this.deviceVersion,
        deviceModel: this.deviceModel, language: this.language};
      this.godService.registerODGuest(data);
    }
    else {
      // console.log('transmitODRegister else no guest');
      /*const data = {
        identifier: this.registerName, password: this.registerPassword, email: this.registerEmail,
        deviceAddress, deviceOS, deviceVersion, deviceModel, language
      };
      console.log('name ' + this.registerName + ' email ' + this.registerEmail);*/
      // const isUsernameNotExisting =
      this.godService.checkUsernameExists(this.registerName);
      // const isEmailNotExisting =
      // this.godService.checkEmailExists(this.registerEmail);
      /*console.log('before user ' + isUsernameNotExisting + ' email ' + isEmailNotExisting);
      if (isUsernameNotExisting && isEmailNotExisting) {
        // console.log('transmitODRegister register');
        // console.log('transmitRegisterOD ' + data.identifier + ' ' + data.email);
        this.godService.registerOD(data);
      } else {
        // console.log('Transmissionservice send existing');
        console.log('after user ' + isUsernameNotExisting + ' email ' + isEmailNotExisting);
        const checks = {
          user: isUsernameNotExisting, email: isEmailNotExisting
        };
        this.alertService.sendMessageExistingCredentials(checks);
        // TODO: Alert with error message of existing username
        // console.log('ERROR: username already exists');
      }*/
    }
  }

  public transmitODLogin(): void {
    const isEmail = this.utilityService.checkIfEmail(this.loginName);
    console.log('login ' + isEmail);
    if (isEmail) {
      const data = {user: undefined, email: this.loginName, password: this.loginPassword};
      this.godService.loginOD(data);
    } else {
      const data = {user: this.loginName, email: undefined, password: this.loginPassword};
      this.godService.loginOD(data);
    }
  }

  public transmitODGuestToRealRegister(): void{
    const state = this.appStore.getState();
    const data = {
      username: this.registerName, email: this.registerEmail, password: this.registerPassword, id: state.user.id
    };
    const isUsernameExisting = this.godService.checkUsernameExists(this.registerName);
    const isEmailExisting = this.godService.checkEmailExists(this.registerEmail);
    if (!isUsernameExisting && !isEmailExisting) {
      // console.log('transmitRegisterOD ' + data.identifier + ' ' + data.email);
      this.godService.registerODGuestToReal(data);
    } else {
      // TODO: Alert with error message of existing username
      // console.log('ERROR: username already exists');
    }
  }

  public transmitUserCredentialChange(){
    const state = this.appStore.getState();
    const data = {id: state.user.id, username: this.changeName, email: this.changeName, password: this.changeOldPassword,
      newPassword: this.changeNewPassword};
    this.godService.updateUserCredentials(data);
  }

  public deleteUserAccount(){
    const state = this.appStore.getState();
    this.godService.deleteUserAccount(state.user.id);
    this.logout();
  }

  public logout(): void {
    this.nativeCommunicationService.sendToNative('clearToken', 'clearToken');

    if (this.nativeCommunicationService.isWeb === true) {
      this.transmitLogoutCleanup();
    }
  }

  public transmitLogoutCleanup(): void
  {
    this.appStore.dispatch(this.statusActions.changeLoggedIn(false));

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

  /***************************************************************************
   ****                        Location Methods                           ****
   ***************************************************************************/

  public transmitLocationRegister(result: any) {
    const state = this.appStore.getState();
    const minor: number = result.minor;

    const location = this.locationService.findLocation(minor);

    if (!location) {
      this.nativeCommunicationService.sendToNative('this is not a valid location', 'print');
      return;
    }

    const exhibitParentId = state.atExhibitParentId;
    const onExhibit = state.onExhibit;

    if ((location.locationTypeId !== LocationTypes.ACTIVE_EXHIBIT_ON && !onExhibit) ||
      (location.locationTypeId === LocationTypes.ACTIVE_EXHIBIT_ON && exhibitParentId === location.parentId))
    {
      if (location.locationTypeId === LocationTypes.ACTIVE_EXHIBIT_ON) {
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

  public transmitLocationRegisterTableBehavior(): void {
    const location = this.locationService.findBehaviorChildLocation();

    if (!location) {
      this.nativeCommunicationService.sendToNative('this is not a valid location', 'print');
      return;
    }

    // location is not the same as before
    if (!this.locationService.sameAsCurrentLocation(location.id)) {

      const state = this.appStore.getState();
      const exhibitParentId = state.atExhibitParentId;

      this.nativeCommunicationService.sendToNative('new valid location found - check and registerLocation at GoD', 'print');

      if (location.locationTypeId === LocationTypes.ACTIVE_EXHIBIT_BEHAVIOR_ON && exhibitParentId === location.parentId) {
        this.godService.registerLocation(location.id, false);
      }
    }
  }

  public transmitTimelineUpdate(locationId: number): void
  {
    this.godService.registerTimelineUpdate(locationId);
  }

  public transmitLocationLike(like: boolean): void {
    const currLoc = this.locationService.currentLocation.value;

    if (like) {
      this.nativeCommunicationService.sendToNative('Like location ' + currLoc.name, 'print');
    }
    else {
      this.nativeCommunicationService.sendToNative('Unlike location ' + currLoc.name, 'print');
    }


    this.godService.registerLocationLike(currLoc, like);
  }
}
