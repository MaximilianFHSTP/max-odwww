import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import { GodService } from '../services/god.service';
import {LocationService} from '../services/location.service';
import { Router } from '@angular/router';
import {NativeCommunicationService} from '../services/native-communication.service';
import {Unsubscribe} from 'redux';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {LocationActions} from '../actions/LocationActions';
import { UtilitiesService } from '../services/utilities.service';

@Component({
  selector: 'app-content-table-at',
  templateUrl: './content-table-at.component.html',
  styleUrls: ['./content-table-at.component.css']
})
export class ContentTableAtComponent implements OnInit, OnDestroy {

  // location data
  private location: any;
  public locationName: string;
  private locationId: number;
  public locationStatusFree: boolean;
  public locationStatusOccupied: boolean;
  public locationType: number;

  private checkStatusTimer: any;
  public isWeb: boolean;
  public joinGame: boolean;
  public locationSocketStatus: undefined;

  private readonly _unsubscribe: Unsubscribe;
  private _statusTimerSubscription;

  constructor(
    private godService: GodService,
    private router: Router,
    private locationService: LocationService,
    private nativeCommunicationService: NativeCommunicationService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private utilitiesService: UtilitiesService
  ) {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      this.updateLocationStatus(state.locationStatus);
      this.locationSocketStatus = state.locationSocketStatus;
    });
  }

  ngOnInit() {
    this.utilitiesService.sendToNative('TABLE-AT', 'print');

    this.location = this.locationService.currentLocation.value;
    this.locationName = this.location.description;
    this.locationId = this.location.id;
    this.locationStatusFree = false;
    this.locationStatusOccupied = false;
    this.locationType = this.location.locationTypeId;

    this.joinGame = true;
    this.isWeb = this.utilitiesService.isWeb;

    // Timer starts after 1sec, repeats every 5sec
    this.checkStatusTimer = TimerObservable.create(100, 50000);
    this._statusTimerSubscription = this.checkStatusTimer.subscribe(() => {
      this.godService.checkLocationStatus(this.locationId);
    });
  }

  ngOnDestroy() {
    // Stop the timer
    this._statusTimerSubscription.unsubscribe();
    this._unsubscribe();
  }

  redirectToOnTable()
  {
    this.utilitiesService.sendToNative('REDIRECT-TO-TABLE-ON', 'print');
    this.nativeCommunicationService.transmitLocationRegister({minor: 1000, major: 100});
  }

  redirectToOnTableBehavior()
  {
    this.utilitiesService.sendToNative('REDIRECT-TO-TABLE-ON-Behavior', 'print');
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(this.locationId));
    this.nativeCommunicationService.transmitLocationRegisterTableBehavior();
  }

  updateLocationStatus(status: string){
    if (status === 'FREE'){
      this.locationStatusFree = true;
      this.locationStatusOccupied = false;
    }
    if (status === 'OCCUPIED'){
      this.locationStatusFree = false;
      this.locationStatusOccupied = true;
    }
  }

  // saves ID of current exhibit in localstorage
  startOnTableSearch(){
    this.joinGame = false;
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(this.locationId));
    // localStorage.setItem('atExhibitParent', JSON.stringify(this.locationId));
  }

  registerLocationLike() {
    this.nativeCommunicationService.transmitLocationLike(true);
  }

  registerLocationUnlike() {
    this.nativeCommunicationService.transmitLocationLike(false);
  }
}
