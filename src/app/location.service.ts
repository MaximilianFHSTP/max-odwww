import { Injectable } from '@angular/core';

@Injectable()
export class LocationService
{
  private _lookuptable: any;
  private _currentLocation: any;
  private _status: string;

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

  get status(): string
  {
    return this._status;
  }

  set status(status: string)
  {
    this._status = status;
  }
}
