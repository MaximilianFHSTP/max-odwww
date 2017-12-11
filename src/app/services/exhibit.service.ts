import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../WindowRef';
import {LocationService} from './location.service';
import {ExhibitSocketService} from './exhibit-socket.service';
import {GodService} from './god.service';
import {LocationActions} from '../actions/LocationActions';

@Injectable()
export class ExhibitService {

  constructor(
    private router: Router,
    private winRef: WindowRef,
    private locationService: LocationService,
    private socket: ExhibitSocketService,
    private socketGod: GodService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions
  )
  {}

  public establishExhibitConnection(url: string ): void
  {
    this.socket.openNewExhibitConnection(url);

    this.socket.connection.on('connected', () => {
      this.appStore.dispatch(this.locationActions.changeConnectedExhibit(true));
    });
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

      this.socket.connection.removeAllListeners('connectODResult');
    });
  }

  public disconnect()
  {
    const user = JSON.parse(localStorage.getItem('user'));
    this.socket.connection.emit('closeConnection', user);

    this.socket.connection.on('closeConnectionResult', result =>
    {
      if (result === 'SUCCESS')
      {
        this.socket.connection.disconnect();

        this.appStore.dispatch(this.locationActions.changeConnectedExhibit(false));

        this.socketGod.disconnectedFromExhibit(this.locationService.currentLocation.parentId, this.locationService.currentLocation.id);
      }

      this.socket.connection.removeAllListeners('closeConnectionResult');
    });

  }
}
