import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { appStore } from '../app.module';
import {UserActions} from '../actions/UserActions';

@Injectable()
export class LocationService
{
  private _lookuptable: any;
  private _currentLocation: any;

  public locationChanged: Subject<any> = new Subject<any>();

  constructor(
    @Inject('AppStore') private appStore,
    private userActions: UserActions
  ) { }

  public findLocation(id: number): any
  {
    let toFind: number;

    if (!this._lookuptable) {
      return;
    }

    for (let i = 0; i < this._lookuptable.length; i++)
    {
      const location = this._lookuptable[i];
      if (location.id === id)
      {
        toFind = location;
      }
    }
    return toFind;
  }

  public updateCurrentLocation(id: number)
  {
    const location = this.findLocation(id);
    this._currentLocation = location;
    this.locationChanged.next(this._currentLocation);
  }

  public sameAsCurrentLocation(id: number): boolean
  {
    let isSame = false;

    if (this._currentLocation){
      if (id === this._currentLocation.id){
        isSame = true;
      }
    }

    return isSame;
  }

  get lookuptable(): any
  {
    return this._lookuptable;
  }

  set lookuptable(locations: any)
  {
    this._lookuptable = locations;
  }

  get currentLocation(): any
  {
    return this._currentLocation;
  }

  set currentLocation(location: any)
  {
    this._currentLocation = location;
  }
}
