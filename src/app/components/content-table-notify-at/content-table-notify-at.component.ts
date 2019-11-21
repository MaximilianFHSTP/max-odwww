import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LocationService} from '../../services/location.service';
import {NavigationEnd, Router} from '@angular/router';
import {NativeCommunicationService} from '../../services/native/native-communication.service';
import { AlertService } from '../../services/alert.service';
import {Unsubscribe} from 'redux';
import {Subscription} from 'rxjs';
import {NativeResponseService} from '../../services/native/native-response.service';
import {LocationActions} from '../../store/actions/LocationActions';
import {TimerObservable} from 'rxjs-compat/observable/TimerObservable';
import * as locationTypes from '../../config/LocationTypes';
import {LanguageService} from '../../services/language.service';

@Component({
  selector: 'app-content-table-notify-at',
  templateUrl: './content-table-notify-at.component.html',
  styleUrls: ['./content-table-notify-at.component.css']
})
export class ContentTableNotifyAtComponent implements OnInit, OnDestroy {

  // location data
  public location: any;
  public locationName: string;
  private locationId: number;
  public locationStatusFree: boolean;
  public locationStatusOccupied: boolean;
  public locationStatusOffline: boolean;
  public locationType: number;
  public isJoinButtonUnlocked: boolean;
  public correctWifi: string;

  private checkStatusTimer: any;
  public isWeb: boolean;
  public joinGame: boolean;
  public locationSocketStatus: undefined;

  private readonly _unsubscribe: Unsubscribe;
  private _statusTimerSubscription;
  private _curLocSubscribe: Subscription;
  private correctWifiSubscribe: Subscription;
  sectionList = [
    {code: 10, icon: 'Trumpet', primaryColor: '#823a3a', secondaryColor: '#a85757'},
    {code: 20, icon: 'DocumentSword', primaryColor: '#305978', secondaryColor: '#4b799c'},
    {code: 30, icon: 'Maximilian', primaryColor: '#755300', secondaryColor: '#906e1b'},
    {code: 40, icon: 'Veil', primaryColor: '#1d635d', secondaryColor: '#3c7f7a'},
    {code: 50, icon: 'Shrine', primaryColor: '#5c416a', secondaryColor: '#785d86'},
    {code: 60, icon: 'Tombstone',  primaryColor: '#32633a', secondaryColor: '#4c7d54'}
  ];

  constructor(
    private router: Router,
    private locationService: LocationService,
    public languageService: LanguageService,
    private alertService: AlertService,
    private responseService: NativeResponseService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private nativeCommunicationService: NativeCommunicationService
  ) {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      this.updateLocationStatus(state.locationStatus);
      if(state.closestExhibit)
      {
        this.updateJoinButtonStatus(state.closestExhibit);
      }
      this.locationSocketStatus = state.locationSocketStatus;
    });

    this.correctWifiSubscribe = this.alertService.getMessageCorrectWifi().subscribe(value => {
      this.correctWifi = value.toString();
    });

    this._curLocSubscribe = this.locationService.currentLocation.subscribe(value =>
    {
      this.location = value;
    });
  }

  ngOnInit() {
    this.initialiseInvites();
  }

  initialiseInvites() {

    this.location = this.locationService.currentLocation.value;
    this.locationName = this.location.description;
    this.locationId = this.location.id;
    this.locationStatusFree = false;
    this.locationStatusOccupied = false;
    this.locationStatusOffline = false;
    this.locationType = this.location.locationTypeId;

    this.joinGame = true;
    this.correctWifi = 'true';
    this.isWeb = this.nativeCommunicationService.isWeb;

    // Timer starts after 1sec, repeats every 5sec
    this.checkStatusTimer = TimerObservable.create(100, 5000);
    this._statusTimerSubscription = this.checkStatusTimer.subscribe(() => {
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

  getSectionIcon(sectionId: number){
    let icon = '';
    this.sectionList.forEach((section) => {
      if(section.code === sectionId){
        icon = section.icon;
      }
    });

    return icon;
  }

  // saves ID of current exhibit in localstorage
  startOnTableSearch(){
    this.joinGame = false;
    this.locationService.stopLocationScanning();
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(this.locationId));
  }

  /*
  ------------------------------------------------------------
                      Helper functions
  ------------------------------------------------------------
  */

  redirectToOnTable()
  {
    this.responseService.timelineUpdate({minor: this.locationId * 10 + 1, major: this.locationId});
  }
}
