import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import { LocationService } from '../services/location.service';
import {Unsubscribe} from 'redux';

@Component(
  {
  selector: 'app-content-passive',
  templateUrl: './content-passive.component.html',
  styleUrls: ['./content-passive.component.css']
  }
)
export class ContentPassiveComponent implements OnInit, OnDestroy
{
  private _location: any;
  private locationName: string;
  private locationId: any;
  private _unsubscribe: Unsubscribe;

  constructor(
    private locationService: LocationService,
    @Inject('AppStore') private appStore
  ) {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      this.updateLocationInformation(state.currentLocation);
    });
  }

  ngOnInit()
  {
    const state = this.appStore.getState();
    this.updateLocationInformation(state.currentLocation);
  }

  updateLocationInformation(value)
  {
    this._location = value;
    this.locationName = this._location.description;
    this.locationId = this._location.id;
  }

  ngOnDestroy() {
    this._unsubscribe();
  }
}
