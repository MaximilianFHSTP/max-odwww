import {Inject, Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../WindowRef';
import {LocationService} from './location.service';
import {GodSocketService} from './god-socket.service';
import {LocationActions} from '../actions/LocationActions';
import {UserActions} from '../actions/UserActions';
import {StatusActions} from '../actions/StatusActions';
import { appStore } from '../app.module';
import { UtilitiesService } from './utilities.service';
import {NativeCommunicationService} from './native-communication.service';

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
    private utilitiesService: UtilitiesService
  )
  {
    this.socket.on('news', msg =>
    {
      this.utilitiesService.sendToNative(msg, 'print');
    });
  }

  public registerOD(data: any): any
  {
    this.socket.emit('registerOD', data);

    this.socket.on('registerODResult', result =>
    {
      this.utilitiesService.sendToNative(result, 'print');
      const res = result.data;
      const message = result.message;
      // this.nativeCommunicationService.sendToNative(result, 'print');

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }

      this.store.dispatch(this.userActions.changeUser(res.user));
      this.store.dispatch(this.userActions.changeLookupTable(res.locations));
      this.store.dispatch(this.userActions.changeToken(res.token));
      this.locationService.lookuptable = res.locations;

      const state = this.store.getState();
      const platform = state.platform;

      this.router.navigate(['/mainview']).then( () =>
        {
          // send success to native & start beacon scan
          this.utilitiesService.sendToNative('success', 'registerOD');

          /*
          switch (platform) {
            case 'IOS':
              this.winRef.nativeWindow.webkit.messageHandlers.registerOD.postMessage('success');
            break;

            case 'Android':
              this.winRef.nativeWindow.MEETeUXAndroidAppRoot.registerOD();
            break;

            default:
              break;
          }*/
        }
      );

      this.socket.removeAllListeners('registerODResult');
    });
  }

  public registerODGuest(data: any): any
  {
    this.socket.emit('registerODGuest', data);

    this.socket.on('registerODResult', result =>
    {
      const res = result.data;
      const message = result.message;
      // this.nativeCommunicationService.sendToNative(result, 'print');

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }

      this.store.dispatch(this.userActions.changeUser(res.user));
      this.store.dispatch(this.userActions.changeLookupTable(res.locations));
      this.store.dispatch(this.userActions.changeToken(res.token));
      this.locationService.lookuptable = res.locations;

      const state = this.store.getState();
      const platform = state.platform;

      this.router.navigate(['/mainview']).then( () =>
        {
          // send success to native & start beacon scan

          // this.nativeCommunicationService.sendToNative('success', 'registerOD');
          this.utilitiesService.sendToNative('success', 'registerOD');
          /*
          switch (platform) {
            case 'IOS':
              this.winRef.nativeWindow.webkit.messageHandlers.registerOD.postMessage('success');
              break;

            case 'Android':
              this.winRef.nativeWindow.MEETeUXAndroidAppRoot.registerOD();
              break;

            default:
              break;
          }*/
        }
      );

      this.socket.removeAllListeners('registerODResult');
    });
  }

  public registerLocation(id: number): any
  {
    let state = this.store.getState();
    const user = state.user;
    this.socket.emit('registerLocation', {location: id, user: user.id});

    this.socket.on('registerLocationResult', result =>
    {
      const res = result.data;
      const message = result.message;

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        this.utilitiesService.sendToNative('RegisterLocation: FAILED', 'print');
        return;
      }

      this.locationService.updateCurrentLocation(res);
      this.utilitiesService.sendToNative(this.locationService.currentLocation, 'print');
      state = this.store.getState();
      const platform = state.platform;

      this.router.navigate([this.locationService.currentLocation.contentURL]).then( () =>
      {
        // send success to native & trigger signal
        this.utilitiesService.sendToNative('success', 'triggerSignal');
      }
    );

      this.socket.removeAllListeners('registerLocationResult');
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
        console.log('RegisterLocation: FAILED');
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }

      const location = this.locationService.findLocation(res.location);

      if (location.locationTypeId !== 2) {
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
      this.utilitiesService.sendToNative('Disconnected from Exhibit-' + parentLocation + ': ' + result, 'print');

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }

      // console.log('Disconnected from Exhibit-' + res.parent + ': ' + res.location);

      this.registerLocation(res.parent);

      this.socket.removeAllListeners('disconnectedFromExhibitResult');
    });
  }

  public autoLogin(token: String): void
  {
    this.socket.emit('autoLoginOD', token);

    this.socket.on('autoLoginODResult', result =>
    {
      // console.log('---------------------- AutoLoginODResult -----------------------------');
      // console.log(result);

      const data = result.data;
      const message = result.message;

      if (message.code > 299)
      {
        this.store.dispatch(this.statusActions.changeErrorMessage(message));
        return;
      }

      this.store.dispatch(this.userActions.changeUser(data.user));
      this.store.dispatch(this.userActions.changeLookupTable(data.locations));
      this.store.dispatch(this.userActions.changeToken(data.token));
      this.locationService.lookuptable = data.locations;

      const state = this.store.getState();
      const platform = state.platform;

      this.router.navigate(['/mainview']).then( () =>
      {
        // send success to native & start beacon scan

        this.utilitiesService.sendToNative('success', 'registerOD');
      });

      this.socket.removeAllListeners('autoLoginODResult');
    });
  }
}
