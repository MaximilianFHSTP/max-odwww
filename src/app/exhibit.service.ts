import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from './WindowRef';
import {LocationService} from './location.service';
import {ExhibitSocketService} from './exhibit-socket.service';

@Injectable()
export class ExhibitService {

  constructor(
    private router: Router,
    private winRef: WindowRef,
    private locationService: LocationService,
    private socket: ExhibitSocketService
  )
  {}

  public connectOD(): any
  {
    const user = localStorage.getItem('user');

    if (!user) {
      return;
    }

    this.socket.emit('connectOD', user);

    this.socket.on('connectODResult', result =>
    {
      console.log(result);
    });
  }

  public disconnect()
  {
    // TODO
  }
}
