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
  private subscriptionUserEmail: Subscription;
  public isUsernameExisting: boolean;
  public isEmailExisting: boolean;
  public deviceAddress: string;
  public deviceOS: string;
  public deviceVersion: string;
  public deviceModel: string;
  public language: string;
  private registerNew: boolean;
  private credChange: boolean;

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
      }
    });
    this.subscriptionWifi = this.alertService.getMessageNativeWifiSettingCheckResult().subscribe(message => {
      if (message.result === 'confirm') {
        this.nativeCommunicationService.sendToNative('wrongWifi', 'activateWifiSettings');
        this.nativeCommunicationService.sendToNative('bluetoothCheck', 'activateBluetoothCheck');
      } else if (message.result === 'cancel') {
        this.nativeCommunicationService.sendToNative('bluetoothCheck', 'activateBluetoothCheck');
      }
    });
    this.subscriptionUserEmail = this.alertService.getMessageUserOrEmailRegisterCheck().subscribe(message => {
      this.isEmailExisting = message.email;
      this.isUsernameExisting = message.name;
      const state = this.appStore.getState();
      if(this.credChange){
        if(!this.isUsernameExisting && !this.isEmailExisting && this.changeName !== undefined && this.changeEmail !== undefined &&
          state.user.name !== this.changeName && state.user.email !== this.changeEmail){
          const data = {id: state.user.id, username: this.changeName, email: this.changeEmail, password: this.changeOldPassword,
            newPassword: this.changeNewPassword};
          this.godService.updateUserCredentials(data);
        }else if(!this.isUsernameExisting && !this.isEmailExisting && this.changeName !== undefined &&
          state.user.name !== this.changeName && (state.user.email === this.changeEmail || this.changeEmail === undefined)){
          const data = {id: state.user.id, username: this.changeName, email: undefined, password: this.changeOldPassword,
            newPassword: this.changeNewPassword};
          this.godService.updateUserCredentials(data);
        }else if(!this.isUsernameExisting && !this.isEmailExisting && state.user.email !== this.changeEmail &&
          this.changeEmail !== undefined && (state.user.name === this.changeName || this.changeName === undefined)){
          const data = {id: state.user.id, username: this.changeName, email: this.changeEmail, password: this.changeOldPassword,
            newPassword: this.changeNewPassword};
          this.godService.updateUserCredentials(data);
        }else if((this.isUsernameExisting && state.user.name === this.changeName && !this.isEmailExisting)||
        (this.isEmailExisting && state.user.email === this.changeEmail && !this.isUsernameExisting)){
            const data = {id: state.user.id, username: this.changeName, email: this.changeEmail, password: this.changeOldPassword,
              newPassword: this.changeNewPassword};
            this.godService.updateUserCredentials(data);
        }else if(!this.isUsernameExisting && !this.isEmailExisting &&
          (state.user.email === this.changeEmail || this.changeEmail === undefined) &&
          (state.user.name === this.changeName || this.changeName === undefined) && this.changeNewPassword !== undefined &&
          this.changeOldPassword !== undefined){
          const data = {id: state.user.id, username: undefined, email: undefined, password: this.changeOldPassword,
            newPassword: this.changeNewPassword};
          this.godService.updateUserCredentials(data);
        }else if(this.isUsernameExisting && this.isEmailExisting && state.user.email === this.changeEmail &&
          state.user.name === this.changeName && this.changeNewPassword !== undefined && this.changeOldPassword !== undefined){
          const data = {id: state.user.id, username: undefined, email: undefined, password: this.changeOldPassword,
            newPassword: this.changeNewPassword};
          this.godService.updateUserCredentials(data);
        }else{
          this.alertService.sendMessageExistingCredentialsOnChange(true);
        }
      }else if(this.registerNew && !this.credChange){
        if (!this.isUsernameExisting && !this.isEmailExisting) {
          const data = {
            identifier: this.registerName, password: this.registerPassword, email: this.registerEmail,
            deviceAddress: this.deviceAddress, deviceOS: this.deviceOS, deviceVersion: this.deviceVersion,
            deviceModel: this.deviceModel, language: this.language
          };
          this.godService.registerOD(data);
        } else {
          const checks = {
            user: this.isUsernameExisting, email: this.isEmailExisting
          };
          this.alertService.sendMessageExistingCredentials(checks);
        }
      }else if(!this.registerNew && !this.credChange){
        const state = this.appStore.getState();
        const data = {
          username: this.registerName, email: this.registerEmail, password: this.registerPassword, id: state.user.id
        };
        if (!this.isUsernameExisting && !this.isEmailExisting) {
          this.godService.registerODGuestToReal(data);
        } else {
          const checks = {
            user: this.isUsernameExisting, email: this.isEmailExisting
          };
          this.alertService.sendMessageExistingCredentialsRealUser(checks);
        }
      }
      this.registerNew = null;
      this.credChange = null;
    });
  }

  /***************************************************************************
   ****                           OD Methods                              ****
   ***************************************************************************/


  public transmitODRegister(result: any): void
  {
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
      this.registerNew = true;
      const data = {name: this.registerName, email: this.registerEmail};
      this.godService.checkUserOrEmailExists(data);
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
    this.registerNew = false;
    const data = {name: this.registerName, email: this.registerEmail};
    this.godService.checkUserOrEmailExists(data);
  }

  public transmitUserCredentialChange(): void{
    this.credChange = true;
    const state = this.appStore.getState();
    const data = {name: this.changeName, email: this.changeEmail};
    this.godService.checkUserOrEmailExists(data);
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
    
    if (((location.locationTypeId !== LocationTypes.ACTIVE_EXHIBIT_ON ||
      location.locationTypeId !== LocationTypes.NOTIFY_EXHIBIT_ON) && !onExhibit) ||
      ((location.locationTypeId === LocationTypes.ACTIVE_EXHIBIT_ON || location.locationTypeId === LocationTypes.NOTIFY_EXHIBIT_ON)
        && exhibitParentId === location.parentId))
    {
      if (location.locationTypeId === LocationTypes.ACTIVE_EXHIBIT_ON || location.locationTypeId === LocationTypes.NOTIFY_EXHIBIT_ON) {
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

        this.godService.registerLocation(location.id, false);
        this.locationService.startLocationScanning();
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

  /*************************************************************************
   ****                           COA Methods                           ****
   *************************************************************************/
  public getCoaColors(): void{
    this.godService.getCoaColors();
  }

  public changeUserCoaColors(primColor: any, secColor: any): void{
    const state = this.appStore.getState();
    const data = {userId: state.user.id, prim: primColor, sec: secColor};
    this.godService.changeUserCoaColors(data);
  }

  public unlockCoaPart(coaPartId: any): void{
    const state = this.appStore.getState();
    const data = {userId: state.user.id, coaId: coaPartId};
    this.godService.unlockCoaPart(data);
  }

  public getUserCoaParts(): void{
    const state = this.appStore.getState();
    const data = {userId: state.user.id};
    this.godService.getUserCoaParts(data);
  }

  public getCoaParts(): void{
    this.godService.getCoaParts();
  }
}


