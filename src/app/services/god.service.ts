import {Inject, Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../WindowRef';
import {LocationService} from './location.service';
import {GodSocketService} from './god-socket.service';
import {LocationActions} from '../actions/LocationActions';
import {UserActions} from '../actions/UserActions';
import { appStore } from '../app.module';

@Injectable()
export class GodService {

  constructor(
    private router: Router,
    private winRef: WindowRef,
    private locationService: LocationService,
    private socket: GodSocketService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private userActions: UserActions
  )
  {
    this.socket.on('news', msg =>
    {
      console.log(msg);
    });
  }

  public registerOD(data: any): any
  {
    this.socket.emit('registerOD', data);

    this.socket.on('registerODResult', result =>
    {
      // console.log(result.user);
      console.log(result);
      
      //TODO: store lookuptable in store
      this.appStore.dispatch(this.userActions.changeUser(result.user));
      localStorage.setItem('lookuptable', JSON.stringify(result.locations));
      this.locationService.lookuptable = result.locations;

      const state = this.appStore.getState();
      const platform = state.platform;

      this.router.navigate(['/mainview']).then( () =>
        {
          // send success to native & start beacon scan
          switch (platform) {
            case 'IOS':
              this.winRef.nativeWindow.webkit.messageHandlers.registerOD.postMessage('success');
            break;

            case 'Android':
              this.winRef.nativeWindow.MEETeUXAndroidAppRoot.registerOD();
            break;
      
            default:
              break;
          }
        }
      );

      this.socket.removeAllListeners('registerODResult');
    });
  }

  public registerLocation(id: number): any
  {
    let state = this.appStore.getState();
    const user = state.user;
    this.socket.emit('registerLocation', {location: id, user: user.id});

    this.socket.on('registerLocationResult', registeredLocation =>
    {
      // console.log(registeredLocation);
      if (registeredLocation === 'FAILED')
      {
        console.log('RegisterLocation: FAILED');
        return;
      }

      this.locationService.updateCurrentLocation(registeredLocation);
      console.log(this.locationService.currentLocation);
      
      state = this.appStore.getState();
      const platform = state.platform;

      this.router.navigate([this.locationService.currentLocation.contentURL]).then( () =>
      {
        // send success to native & trigger signal
        switch (platform) {
          case 'IOS':
          this.winRef.nativeWindow.webkit.messageHandlers.triggerSignal.postMessage('success');
          break;

          case 'Android':
          this.winRef.nativeWindow.MEETeUXAndroidAppRoot.triggerSignal();
          break;
    
          default:
            break;
        }
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
      if (result === 'FAILED')
      {
        return;
      }
      const location = this.locationService.findLocation(data);

      if (location.locationTypeId !== 2) {
        this.appStore.dispatch(this.locationActions.changeLocationStatus(result));
      }

      if (callback != null)
      {
        callback(result);
      }

      this.socket.removeAllListeners('checkLocationStatusResult');
    });
  }

  public disconnectedFromExhibit(parentLocation, location): void
  {
    this.socket.emit('disconnectedFromExhibit', {parentLocation, location});

    this.socket.on('disconnectedFromExhibitResult', result =>
    {
      console.log('Disconnected from Exhibit-' + parentLocation + ': ' + result);

      this.registerLocation(parentLocation);

      this.socket.removeAllListeners('disconnectedFromExhibitResult');
    });
  }
}
