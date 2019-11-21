import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Unsubscribe} from 'redux';
import {ExhibitService} from '../../services/exhibit/exhibit.service';
import {LocationService} from '../../services/location.service';
import {NativeCommunicationService} from '../../services/native/native-communication.service';
import {LocationActions} from '../../store/actions/LocationActions';
import {CoaService} from '../../services/coa.service';

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
    private exhibitService: ExhibitService,
    private locationService: LocationService,
    private coaService: CoaService,
    private nativeCommunicationService: NativeCommunicationService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions
  )
  {}

  ngOnInit() {
    this.location = this.locationService.currentLocation.value;

    this.appStore.dispatch(this.locationActions.changeOnExhibit(false));
    this.locationService.stopLocationScanning();

    if(this.location.parentId === 502){
      // participate in the genvis
      this.coaService.tryUnlock(25);
    }else if(this.location.parentId === 403){
      // participate in the legend game
      this.coaService.tryUnlock(23);
    }
  }

  public disconnectFromExhibit()
  {

  }

  ngOnDestroy()
  {
    this.locationService.startLocationScanning();
  }
}
