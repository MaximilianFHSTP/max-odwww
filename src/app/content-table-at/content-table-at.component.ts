import { Component, OnInit, OnDestroy } from '@angular/core';
import { GodService } from '../god.service';
import {LocationService} from '../location.service';
//import {Observable} from 'rxjs/Rx';

@Component({
  selector: 'app-content-table-at',
  templateUrl: './content-table-at.component.html',
  styleUrls: ['./content-table-at.component.css']
})
export class ContentTableAtComponent implements OnInit, OnDestroy {
  private location: any;
  private locationName: string;
  private locationId: any;
  private locationStatusFree: boolean;
  private checkStatusTimer: any;

  constructor(
    private godService: GodService,
    private locationService: LocationService
  ) { }

  ngOnInit() {
    // TODO: get current Location from LocationService
    this.location = this.locationService.currentLocation;
    this.locationName = this.location.description;
    this.locationId = this.location.id;
    this.locationStatusFree = false;


    this.godService.checkLocationStatus(this.locationId);

    /*// Timer starts after 1sec, repeats every 5sec
    this.checkStatusTimer = Rx.Observable.timer(1000, 5000);
    this.checkStatusTimer.subscribe(
      // set timer for checking LocationStatus --> need locationID
      this.checkLocationStatus(this.locationId)
    );*/
  }

  ngOnDestroy() {
    // Stop the timer
    //this.checkStatusTimer.unsubscribe();
  }

  checkLocationStatus(data: any){
    this.godService.checkLocationStatus(data);
  }

  requestLocationStatus(){
    this.checkLocationStatus(this.locationId);
    if(this.locationService.status == "FREE"){
      this.locationStatusFree = true;
    }
  }
}
