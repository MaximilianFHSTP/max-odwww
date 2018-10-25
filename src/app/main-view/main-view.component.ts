import { Component, OnInit, Inject, Injectable } from '@angular/core';
import {NativeCommunicationService} from '../services/native-communication.service';
import {LocationService} from '../services/location.service';
import {UserActions} from '../actions/UserActions';
import { UtilitiesService } from '../services/utilities.service';
import { MatDialog, MatDialogConfig} from '@angular/material';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import {AlertService} from '../services/alert.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
@Injectable()
export class MainViewComponent implements OnInit {
  public user: any;
  private lookuptable: any;
  public isWeb: boolean;
  private subscriptionBack: Subscription;

  constructor(
    private nativeCommunicationService: NativeCommunicationService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private utilitiesService: UtilitiesService,
    private dialog: MatDialog,
    private alertService: AlertService
  ) { }

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

  ngOnInit() {

    const state = this.appStore.getState();
    this.user = state.user;
    this.locationService.lookuptable = state.lookupTable;

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
