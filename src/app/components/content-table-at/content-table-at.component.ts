import { Component, Inject, NgZone, OnInit, OnDestroy } from '@angular/core';
import {LocationService} from '../../services/location.service';
import { Router, NavigationEnd } from '@angular/router';
import {NativeResponseService} from '../../services/native/native-response.service';
import { AlertService } from '../../services/alert.service';
import {Unsubscribe} from 'redux';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {LocationActions} from '../../store/actions/LocationActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import {Subscription} from 'rxjs';
import {LanguageService} from '../../services/language.service';
import * as locationTypes from '../../config/LocationTypes';

@Component({
  selector: 'app-content-table-at',
  templateUrl: './content-table-at.component.html',
  styleUrls: ['./content-table-at.component.css']
})
export class ContentTableAtComponent implements OnInit {

  // location data
  public location: any;
  public locationName: string;
  private locationId: number;
  public locationStatusFree: boolean;
  public locationStatusOccupied: boolean;
  public locationStatusOffline: boolean;
  public locationType: number;
  public isJoinButtonUnlocked: boolean;

  public isWeb: boolean;
  public joinGame: boolean;
  public locationSocketStatus: undefined;
  public correctWifi: string;
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
    private responseService: NativeResponseService,
    private alertService: AlertService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private nativeCommunicationService: NativeCommunicationService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.location = this.locationService.getCurrentLocation();
  }

  setValue(value: any, func: string){
    let status = '';
    (value.toString() === 'true') ? status = 'true' : status = 'false';

    switch(func){
      case 'wifi':
        this.ngZone.run(() => {
          if(this.correctWifi !== status) {this.correctWifi = status; }
        });
        break;
    }
  }

  getSectionIcon(sectionId: number){
    // console.log(sectionId);
    let icon = '';
    this.sectionList.forEach((section) => {
      if(section.code === sectionId){
        icon = section.icon;
      }
    });
    // console.log(icon);
    return icon;
  }

  // saves ID of current exhibit in localstorage
  startOnTableSearch(){
    this.joinGame = false;
    this.locationService.stopLocationScanning();
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(this.locationId));
    // localStorage.setItem('atExhibitParent', JSON.stringify(this.locationId));
  }

  /*
  ------------------------------------------------------------
                      Helper functions
  ------------------------------------------------------------
  */

  redirectToOnTable()
  {
    this.responseService.timelineUpdate({minor: 1000, major: 100});
  }

  redirectToOnTableBehavior()
  {
    this.nativeCommunicationService.sendToNative('REDIRECT-TO-TABLE-ON-Behavior', 'print');
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(this.locationId));
  }
}
