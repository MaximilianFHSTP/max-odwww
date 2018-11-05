import {Component, OnInit, Inject, Injectable, OnDestroy} from '@angular/core';
import {NativeCommunicationService} from '../services/native-communication.service';
import {LocationService} from '../services/location.service';
import {UserActions} from '../actions/UserActions';
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
  public nearestLocation: number;

  constructor(
    private nativeCommunicationService: NativeCommunicationService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private utilitiesService: UtilitiesService,
    private dialog: MatDialog,
    private alertService: AlertService
  )
  {
    this._unsubscribe = this.appStore.subscribe(() =>
    {
      const state = this.appStore.getState();
      this.nearestLocation = state.nearestLocation;
      this.timelineLocations = this.locationService.getTimelineLocations();
    });

    this.subscriptionLocationid = this.alertService.getMessageLocationid().subscribe(message => {
      this.registerLocationmessage = message;
    });
  }

  openDialogNearest() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;

    const dialogRef = this.dialog.open(AlertDialogComponent,
      {data: { number: this.nearestLocation },
        disableClose: true,
        autoFocus: false
      });
    this.subscriptionBack = dialogRef.afterClosed().subscribe(result => {
      const data = {result: result, location: this.nearestLocation, resStatus: this.registerLocationmessage.resStatus};
      this.alertService.sendMessageResponse(data);
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

  public requestRegisterLocationTableAt()
  {
    this.nativeCommunicationService.transmitLocationRegister({minor: 100, major: 10});
  }

  public requestRegisterLocationTableAtBehavior()
  {
    this.nativeCommunicationService.transmitLocationRegister({minor: 101, major: 10});
  }

  public requestRegisterLocationPassive()
  {
    this.nativeCommunicationService.transmitLocationRegister({minor: 1009, major: 10});
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

    this.isWeb = this.utilitiesService.isWeb;
  }

  openDialogClosestExhibit() {
    this.locationService.stopLocationScanning();
    const dialogConfig = new MatDialogConfig();

    //this.utilitiesService.sendToNative('sendClosestExhibit', 'sendClosestExhibit');
    const state = this.appStore.getState();
    const closestExhibit = state.closestExhibit;
    console.log("OpenDialog" + closestExhibit);

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;

    const dialogRef = this.dialog.open(AlertDialogComponent,
      {data: { number: closestExhibit },
        disableClose: true,
        autoFocus: false
      });
    this.subscriptionBack = dialogRef.afterClosed().subscribe(result => {
      const data = {result: result, location: closestExhibit, resStatus: null};
      this.alertService.sendMessageResponse(data);
    });
  }

}
