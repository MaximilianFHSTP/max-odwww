import { Injectable } from '@angular/core';

@Injectable()
export class LocationService
{
  private _lookuptable: any;
  private _currentLocation: any;
  private _status: any;

  constructor() { }

  public findLocation(id: number): any
  {
    let toFind: number;

    if (!this._lookuptable) {
      return toFind;
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
  }

  public sameAsCurrentLocation(id: number): boolean
  {
    let isSame = false;

    if(this._currentLocation){
      if(id == this._currentLocation.id){
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

  get status(): any
  {
    return this._status;
  }

  set status(status: any)
  {
    this._status = status;
  }
}
