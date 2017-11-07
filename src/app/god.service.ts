import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';
import { WindowRef } from './WindowRef';

@Injectable()
export class GodService {

  constructor(
    private socket: Socket,
    private router: Router,
    private winRef: WindowRef
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
      //console.log(result.user);
      //console.log(result.locations);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('lookuptable', JSON.stringify(result.locations));

      this.router.navigate(['/mainview']);


      // send success to native & start beacon scan
      // TODO: switch für iOS & Android
      this.winRef.nativeWindow.webkit.messageHandlers.registerOD.postMessage("success");
    });
  }

  public checkLocationStatus(data: any): any
  {
    this.socket.emit('checkLocationStatus', data);

    this.socket.on('checkLocationStatusResult', result =>
    {
      console.log(result);
      // TODO: update locationStatus in LocationService
    });
  }
}
