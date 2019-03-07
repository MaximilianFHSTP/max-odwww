import {Inject, Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import {LocationService} from '../location.service';
import {GodSocketService} from './god-socket.service';
import {LocationActions} from '../../store/actions/LocationActions';
import {UserActions} from '../../store/actions/UserActions';
import {StatusActions} from '../../store/actions/StatusActions';
import { NativeCommunicationService } from '../native/native-communication.service';
import { AlertService } from '../alert.service';
import * as ErrorTypes from '../../config/ErrorMessageTypes';
import * as SuccessTypes from '../../config/SuccessMessageTypes';
import * as LocationTypes from '../../config/LocationTypes';

@Injectable()
export class GodService {

  constructor(
    private router: Router,
    private winRef: WindowRef,
    private locationService: LocationService,
    private socket: GodSocketService,
    @Inject('AppStore') private store,
    private locationActions: LocationActions,
    private userActions: UserActions,
    private statusActions: StatusActions,
    private nativeCommunicationService: NativeCommunicationService,
    private alertService: AlertService
  )
  {
    this.socket.on('news', msg =>
    {
      this.nativeCommunicationService.sendToNative(msg, 'print');
      this.store.dispatch(this.statusActions.changeIsConnectedToGod(true));
    });

    this.socket.on('disconnect', () => {
      const error: Message = {code: ErrorTypes.LOST_CONNECTION_TO_GOD, message: 'Lost connection to Server'};
      this.store.dispatch(this.statusActions.changeErrorMessage(error));
      this.store.dispatch(this.statusActions.changeIsConnectedToGod(false));

      const state = this.store.getState();
      const location = state.currentLocation;

      const currLocType = location.locationTypeId;

      if(currLocType === LocationTypes.ACTIVE_EXHIBIT_ON || currLocType === LocationTypes.NOTIFY_EXHIBIT_ON
        || currLocType === LocationTypes.ACTIVE_EXHIBIT_BEHAVIOR_ON)
      {
          this.store.dispatch(this.locationActions.changeConnectedExhibit(false));
          this.store.dispatch(this.locationActions.changeAtExhibitParentId(0));
          this.store.dispatch(this.locationActions.changeOnExhibit(false));
          this.store.dispatch(this.locationActions.changeClosestExhibit(location.parentId));

          this.locationService.updateCurrentLocation(location.parentId);
          this.router.navigate(['/mainview']).then(() => { });
      }
    });

    this.socket.on('reconnect', () =>
    {
      const state = this.store.getState();
      this.socket.emit('addTokenToSocket', state.token);

      this.socket.on('addTokenToSocketResult', () =>
      {
        this.store.dispatch(this.statusActions.changeIsConnectedToGod(true));
      });

      const success: Message = {code: SuccessTypes.SUCCESS_RECONNECTED_TO_GOD, message: 'Reconnected to Server'};
      this.store.dispatch(this.statusActions.changeSuccessMessage(success));
    });

    this.socket.on('userKickedFromExhibit', result =>
    {
      if(!result.data) {return;}

      const parentLoc = result.data.parentId;

      this.store.dispatch(this.locationActions.changeConnectedExhibit(false));
      this.store.dispatch(this.locationActions.changeAtExhibitParentId(0));
      this.store.dispatch(this.locationActions.changeOnExhibit(false));
      this.store.dispatch(this.locationActions.changeClosestExhibit(parentLoc));

      this.registerLocation(parentLoc, false);
    });
  }

  public registerOD(data: any): any
  {
    this.socket.emit('registerOD', data);

    this.socket.on('registerODResult', result =>
    {
      this.nativeCommunicationService.sendToNative(result, 'print');
      const res = result.data;
      const message = result.message;

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }
      this.store.dispatch(this.userActions.changeUser(res.user));
      this.store.dispatch(this.userActions.changeLookupTable(res.locations));
      this.store.dispatch(this.userActions.changeToken(res.token));
      this.store.dispatch(this.statusActions.changeLoggedIn(true));

      this.locationService.setToStartPoint();

      this.router.navigate(['/mainview']).then( () =>
        {
          // send success to native & start beacon scan
          this.nativeCommunicationService.sendToNative('success', 'registerOD');
        }
      );

      this.socket.removeAllListeners('registerODResult');
    });
  }

  public registerODGuest(data: any): any
  {
    this.socket.emit('registerODGuest', data);

    this.socket.on('registerODGuestResult', result =>
    {
      const res = result.data;
      const message = result.message;

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }

      this.store.dispatch(this.userActions.changeUser(res.user));
      this.store.dispatch(this.userActions.changeLookupTable(res.locations));
      this.store.dispatch(this.userActions.changeToken(res.token));
      this.store.dispatch(this.statusActions.changeLoggedIn(true));

      this.locationService.setToStartPoint();

      this.router.navigate(['/mainview']).then( () =>
        {
          this.nativeCommunicationService.sendToNative('success', 'registerOD');
        }
      );

      this.socket.removeAllListeners('registerODGuestResult');
    });
  }

  public registerODGuestToReal(data: any): any
  {
    // console.log('ODGuestToReal before emit');
    this.socket.emit('makeToRealUser', data);

    this.socket.on('makeToRealUserResult', result =>
    {
      this.nativeCommunicationService.sendToNative(result, 'print');
      const res = result.data;
      const message = result.message;

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }
      this.store.dispatch(this.userActions.changeUser(res.user));
      // this.store.dispatch(this.userActions.changeLookupTable(res.locations));
      this.store.dispatch(this.userActions.changeToken(res.token));
      // this.store.dispatch(this.statusActions.changeLoggedIn(true));

      this.locationService.setToStartPoint();

      this.router.navigate(['/mainview']).then( () =>
        {
        }
      );

      this.socket.removeAllListeners('makeToRealUserResult');
    });
  }

  public registerLocation(id: number, dismissed: boolean): any
  {
    const state = this.store.getState();
    const user = state.user;
    this.socket.emit('registerLocation', {location: id, user: user.id, dismissed});

    this.socket.on('registerLocationResult', result =>
    {
      const loc = result.data.location;
      const dis = result.data.dismissed;
      const message = result.message;

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        this.nativeCommunicationService.sendToNative('RegisterLocation: FAILED', 'print');
        return;
      }

      if (dis === false)
      {
        this.locationService.updateCurrentLocation(loc);
        this.nativeCommunicationService.sendToNative('New Location is ' + this.locationService.currentLocation, 'print');
        const currLoc = this.locationService.currentLocation.value;
        this.router.navigate([currLoc.contentURL]).then(() => {
          window.scrollTo(0, 0);
         });
      }

      this.socket.removeAllListeners('registerLocationResult');
    });
  }

  public registerTimelineUpdate(id: number): any
  {
    const state = this.store.getState();
    const user = state.user;

    this.socket.emit('registerTimelineUpdate', {location: id, user: user.id});

    this.socket.on('registerTimelineUpdateResult', result =>
    {
      if(result.data){
        const lookuptable = result.data.locations;
        const message = result.message;

        if (message.code > 299)
        {
          this.store.dispatch(this.statusActions.changeErrorMessage(message));
          this.nativeCommunicationService.sendToNative('RegisterTimelineUpdate: FAILED', 'print');
          return;
        }

        this.nativeCommunicationService.sendToNative('success', 'triggerSignal');
        this.store.dispatch(this.userActions.changeLookupTable(lookuptable));

        // TODO: TRIGGER SCROLL HERE
        const data = {location: id};
        this.alertService.sendMessageLocationid(data);
        const elm: HTMLElement = document.getElementById('ghostScrollbutton') as HTMLElement;
        elm.click();
      }
      
      this.socket.removeAllListeners('registerTimelineUpdateResult');
    });
  }

  public registerLocationLike(location: any, like: boolean): void
  {
    const state = this.store.getState();
    const user = state.user;
    this.socket.emit('registerLocationLike', {location: location.id, like, user: user.id});

    this.socket.on('registerLocationLikeResult', result =>
    {
      const res = result.data;
      const message = result.message;

      this.store.dispatch(this.userActions.changeLookupTable(res.locations));

      const currLoc = this.locationService.currentLocation.value;
      this.locationService.updateCurrentLocation(currLoc.id);

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }

      this.socket.removeAllListeners('registerLocationLikeResult');
    });
  }

  public checkLocationStatus(data: any, callback: any = null): void
  {
    this.socket.emit('checkLocationStatus', data);

    this.socket.on('checkLocationStatusResult', result =>
    {
      const res = result.data;
      const message = result.message;

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }

      const location = this.locationService.findLocation(res.location);

      if (location.locationTypeId !== LocationTypes.ACTIVE_EXHIBIT_ON || location.locationTypeId !== LocationTypes.NOTIFY_EXHIBIT_ON) {
        this.store.dispatch(this.locationActions.changeLocationStatus(res.status));
      }

      if (callback != null)
      {
        callback(res.status);
      }

      this.socket.removeAllListeners('checkLocationStatusResult');
    });
  }

  public disconnectedFromExhibit(parentLocation, location): void
  {
    this.socket.emit('disconnectedFromExhibit', {parentLocation, location});

    this.socket.on('disconnectedFromExhibitResult', result =>
    {
      const res = result.data;
      const message = result.message;
      this.nativeCommunicationService.sendToNative('Disconnected from Exhibit-' + parentLocation + ': ' + result, 'print');

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }

      if(this.store.getState().isLoggedIn === true)
      {
        this.registerLocation(res.parent, false);
      }

      this.socket.removeAllListeners('disconnectedFromExhibitResult');
    });
  }

  public autoLogin(token: String): void
  {
    this.socket.emit('autoLoginOD', token);

    this.socket.on('autoLoginODResult', result =>
    {

      const data = result.data;
      const message = result.message;

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        this.nativeCommunicationService.sendToNative('getLanguage', 'getLanguage');
        return;
      }

      this.store.dispatch(this.userActions.changeUser(data.user));
      this.store.dispatch(this.userActions.changeLookupTable(data.locations));
      this.store.dispatch(this.userActions.changeToken(data.token));
      this.store.dispatch(this.statusActions.changeLoggedIn(true));
      this.store.dispatch(this.statusActions.changeLanguage(data.user.contentLanguageId));

      this.locationService.setToStartPoint();

      this.router.navigate(['/mainview']).then( () =>
      {
        // send success to native & start beacon scan
        this.nativeCommunicationService.sendToNative('success', 'registerOD');
      });

      this.socket.removeAllListeners('autoLoginODResult');
    });
  }

  public loginOD(data: any): void
  {
    this.socket.emit('loginOD', data);

    this.socket.on('loginODResult', result =>
    {
      const data = result.data;
      const message = result.message;

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        this.alertService.setMessageWrongLoginCheck(true);
        return;
      }
      this.alertService.setMessageWrongLoginCheck(false);
      this.store.dispatch(this.userActions.changeUser(data.user));
      this.store.dispatch(this.userActions.changeLookupTable(data.locations));
      this.store.dispatch(this.userActions.changeToken(data.token));
      this.store.dispatch(this.statusActions.changeLoggedIn(true));
      this.store.dispatch(this.statusActions.changeLanguage(data.user.contentLanguageId));

      this.locationService.setToStartPoint();

      this.router.navigate(['/mainview']).then( () =>
      {
        // send success to native & start beacon scan
        this.nativeCommunicationService.sendToNative('success', 'loginOD');
      });

      this.socket.removeAllListeners('loginODResult');
    });
  }

  public checkUsernameExists(username: String): void
  {
    // console.log('checkUsername');
    this.socket.emit('checkUsernameExists', username);

    this.socket.on('checkUsernameExistsResult', result =>
    {
      // const data = {result: result, bothChecked: bothChecked};
      // this.alertService.sendUsernameRegisterCheckResult(data);
      this.socket.removeAllListeners('checkUsernameExistsResult');
      return result;
    });
  }

  public checkEmailExists(email: String): void
  {
    // console.log('checkEmail');
    this.socket.emit('checkEmailExists', email);

    this.socket.on('checkEmailExistsResult', result =>
    {
      // this.alertService.sendEmailRegisterCheckResult(result);
      this.socket.removeAllListeners('checkEmailExistsResult');
      return result;
    });
  }

  public checkUserOrEmailExists(data: any): void
  {
    this.socket.emit('checkNameOrEmailExists', data);

    this.socket.on('checkNameOrEmailExistsResult', result =>
    {
      this.alertService.sendMessageUserOrEmailRegisterCheck(result);
      this.socket.removeAllListeners('checkNameOrEmailExistsResult');
      return result;
    });
  }

  public getWifi(): void
  {
    this.socket.emit('getWifiSSID');

    this.socket.on('getWifiSSIDResult', result =>
    {
      const ssid = result.data.ssid;
      const password = result.data.password;

      this.nativeCommunicationService.sendToNative({ssid, password},'receiveWifiData');

      this.socket.removeAllListeners('getWifiSSIDResult');
    });
  }

  public updateUserCredentials(data: any){
    this.socket.emit('changeODCredentials', data);

    this.socket.on('changeODCredentialsResult', result =>
    {
      const res = result.data;
      const message = result.message;
      // console.log(message);

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        this.alertService.sendMessageChangedCred(false);
        return;
      }
      this.alertService.sendMessageChangedCred(true);
      this.alertService.sendMessageExistingCredentialsOnChange(false);
      this.store.dispatch(this.userActions.changeUser(res.user));
      this.store.dispatch(this.userActions.changeToken(res.token));

      return result;
    });
  }

  public deleteUserAccount(data){
    this.socket.emit('deleteOD', data);
  }

  public updateUserLanguage(lang: number): any
  {
    const state = this.store.getState();
    const user = state.user;

    this.socket.emit('updateUserLanguage', {language: lang, user: user.id});

    this.socket.on('updateUserLanguageResult', result =>
    {
      const lookuptable = result.data.locations;
      const language = result.data.language;
      const message = result.message;

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        this.nativeCommunicationService.sendToNative('RegisterUserLanguageUpdate: FAILED', 'print');
        return;
      }

      this.store.dispatch(this.statusActions.changeLanguage(language));
      this.store.dispatch(this.userActions.changeLookupTable(lookuptable));

      this.socket.removeAllListeners('updateUserLanguageResult');
    });
  }

    public getCoaColors(): void
  {
    this.socket.emit('getCoaColors');

    this.socket.on('getCoaColorsResult', result =>
    {
      this.alertService.sendMessageCoaColors(result);
      this.socket.removeAllListeners('getCoaColorsResult');
      return result;
    });
  }

  public changeUserCoaColors(data: any): void
  {
    this.socket.emit('changeUserCoaColors', data);

    this.socket.on('changeUserCoaColorsResult', result =>
    {
      const data = result.data;
      const message = result.message;

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }
      this.store.dispatch(this.userActions.changeUser(data));
      this.socket.removeAllListeners('changeUserCoaColorsResult');
      return;
    });
  }

  public unlockCoaPart(data: any): void
  {
    this.socket.emit('unlockCoaPart', data);

    this.socket.on('unlockCoaPartResult', result =>
    {
      this.socket.removeAllListeners('unlockCoaPartResult');
      return;
    });
  }

  public getUserCoaParts(data: any): void
  {
    this.socket.emit('getUserCoaParts', data);

    this.socket.on('getUserCoaPartsResult', result =>
    {
      // console.log(result);
      this.alertService.sendMessageUserCoaParts(result);
      this.socket.removeAllListeners('getUserCoaPartsResult');
      return result;
    });
  }

  public changeUserCoaPart(data: any): void
  {
    // console.log(data);
    this.socket.emit('changeUserCoaPart', data);

    this.socket.on('changeUserCoaPartResult', result =>
    {
      // console.log(result);
      this.alertService.sendMessageUserCoaParts(result);
      this.socket.removeAllListeners('changeUserCoaPartResult');
      return result;
    });
  }

  public getCoaParts(): void
  {
    this.socket.emit('getCoaParts');

    this.socket.on('getCoaPartsResult', result =>
    {
      this.alertService.sendMessageCoaParts(result);
      this.socket.removeAllListeners('getCoaPartsResult');
      return;
    });
  }
}
