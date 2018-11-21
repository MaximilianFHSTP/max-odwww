import {Component, OnInit, Inject, Injectable, OnDestroy} from '@angular/core';
import {NativeCommunicationService} from '../services/native-communication.service';
import {LocationService} from '../services/location.service';
import {UserActions} from '../actions/UserActions';
import {LocationActions} from '../actions/LocationActions';
import { UtilitiesService } from '../services/utilities.service';
import {Unsubscribe} from 'redux';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {AlertDialogComponent} from '../alert-dialog/alert-dialog.component';
import {AlertService} from '../services/alert.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
@Injectable()
export class MainViewComponent implements OnInit, OnDestroy {
  private readonly _unsubscribe: Unsubscribe;
  private registerLocationmessage: any;
  private subscriptionBack: Subscription;
  private subscriptionLocationid: Subscription;

  public user: any;
  public timelineLocations: any;
  public isWeb: boolean;
  public closestExhibit: number;

  constructor(
    private nativeCommunicationService: NativeCommunicationService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private locationActions: LocationActions,
    private utilitiesService: UtilitiesService,
    private dialog: MatDialog,
    private alertService: AlertService
  )
  {
    this._unsubscribe = this.appStore.subscribe(() =>
    {
      const state = this.appStore.getState();
      this.closestExhibit = state.closestExhibit;
      this.timelineLocations = this.locationService.getTimelineLocations();
    });

    this.subscriptionLocationid = this.alertService.getMessageLocationid().subscribe(message => {
      this.registerLocationmessage = message;
    });
  }

  ngOnDestroy() {
    this._unsubscribe();
    if (this.subscriptionBack)
    {
      this.subscriptionBack.unsubscribe();
    }
    if (this.subscriptionLocationid)
    {
      this.subscriptionLocationid.unsubscribe();
    }
  }

  public requestRegisterLocation(id: number, parentId: number)
  {
    this.nativeCommunicationService.transmitLocationRegister({minor: id, major: parentId});
  }

  ngOnInit() {

    const state = this.appStore.getState();
    this.user = state.user;
    this.locationService.lookuptable = state.lookupTable;
    this.timelineLocations = this.locationService.getTimelineLocations();
    this.closestExhibit = state.closestExhibit;
    console.log('ClosestExhibit: ' + this.closestExhibit);

    this.isWeb = this.utilitiesService.isWeb;
  }

  openDialogClosestExhibit() {
    this.locationService.stopLocationScanning();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;

    const dialogRef = this.dialog.open(AlertDialogComponent,
      {data: { number: this.closestExhibit },
        disableClose: true,
        autoFocus: false
      });
    this.subscriptionBack = dialogRef.afterClosed().subscribe(result => {
      const data = {result: result, location: this.closestExhibit, resStatus: null};
      this.alertService.sendMessageResponse(data);
    });
  }

  /*
  ------------------------------------------------------------
                      Helper functions
  ------------------------------------------------------------
  */

  public requestRegisterLocationTableAt()
  {
    this.nativeCommunicationService.transmitTimelineUpdate({minor: 100, major: 10});
  }

  public requestRegisterLocationTableOn()
  {
    this.nativeCommunicationService.transmitTimelineUpdate({minor: 1000, major: 100});
  }

  public requestRegisterLocationTableAtBehavior()
  {
    this.nativeCommunicationService.transmitTimelineUpdate({minor: 101, major: 10});
  }

  public requestRegisterLocationPassive()
  {
    this.nativeCommunicationService.transmitTimelineUpdate({minor: 1009, major: 10});
  }

  public checkWifiForWeb()
  {
    this.nativeCommunicationService.checkWifi({ssid: 'FH_STP_WLAN'});
  }
}
