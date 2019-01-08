import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import {LocationService} from '../location.service';
import {ExhibitSocketService} from './exhibit-socket.service';
import {GodService} from '../god/god.service';
import {LocationActions} from '../../store/actions/LocationActions';
import {UserActions} from '../../store/actions/UserActions';
import { NativeCommunicationService } from '../native/native-communication.service';
import {StatusActions} from '../../store/actions/StatusActions';
import * as SuccessTypes from '../../config/SuccessTypes';
import * as ErrorTypes from '../../config/ErrorTypes';

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
    private statusActions: StatusActions,
    private utilitiesService: NativeCommunicationService
  )
  {}

  public establishExhibitConnection(url: string ): void
  {
    // console.log(url);
    // const localURL = 'http://localhost:8100/';
    this.socket.openNewExhibitConnection(url);

    // this.socket.openNewExhibitConnection(url);

    this.socket.connection.on('connected', () =>
    {
      this.appStore.dispatch(this.locationActions.changeConnectedExhibit(true));

      const state = this.appStore.getState();
      if(state.successMessage && state.successMessage.code === SuccessTypes.SUCCESS_DISCONNECTED_FROM_EXHIBIT)
      {
        this.appStore.dispatch(this.statusActions.changeSuccessMessage(undefined));
      }
    });

    this.socket.connection.on('reconnect', () =>
    {
      this.connectOD();
    });

    this.socket.connection.on('disconnect', () => {
      // const error: Message = {code: ErrorTypes.LOST_CONNECTION_TO_EXHIBIT, message: 'Lost connection to Exhibit'};
      // this.appStore.dispatch(this.statusActions.changeErrorMessage(error));

      const currLoc = this.locationService.currentLocation.value;

      const state = this.appStore.getState();

      if((!state.successMessage) || (state.successMessage && state.successMessage.code !==
        SuccessTypes.SUCCESS_DISCONNECTED_FROM_EXHIBIT))
      {
        const errorMessage = {message:'You were disconnected from the Exhibit', code: ErrorTypes.LOST_CONNECTION_TO_EXHIBIT};
        this.appStore.dispatch(this.statusActions.changeErrorMessage(errorMessage));
      }

      if(currLoc)
      {
        this.socketGod.disconnectedFromExhibit(currLoc.parentId, currLoc.id);
        this.appStore.dispatch(this.locationActions.changeConnectedExhibit(false));
        this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(0));
        this.appStore.dispatch(this.locationActions.changeOnExhibit(false));
      }
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
      if(result === 'SUCCESS')
      {
        this.socket.connection.removeAllListeners('connectODResult');
        this.startAutoResponder();
      }
      else {
        this.socket.connection.disconnect();
      }
    });
  }

  private startAutoResponder()
  {
    this.socket.connection.on('exhibitStatusCheck', () => {
      console.log('AutoResponderCheck');
      this.utilitiesService.sendToNative('AutoResponderCheck', 'print');
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
        this.appStore.dispatch(this.statusActions.changeSuccessMessage({message: 'You decided to quit',
          code: SuccessTypes.SUCCESS_DISCONNECTED_FROM_EXHIBIT}));

        this.socket.connection.disconnect();

        this.appStore.dispatch(this.locationActions.changeConnectedExhibit(false));

        // const currLoc = this.locationService.currentLocation.value;

        // this.socketGod.disconnectedFromExhibit(currLoc.parentId, currLoc.id);
      }

      this.socket.connection.removeAllListeners('closeConnectionResult');
      this.socket.connection.removeAllListeners('exhibitStatusCheck');
    });
  }
}
