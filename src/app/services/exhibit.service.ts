import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../WindowRef';
import {LocationService} from './location.service';
import {ExhibitSocketService} from './exhibit-socket.service';
import {GodService} from './god.service';
import {LocationActions} from '../actions/LocationActions';
import {UserActions} from '../actions/UserActions';
import { UtilitiesService } from '../services/utilities.service';
import {NativeCommunicationService} from './native-communication.service';

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
    private utilitiesService: UtilitiesService,
    private nativeCommunicationService: NativeCommunicationService
  )
  {}

  public establishExhibitConnection(url: string ): void
  {
    // console.log(url);
    const localURL = 'http://localhost:8100/';
    this.socket.openNewExhibitConnection(localURL);

    // this.socket.openNewExhibitConnection(url);

    this.socket.connection.on('connected', () => {
      this.appStore.dispatch(this.locationActions.changeConnectedExhibit(true));
    });
  }

  public connectOD(): any
  {

    const state = this.appStore.getState();
    const user = state.user;
    const location = this.locationService.currentLocation.value;

    if (!user) {
      return;
    }

    this.socket.connection.emit('connectOD', {user, location});

    this.socket.connection.on('connectODResult', result =>
    {
      this.utilitiesService.sendToNative(result, 'print');
      this.socket.connection.removeAllListeners('connectODResult');
      this.startAutoResponder();
      this.nativeCommunicationService.transmitShowUnity();
    });
  }

  private startAutoResponder()
  {
    this.socket.connection.on('exhibitStatusCheck', () => {
      console.log('Auto Responder Check');
      const user = this.appStore.getState().user;
      this.socket.connection.emit('exhibitStatusCheckResult', user);
    });
  }

  public sendMessage()
  {
    const user = this.appStore.getState().user;
    this.socket.connection.emit('sendMessage', {user, message: 'Na'});
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

        const currLoc = this.locationService.currentLocation.value;

        this.socketGod.disconnectedFromExhibit(currLoc.parentId, currLoc.id);
      }

      this.socket.connection.removeAllListeners('closeConnectionResult');
      this.socket.connection.removeAllListeners('exhibitStatusCheck');
    });

  }
}
