import {Component, NgZone, Inject, Injectable, OnInit, OnDestroy} from '@angular/core';
import {UserActions} from './actions/UserActions';
import {LocationActions} from './actions/LocationActions';
import { UtilitiesService } from './services/utilities.service';
import {Unsubscribe} from 'redux';
import {NativeCommunicationService} from './services/native-communication.service';
import {WindowRef} from './WindowRef';
import { Subscription } from 'rxjs/Subscription';
import { MatDialog, MatDialogRef, MatDialogConfig} from '@angular/material';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import {AlertService} from './services/alert.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@Injectable()
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';

  public platform: String;
  private _unsubscribe: Unsubscribe;
  private currentToken: String;
  private message: any;
  private subscription: Subscription;
  private subscriptionBack: Subscription;
  private subject = new Subject<any>();

  constructor(
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private locationActions: LocationActions,
    private utilitiesService: UtilitiesService,
    private winRef: WindowRef,
    private nativeCommunicationService: NativeCommunicationService,
    private dialog: MatDialog,
    private alertService: AlertService
  )
  {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      const token = state.token;

      if (this.currentToken !== token && token !== undefined)
      {
        this.utilitiesService.sendToNative(token, 'saveToken');
        this.currentToken = token;
      }
    });
    this.subscription = this.alertService.getMessage().subscribe(message => {
      console.log('hi ' + message.location + ' ' + message.resStatus);
      this.openDialog(message);
    });
  }

  ngOnInit() {


    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(0));
    this.appStore.dispatch(this.locationActions.changeOnExhibit(false));

    this.requestCheckedPlatform();
    this.getTokenForAutoLogin();
  }

  openDialog(message: any) {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;

    let dialogRef = this.dialog.open(AlertDialogComponent, dialogConfig);
    dialogRef.componentInstance.number = message.location;
    console.log(this.dialog.openDialogs);
    this.subscriptionBack = dialogRef.afterClosed().subscribe(result => {
      const data = {result: result, location: message.location, resStatus: message.resStatus};
      this.alertService.sendMessageResponse(data);
    });
  }

  ngOnDestroy() {
    this._unsubscribe();
    this.subscription.unsubscribe();
  }

  public requestCheckedPlatform(){
    this.appStore.dispatch(this.userActions.changePlatform(this.utilitiesService.checkPlatform()));
  }

  public getTokenForAutoLogin()
  {
    const state = this.appStore.getState();
    const platform = state.platform;

    this.utilitiesService.sendToNative('getToken', 'getToken');

    if (platform !== 'IOS' && platform !== 'Android')
    {
      const data = JSON.parse(localStorage.getItem('token'));
      // console.log('LOCAL STORAGE: ' + data.token);
      if (data) {
        this.nativeCommunicationService.autoLogin(data);
      }
    }
  }

  public showUnityView()
  {
    // this.utilitiesService.sendToNative('AppComponent Show Unity', 'print');
    this.nativeCommunicationService.transmitShowUnity();
  }

  public logoutUser()
  {
    this.nativeCommunicationService.logout();
  }

  public changeToNearestBeacon(){
    this.nativeCommunicationService.changeBeacon();
  }
}
