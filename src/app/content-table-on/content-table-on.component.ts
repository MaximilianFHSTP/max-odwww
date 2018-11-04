import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import { GodService } from '../services/god.service';
import {LocationService} from '../services/location.service';
import {ExhibitService} from '../services/exhibit.service';
import {Unsubscribe} from 'redux';
import {LocationActions} from '../actions/LocationActions';
import {UtilitiesService} from '../services/utilities.service';

@Component({
  selector: 'app-content-table-on',
  templateUrl: './content-table-on.component.html',
  styleUrls: ['./content-table-on.component.css']
})
export class ContentTableOnComponent implements OnInit, OnDestroy {
  public connectionSuccess: boolean;
  public locationName: string;

  private _location: any;
  private readonly _unsubscribe: Unsubscribe;

  constructor(
    private godService: GodService,
    private exhibitService: ExhibitService,
    private locationService: LocationService,
    private utilitiesService: UtilitiesService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions
  ) {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      this.connectionSuccess = state.connectedToExhibit;
    });
  }

  ngOnInit() {
    this._location = this.locationService.currentLocation.value;
    this.locationName = this._location.description;

    const parentLocation = this.locationService.findLocation(this._location.parentId);

    // TODO: get IP address from LocationService
    const url = 'http://' + parentLocation.ipAddress + ':8100';

    this.exhibitService.establishExhibitConnection(url);

    this.exhibitService.connectOD();

    // localStorage.setItem('onExhibit', JSON.stringify(true));
    this.appStore.dispatch(this.locationActions.changeOnExhibit(false));
    this.locationService.stopLocationScanning();
  }

  ngOnDestroy()
  {
    this.exhibitService.disconnect();
    this._unsubscribe();
    this.locationService.startLocationScanning();
  }

  public disconnectFromExhibit()
  {
    this.exhibitService.disconnect();
  }

  public sendMessageToExhibit()
  {
    this.exhibitService.sendMessage();
  }
}
