import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../WindowRef';
import {LocationService} from './location.service';
import {ExhibitSocketService} from './exhibit-socket.service';
import {GodService} from './god.service';
import {LocationActions} from '../actions/LocationActions';
import {UserActions} from '../actions/UserActions';
import { UtilitiesService } from '../services/utilities.service';

@Injectable()
export class ExhibitService {

  constructor(
    private router: Router,
    private winRef: WindowRef,
    private locationService: LocationService,
    private socket: ExhibitSocketService,
    private socketGod: GodService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private userActions: UserActions,
    private utilitiesService: UtilitiesService 
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

    const state = this.appStore.getState();
    const user = state.user;
    const location = this.locationService.currentLocation;

    if (!user) {
      return;
    }

    this.socket.connection.emit('connectOD', {user, location});

    this.socket.connection.on('connectODResult', result =>
    {
      this.utilitiesService.sendToNative(result, 'print');
      this.socket.connection.removeAllListeners('connectODResult');
      this.startAutoResponder();
    });
  }

  private startAutoResponder()
  {
    this.socket.connection.on('exhibitStatusCheck', () => {
      const user = this.appStore.getState().user;
      this.socket.connection.emit('exhibitStatusCheckResult', user);
    });
  }

  public disconnect()
  {

    const state = this.appStore.getState();
    const user = state.user;

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
      this.socket.connection.removeAllListeners('exhibitStatusCheck');
    });

  }
}
