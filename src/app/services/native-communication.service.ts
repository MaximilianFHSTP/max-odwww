import {Inject, Injectable, EventEmitter, Output, OnInit} from '@angular/core';
import { GodService } from './god.service';
import {LocationService} from './location.service';
import {LocationActions} from '../actions/LocationActions';
import { UtilitiesService } from './utilities.service';
import {Router} from '@angular/router';
import {UserActions} from '../actions/UserActions';
import { MatDialog} from '@angular/material';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import {AlertService} from './alert.service';

@Injectable()
export class NativeCommunicationService implements OnInit {
  public registerName: string;
  public registerIsGuest: boolean;
  private subscription: Subscription;

  constructor(
    private router: Router,
    private godService: GodService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private utilitiesService: UtilitiesService,
    private userActions: UserActions,
    private dialog: MatDialog,
    private alertService: AlertService
  ) {
    this.subscription = this.alertService.getMessageResponse().subscribe(message => {
      if (message.result === 'confirm'){
        this.godService.registerLocation(message.location, false);

        const lastDis = this.appStore.getState().lastDismissed;
        if (lastDis === message.location )
        {
          this.appStore.dispatch(this.locationActions.changeLastDismissed(undefined));
        }
      }
      else
      {
        this.appStore.dispatch(this.locationActions.changeLastDismissed(message.location));
        this.godService.registerLocation(message.location, true);
      }
      this.utilitiesService.sendToNative('restartScanning','restartScanning');
    });
  }

  ngOnInit() {
  }

  public transmitODRegister(result: any): void
  {
    const deviceAddress: string = result.deviceAddress;
    const deviceOS: string = result.deviceOS;
    const deviceVersion: string = result.deviceVersion;
    const deviceModel: string = result.deviceModel;
    if (this.registerIsGuest)
    {
      const data = {deviceAddress, deviceOS, deviceVersion, deviceModel};
      this.godService.registerODGuest(data);
    }
    else {
      const data = {identifier: this.registerName, deviceAddress, deviceOS, deviceVersion, deviceModel};
      this.godService.registerOD(data);
    }
  }

  public transmitLocationRegister(result: any)
  {
    const state = this.appStore.getState();
    const minor: number = result.minor;
    const location = this.locationService.findLocation(minor);

    if (state.lastDismissed === result.minor) { return; }

    if (!location)
    {
      this.utilitiesService.sendToNative('this is not a valid location', 'print');
      return;
    }

    const currLoc = this.locationService.currentLocation.value;

    // location is not the same as before
    if (!this.locationService.sameAsCurrentLocation(location.id))
    {
      if (this.locationService.currentLocation && currLoc.locationTypeId === 2)
      {
        this.utilitiesService.sendToNative('this is not a valid location - type 2', 'print');
        return;
      }

      const exhibitParentId = state.atExhibitParentId;
      const onExhibit = state.onExhibit;

      this.utilitiesService.sendToNative('new valid location found - check and registerLocation at GoD - ' + location.id, 'print');

      if ((location.locationTypeId !== 2 && !onExhibit) || (location.locationTypeId === 2 && exhibitParentId === location.parentId))
      {
        if (location.locationTypeId === 2)
        {
          this.godService.checkLocationStatus(location.id, res => {
            if (res === 'FREE')
            {
              this.godService.registerLocation(location.id, false);
              this.appStore.dispatch(this.locationActions.changeLocationSocketStatus(res));
            }
            else
            {
              this.appStore.dispatch(this.locationActions.changeLocationSocketStatus(res));
            }
          });
        }
        else
        {
          this.utilitiesService.sendToNative('stopScanning','stopScanning');
          const data = {location: location.id, resStatus: null};

          this.alertService.sendMessageLocationid(data);
          const elm: HTMLElement = document.getElementById('ghostButton') as HTMLElement;
          elm.click();
        }
      }
    }
  }

  public transmitLocationRegisterTableBehavior(): void
  {
    const location = this.locationService.findBehaviorChildLocation();

    if (!location)
    {
      this.utilitiesService.sendToNative('this is not a valid location', 'print');
      return;
    }

    // location is not the same as before
    if (!this.locationService.sameAsCurrentLocation(location.id))
    {

      const state = this.appStore.getState();
      const exhibitParentId = state.atExhibitParentId;

      this.utilitiesService.sendToNative('new valid location found - check and registerLocation at GoD', 'print');

      if (location.locationTypeId === 7 && exhibitParentId === location.parentId)
      {
        this.godService.registerLocation(location.id, false);
      }
    }
  }

  public autoLogin(data): void
  {
    const token: String = data.token;
    this.utilitiesService.sendToNative('Autologin', 'print');

    if (token)
    {
      this.godService.autoLogin(token);
    }
  }

  public transmitShowUnity(): void
  {
    // this.utilitiesService.sendToNative('NativeCommService Show Unity before', 'print');
    this.utilitiesService.sendToNative('showUnityView', 'showUnityView');
    // this.utilitiesService.sendToNative('NativeCommService Show Unity after', 'print');
  }

  public logout(): void
  {
    this.utilitiesService.sendToNative('clearToken', 'clearToken');
  }

  public logoutSuccess(): void
  {
    this.appStore.dispatch(this.userActions.changeToken(undefined));
    this.appStore.dispatch(this.locationActions.changeCurrentLocation(undefined));
    this.appStore.dispatch(this.locationActions.changeLocationStatus(undefined));
    this.appStore.dispatch(this.locationActions.changeLocationSocketStatus(undefined));
    this.appStore.dispatch(this.locationActions.changeConnectedExhibit(undefined));
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(undefined));
    this.appStore.dispatch(this.locationActions.changeOnExhibit(undefined));
    this.appStore.dispatch(this.locationActions.changeLastDismissed(undefined));
    this.router.navigate(['']).then( () =>
    {
      this.utilitiesService.sendToNative('User Logged out', 'print');
    });
  }

  public transmitLocationLike(like: boolean): void
  {
    const currLoc = this.locationService.currentLocation.value;

    if (like) {
      this.utilitiesService.sendToNative('Like location ' + currLoc.name, 'print');
    }
    else {
      this.utilitiesService.sendToNative('Unlike location ' + currLoc.name, 'print');
    }


    this.godService.registerLocationLike(currLoc, like);
  }
}
