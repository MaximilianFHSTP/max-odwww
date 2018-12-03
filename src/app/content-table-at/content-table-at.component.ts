import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import { GodService } from '../services/god.service';
import {LocationService} from '../services/location.service';
import { Router, NavigationEnd } from '@angular/router';
import {NativeCommunicationService} from '../services/native-communication.service';
import {Unsubscribe} from 'redux';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {LocationActions} from '../actions/LocationActions';
import { UtilitiesService } from '../services/utilities.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-content-table-at',
  templateUrl: './content-table-at.component.html',
  styleUrls: ['./content-table-at.component.css']
})
export class ContentTableAtComponent implements OnInit, OnDestroy {

  // location data
  public location: any;
  public locationName: string;
  private locationId: number;
  public locationStatusFree: boolean;
  public locationStatusOccupied: boolean;
  public locationStatusOffline: boolean;
  public locationType: number;
  public isJoinButtonUnlocked: boolean;

  private checkStatusTimer: any;
  public isWeb: boolean;
  public joinGame: boolean;
  public locationSocketStatus: undefined;

  private readonly _unsubscribe: Unsubscribe;
  private _statusTimerSubscription;
  private _curLocSubscribe: Subscription;
  private navigationSubscription: Subscription;

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
      this.updateJoinButtonStatus(state.closestExhibit);
      this.locationSocketStatus = state.locationSocketStatus;
    });

    this._curLocSubscribe = this.locationService.currentLocation.subscribe(value =>
    {
      this.location = value;
    });
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialiseInvites();
      }
    });
  }

  ngOnInit() {
    this.initialiseInvites();
  }

  initialiseInvites() {
    this.utilitiesService.sendToNative('TABLE-AT', 'print');

    this.location = this.locationService.currentLocation.value;
    this.locationName = this.location.description;
    this.locationId = this.location.id;
    this.locationStatusFree = false;
    this.locationStatusOccupied = false;
    this.locationStatusOffline = false;
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
    this._curLocSubscribe.unsubscribe();
  }

  updateJoinButtonStatus(locationId: number)
  {
    // Checking if the closest exhibit is the current active exhibit or one of the tableOn beacons
    this.isJoinButtonUnlocked = this.locationService.isActiveLocationInRange(locationId);
  }

  updateLocationStatus(status: string){
    if (status === 'FREE'){
      this.locationStatusFree = true;
      this.locationStatusOccupied = false;
      this.locationStatusOffline = false;
    }
    else if (status === 'OCCUPIED'){
      this.locationStatusFree = false;
      this.locationStatusOccupied = true;
      this.locationStatusOffline = false;
    }
    else if (status === 'OFFLINE') {
      this.locationStatusOffline = true;
      this.locationStatusFree = false;
      this.locationStatusOccupied = false;
    }
  }

  // saves ID of current exhibit in localstorage
  startOnTableSearch(){
    this.joinGame = false;
    this.locationService.stopLocationScanning();
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(this.locationId));
    // localStorage.setItem('atExhibitParent', JSON.stringify(this.locationId));
  }

  registerLocationLike() {
    this.nativeCommunicationService.transmitLocationLike(true);
  }

  registerLocationUnlike() {
    this.nativeCommunicationService.transmitLocationLike(false);
  }

  /*
  ------------------------------------------------------------
                      Helper functions
  ------------------------------------------------------------
  */

  redirectToOnTable()
  {
    // this.utilitiesService.sendToNative('REDIRECT-TO-TABLE-ON', 'print');
    this.nativeCommunicationService.transmitTimelineUpdate({minor: 1000, major: 100});
  }

  redirectToOnTableBehavior()
  {
    this.utilitiesService.sendToNative('REDIRECT-TO-TABLE-ON-Behavior', 'print');
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(this.locationId));
    this.nativeCommunicationService.transmitLocationRegisterTableBehavior();
  }
}
