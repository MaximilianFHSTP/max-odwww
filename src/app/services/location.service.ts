import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {LocationActions} from '../store/actions/LocationActions';
import * as locationTypes from '../config/LocationTypes';

@Injectable()
export class LocationService
{
  private _lookuptable: any;
  private readonly _currentLocation: BehaviorSubject<any>;
  private _lastSection: number;

  constructor(
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions
  ) {
    this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      this._currentLocation.next(state.currentLocation);
      this._lookuptable = state.lookupTable;
    });

    this._currentLocation = new BehaviorSubject<any>(undefined);
  }

  public setLastSection(sectionId: number){
    this._lastSection = sectionId;
  }

  public getLastSection(){
    return this._lastSection;
  }

  public isActiveLocationInRange(locationId: number): boolean
  {
    const nearestLoc = this.findLocation(locationId);
    return nearestLoc.id === this._currentLocation || nearestLoc.parentId === this._currentLocation;
  }

  public getTimelineLocations():any
  {
    const timelineLocations = [];
    for (let i = 0; i < this._lookuptable.length; i++)
    {
      const location = this._lookuptable[i];
      if (location.showInTimeline)
      {
        timelineLocations.push(location);
      }
    }
    return timelineLocations;
  }

  public findLocation(id: Number): any
  {
    let toFind: any;

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

  public findBehaviorChildLocation(): any
  {
    let toFind: any;
    const currLoc = this._currentLocation.value;

    if (!this._lookuptable) {
      return;
    }

    for (let i = 0; i < this._lookuptable.length; i++)
    {
      const location = this._lookuptable[i];
      if (location.parentId === currLoc.id)
      {
        toFind = location;
      }
    }
    return toFind;
  }

  public findStartLocation(): any
  {
    let toFind: number;

    if (!this._lookuptable) {
      return;
    }

    for (let i = 0; i < this._lookuptable.length; i++)
    {
      const location = this._lookuptable[i];
      if (location.isStartPoint)
      {
        toFind = location;
      }
    }
    return toFind;
  }

  public setToStartPoint(): void
  {
    const startPoint = this.findStartLocation();
    this.appStore.dispatch(this.locationActions.changeCurrentLocation(startPoint));
  }

  public updateCurrentLocation(locationId: Number)
  {
    const loc = this.findLocation(locationId);
    this.appStore.dispatch(this.locationActions.changeCurrentLocation(loc));
  }

  public sameAsCurrentLocation(id: number): boolean
  {
    let isSame = false;
    const currLoc = this._currentLocation.value;
    if (currLoc){
      if (id === currLoc.id){
        isSame = true;
      }
    }

    return isSame;
  }

  public stopLocationScanning(): void
  {
    this.appStore.dispatch(this.locationActions.changeLocationScanning(false));
  }

  public startLocationScanning(): void
  {
    this.appStore.dispatch(this.locationActions.changeLocationScanning(true));
  }

  get lookuptable(): any
  {
    return this._lookuptable;
  }

  set lookuptable(locations: any)
  {
    this._lookuptable = locations;
  }

  get currentLocation(): BehaviorSubject<any>
  {
    return this._currentLocation;
  }
}
