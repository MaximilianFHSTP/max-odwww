import {Inject, Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../WindowRef';
import {LocationService} from './location.service';
import {GodSocketService} from './god-socket.service';
import {LocationActions} from '../actions/LocationActions';

@Injectable()
export class GodService {

  constructor(
    private router: Router,
    private winRef: WindowRef,
    private locationService: LocationService,
    private socket: GodSocketService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions
  )
  {
    this.socket.on('news', msg =>
    {
      console.log(msg);
    });
  }

  public registerOD(data: any, isIOS: boolean, isAndroid: boolean, isWeb: boolean): any
  {
    this.socket.emit('registerOD', data);

    this.socket.on('registerODResult', result =>
    {
      // console.log(result.user);
      console.log(result);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('lookuptable', JSON.stringify(result.locations));
      this.locationService.lookuptable = result.locations;

      this.router.navigate(['/mainview']).then( () =>
      {
        // send success to native & start beacon scan
        // TODO: switch für iOS & Android
      if (isIOS){
        this.winRef.nativeWindow.webkit.messageHandlers.registerOD.postMessage('success');
      }else if (isAndroid){
        this.winRef.nativeWindow.MEETeUXAndroidAppRoot.registerOD();
      }
      });

      this.socket.removeAllListeners('registerODResult');
    });
  }

  public registerLocation(id: number): any
  {
    const user = JSON.parse(localStorage.getItem('user'));
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
      this.router.navigate([this.locationService.currentLocation.contentURL]);

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
