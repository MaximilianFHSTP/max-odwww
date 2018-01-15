import {Inject, Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../WindowRef';
import {LocationService} from './location.service';
import {GodSocketService} from './god-socket.service';
import {LocationActions} from '../actions/LocationActions';
import {UserActions} from '../actions/UserActions';

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

  // TODO: change - get Infos about platform from central store
  public registerOD(data: any, isIOS: boolean, isAndroid: boolean, isWeb: boolean): any
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

      this.router.navigate(['/mainview']).then( () =>
        {
          // send success to native & start beacon scan
          if (isIOS)
          {
            this.winRef.nativeWindow.webkit.messageHandlers.registerOD.postMessage('success');
          }
          else if (isAndroid)
          {
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.registerOD();
          }
        }
      );

      this.socket.removeAllListeners('registerODResult');
    });
  }

  // TODO: change - get Infos about platform from central store
  public registerLocation(id: number, isIOS: boolean, isAndroid: boolean, isWeb: boolean): any
  {
    const state = this.appStore.getState();
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
      
      this.router.navigate([this.locationService.currentLocation.contentURL]).then( () =>
      {
        // send success to native & trigger signal
        if (isIOS)
        {
          this.winRef.nativeWindow.webkit.messageHandlers.triggerSignal.postMessage('success');
        }
        else if (isAndroid)
        {
          this.winRef.nativeWindow.MEETeUXAndroidAppRoot.triggerSignal();
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

      // TODO: set parent location not possible
      // this.registerLocation(parentLocation);

      this.socket.removeAllListeners('disconnectedFromExhibitResult');
    });
  }
}
