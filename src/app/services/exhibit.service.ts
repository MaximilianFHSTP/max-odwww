import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../WindowRef';
import {LocationService} from './location.service';
import {ExhibitSocketService} from './exhibit-socket.service';
import {GodService} from './god.service';

@Injectable()
export class ExhibitService {

  constructor(
    private router: Router,
    private winRef: WindowRef,
    private locationService: LocationService,
    private socket: ExhibitSocketService,
    private socketGod: GodService
  )
  {}

  public establishExhibitConnection(url: string ): void
  {
    this.socket.openNewExhibitConnection(url);
  }

  public connectOD(): any
  {
    const user = localStorage.getItem('user');

    if (!user) {
      return;
    }

    this.socket.connection.emit('connectOD', user);

    this.socket.connection.on('connectODResult', result =>
    {
      console.log(result);
    });
  }

  public disconnect()
  {
    const user = JSON.parse(localStorage.getItem('user'));
    this.socket.connection.emit('closeConnection', user);

    this.socket.connection.on('closeConnectionResult', result =>
    {
      console.log(result);
      if (result === 'SUCCESS')
      {
        this.socket.connection.disconnect();

        this.socketGod.disconnectedFromExhibit(this.locationService.currentLocation.parentId);
      }
    });
  }
}
