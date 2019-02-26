import {Inject, Injectable, OnInit} from '@angular/core';
import {GodService} from '../god/god.service';
import {LocationService} from '../location.service';
import {LocationActions} from '../../store/actions/LocationActions';
import {NativeCommunicationService} from './native-communication.service';
import {Router} from '@angular/router';
import {UserActions} from '../../store/actions/UserActions';
import {StatusActions} from '../../store/actions/StatusActions';
import {MatDialog} from '@angular/material';
import {AlertService} from '../alert.service';
import {TransmissionService} from '../transmission.service';
import * as LocationTypes from '../../config/LocationTypes';
import {LanguageService} from '../language.service';
import * as LanguageTypes from '../../config/LanguageTypes';

@Injectable()
export class NativeResponseService implements OnInit
{

  constructor(
    private router: Router,
    private godService: GodService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private nativeCommunicationService: NativeCommunicationService,
    private userActions: UserActions,
    private statusActions: StatusActions,
    private dialog: MatDialog,
    private alertService: AlertService,
    private transmissionService: TransmissionService,
    private languageService: LanguageService
  ) {
  }

  ngOnInit() {
  }

  public timelineUpdate(result: any) {
    const state = this.appStore.getState();
    const minor: number = result.minor;

    const location = this.locationService.findLocation(minor);

    if (!location) {
      this.nativeCommunicationService.sendToNative('this is not a valid location', 'print');
      return;
    }

    const currLoc = this.locationService.currentLocation.value;

    // if the location is not the same as before
    if (!this.locationService.sameAsCurrentLocation(location.id)) {
      // update the closestExhibit if the location is not already the closest one
      if (location.id !== this.appStore.getState().closestExhibit && location.locationTypeId !== LocationTypes.ACTIVE_EXHIBIT_ON) {
        this.appStore.dispatch(this.locationActions.changeClosestExhibit(location.id));
      }
      // If the current location is from type activeExhibitOn the redirection should be disabled
      if (currLoc && currLoc.locationTypeId === LocationTypes.ACTIVE_EXHIBIT_ON) {
        this.nativeCommunicationService.sendToNative('this is not a valid location - type 2', 'print');
        return;
      }

      // If the new location is a tableOn beacon and the user is currently tableat transmit location register directly
      if (currLoc && currLoc.locationTypeId === LocationTypes.ACTIVE_EXHIBBIT_AT &&
        location.locationTypeId === LocationTypes.ACTIVE_EXHIBIT_ON && location.parentId === currLoc.id) {
        this.transmissionService.transmitLocationRegister({minor: location.id, major: location.parentId});
      }

      // If the new location is a tableOn beacon and the user is currently tableat transmit location register directly
      if (currLoc && currLoc.locationTypeId === LocationTypes.NOTIFY_EXHIBIT_AT &&
        location.locationTypeId === LocationTypes.NOTIFY_EXHIBIT_ON && location.parentId === currLoc.id) {
        this.transmissionService.transmitLocationRegister({minor: location.id, major: location.parentId});
      }

      // check if the location is still locked. If so unlock it
      if (location.locked && state.locationScanning === true) {
        this.transmissionService.transmitTimelineUpdate(location.id);
        this.nativeCommunicationService.sendToNative(location.id, 'showBackgroundNotification');
      }
    }
  }

  public odRegister(result: any): void
  {
    this.transmissionService.transmitODRegister(result);
  }

  public autoLogin(data): void {
    const token: String = data.token;
    this.nativeCommunicationService.sendToNative('Autologin', 'print');

    if (token !== undefined && token !== null && token !== '') {
      this.godService.autoLogin(token);
    }
    else {
      this.nativeCommunicationService.sendToNative('getLanguage', 'getLanguage');
    }
  }

  public checkWifi(data: any): void {
    const wifiSSSID: String = data.ssid;
    this.nativeCommunicationService.sendToNative('Received SSID: ' + wifiSSSID, 'print');

    if (wifiSSSID !== undefined && wifiSSSID !== null && wifiSSSID !== '') {
      this.godService.checkWifi(wifiSSSID);
    }
  }

  public checkBluetooth(): void {
    const nativeSettingType = 'Bluetooth';
    const data = {nativeSettingType: nativeSettingType};

    this.alertService.sendMessageNativeSettingCheck(data);
    const elm: HTMLElement = document.getElementById('ghostButtonBluetooth') as HTMLElement;
    elm.click();
  }

  public logoutSuccess(): void {
    this.transmissionService.transmitLogoutCleanup();
  }

  public updateAppLanguage(language): void
  {
    let langNumb;
    switch(language)
    {
      case 'de': case 'DE': langNumb = LanguageTypes.DE; break;
      case 'en': case 'EN': case 'eng': case 'ENG': langNumb = LanguageTypes.ENG; break;
      default: langNumb = LanguageTypes.ENG;
    }

    this.languageService.transmitChangeAppLanguage(langNumb);
  }

  public redirectToTimeline()
  {
    // this.alertService.sendMessageNativeBackbuttonTimeline();
    const elm: HTMLElement = document.getElementById('redirectStart') as HTMLElement;
    elm.click();
  }

  public redirectToStart()
  {
    // this.alertService.sendMessageNativeBackbuttonStart();
    const elm: HTMLElement = document.getElementById('redirectTimeline') as HTMLElement;
    elm.click();
  }
}
