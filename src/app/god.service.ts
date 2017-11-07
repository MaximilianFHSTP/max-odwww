import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';
import { WindowRef } from './WindowRef';
import {LocationService} from './location.service';

@Injectable()
export class GodService {

  constructor(
    private socket: Socket,
    private router: Router,
    private winRef: WindowRef,
    private locationService: LocationService
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
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('lookuptable', JSON.stringify(result.locations));
      this.locationService.lookuptable = result.locations;

      this.router.navigate(['/mainview']).then( () =>
      {
        // send success to native & start beacon scan
        // TODO: switch für iOS & Android
        this.winRef.nativeWindow.webkit.messageHandlers.registerOD.postMessage('success');
      });
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
      // console.log(this.locationService.currentLocation.contentURL);
      this.router.navigate([this.locationService.currentLocation.contentURL]);
    });
  }

  public checkLocationStatus(data: any): any
  {
    this.socket.emit('checkLocationStatus', data);

    return this.socket.on('checkLocationStatusResult', result =>
    {
      console.log(result);
      // this.locationService.status(result);
    });
  }
}
