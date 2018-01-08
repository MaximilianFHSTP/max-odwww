import { Component, OnInit } from '@angular/core';
import { LocationService } from '../services/location.service';

@Component(
  {
  selector: 'app-content-passive',
  templateUrl: './content-passive.component.html',
  styleUrls: ['./content-passive.component.css']
  }
)
export class ContentPassiveComponent implements OnInit
{
  private _location: any;
  private locationName: string;
  private locationId: any;

  constructor(
    private locationService: LocationService
  ) { }

  ngOnInit()
  {
    this._location = this.locationService.currentLocation
    this.locationName = this._location.description
    this.locationId = this._location.id
    
    this.locationService.locationChanged.subscribe(value =>
      {
      this._location = value;
      this.locationName = this._location.description;
      this.locationId = this._location.id;
      }
    );
  }
}
