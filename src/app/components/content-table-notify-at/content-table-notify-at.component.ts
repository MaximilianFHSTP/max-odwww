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
export class ContentTableNotifyAtComponent implements OnInit {

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
  ) {}

  ngOnInit() {
    this.location = this.locationService.getCurrentLocation();
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
