import {Inject, Injectable} from '@angular/core';
import { GodService } from './god.service';
import {LocationService} from './location.service';
import {LocationActions} from '../actions/LocationActions';
import { UtilitiesService } from './utilities.service';
import {Router} from '@angular/router';
import {UserActions} from '../actions/UserActions';
import { MatDialog} from '@angular/material';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';

@Injectable()
export class NativeCommunicationService {
  public registerName: string;
  public registerIsGuest: boolean;

  constructor(
    private router: Router,
    private godService: GodService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private utilitiesService: UtilitiesService,
    private userActions: UserActions,
    private dialog: MatDialog
  ) {}

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
    const minor: number = result.minor;
    const location = this.locationService.findLocation(minor);

    if (!location)
    {
      this.utilitiesService.sendToNative('this is not a valid location', 'print');
      return;
    }

    const currLoc = this.locationService.currentLocation.value;
    console.log(this.locationService.currentLocation);

    // location is not the same as before
    if (!this.locationService.sameAsCurrentLocation(location.id))
    {
      if (this.locationService.currentLocation && currLoc.locationTypeId === 2)
      {
        this.utilitiesService.sendToNative('this is not a valid location - type 2', 'print');
        return;
      }

      const state = this.appStore.getState();
      const exhibitParentId = state.atExhibitParentId;
      const onExhibit = state.onExhibit;

      this.utilitiesService.sendToNative('new valid location found - check and registerLocation at GoD', 'print');

      if ((location.locationTypeId !== 2 && !onExhibit) || (location.locationTypeId === 2 && exhibitParentId === location.parentId))
      {
        if (location.locationTypeId === 2)
        {
          this.godService.checkLocationStatus(location.id, res => {
            if (res === 'FREE')
            {
              console.log("I am free");
              this.utilitiesService.sendToNative('stopScanning','stopScanning');
              let dialogRef = this.dialog.open(AlertDialogComponent);
              console.log(this.dialog.openDialogs);
              dialogRef.afterClosed().subscribe(result => {
                console.log('Result: ', result);
                if (result == 'confirm'){
                  this.godService.registerLocation(location.id);
                  this.appStore.dispatch(this.locationActions.changeLocationSocketStatus(res));
                }
                this.utilitiesService.sendToNative('restartScanning','restartScanning');
              })
            }
            else
            {
              this.appStore.dispatch(this.locationActions.changeLocationSocketStatus(res));
            }
          });
        }
        else
        {
          console.log("I am else");
          this.utilitiesService.sendToNative('stopScanning','stopScanning');
          let dialogRef = this.dialog.open(AlertDialogComponent);
          console.log(this.dialog.openDialogs);
          dialogRef.afterClosed().subscribe(result => {
            console.log('Result: ', result);
            if (result == 'confirm'){
              this.godService.registerLocation(location.id);
            }
            this.utilitiesService.sendToNative('restartScanning','restartScanning');
          })
        }
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
    this.appStore.dispatch(this.locationActions);
    this.router.navigate(['']).then( () =>
    {
      this.utilitiesService.sendToNative('User Logged out', 'print');
    });
  }
}
