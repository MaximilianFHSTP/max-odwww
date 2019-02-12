import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Unsubscribe} from 'redux';
import {GodService} from '../../services/god/god.service';
import {ExhibitService} from '../../services/exhibit/exhibit.service';
import {LocationService} from '../../services/location.service';
import {NativeCommunicationService} from '../../services/native/native-communication.service';
import {LocationActions} from '../../store/actions/LocationActions';

@Component({
  selector: 'app-content-table-notify-on',
  templateUrl: './content-table-notify-on.component.html',
  styleUrls: ['./content-table-notify-on.component.css']
})
export class ContentTableNotifyOnComponent implements OnInit, OnDestroy
{

  public location: any;
  private readonly _unsubscribe: Unsubscribe;

  constructor(
    private godService: GodService,
    private exhibitService: ExhibitService,
    private locationService: LocationService,
    private nativeCommunicationService: NativeCommunicationService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions
  )
  {}

  ngOnInit() {
    this.location = this.locationService.currentLocation.value;

    this.appStore.dispatch(this.locationActions.changeOnExhibit(false));
    this.locationService.stopLocationScanning();
  }

  public disconnectFromExhibit()
  {
    this.exhibitService.transmitGodDisconnect(this.location);
  }

  ngOnDestroy()
  {
    this.locationService.startLocationScanning();
  }
}
