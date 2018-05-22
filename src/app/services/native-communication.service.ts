import {Inject, Injectable} from '@angular/core';
import { GodService } from './god.service';
import {LocationService} from './location.service';
import {LocationActions} from '../actions/LocationActions';
import { UtilitiesService } from './utilities.service';
import {Router} from '@angular/router';
import {UserActions} from '../actions/UserActions';

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
    private userActions: UserActions
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

    // location is not the same as before
    if (!this.locationService.sameAsCurrentLocation(location.id))
    {
      if (this.locationService.currentLocation && this.locationService.currentLocation.locationTypeId === 2)
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
              this.godService.registerLocation(location.id);
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
          this.godService.registerLocation(location.id);
        }
      }
    }
  }

  public autoLogin(data): void
  {
    const token: String = data.token;
    this.utilitiesService.sendToNative('Autlogin', 'print');

    if (token)
    {
      this.godService.autoLogin(token);
    }
  }

  public logout(): void
  {
    this.utilitiesService.sendToNative('clearToken', 'clearToken');
  }

  public logoutSuccess(): void
  {
    this.appStore.dispatch(this.userActions.changeToken(undefined));
    this.router.navigate(['']).then( () =>
    {
      this.utilitiesService.sendToNative('User Logged out', 'print');
    });
  }
}
