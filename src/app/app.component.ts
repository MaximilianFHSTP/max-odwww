import {Component, Inject, Injectable, OnInit, OnDestroy} from '@angular/core';
import {UserActions} from './actions/UserActions';
import {StatusActions} from './actions/StatusActions';
import {LocationActions} from './actions/LocationActions';
import { UtilitiesService } from './services/utilities.service';
import {Unsubscribe} from 'redux';
import {NativeCommunicationService} from './services/native-communication.service';
import {WindowRef} from './WindowRef';
import { Subscription } from 'rxjs/Subscription';
import { MatDialog, MatDialogConfig} from '@angular/material';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import {NativeSettingDialogComponent} from './native-setting-dialog/native-setting-dialog.component';
import {AlertService} from './services/alert.service';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@Injectable()
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';

  public platform: String;
  private readonly _unsubscribe: Unsubscribe;
  private currentToken: String;
  private subscription: Subscription;
  private subscriptionBack: Subscription;
  private subscriptionLocationid: Subscription;
  private subscriptionNativeSettingCheckResult: Subscription;
  private currentError: number;
  private currentSuccess: number;
  private registerLocationmessage: any;
  public dismissedLocation: number;
  public showDismissed: boolean;
  public nativeSettingType: any;

  constructor(
    @Inject('AppStore') private appStore,
    private statusActions: StatusActions,
    private userActions: UserActions,
    private locationActions: LocationActions,
    private utilitiesService: UtilitiesService,
    private winRef: WindowRef,
    private dialog: MatDialog,
    private alertService: AlertService,
    private nativeCommunicationService: NativeCommunicationService,
    public snackBar: MatSnackBar
  )
  {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      const token = state.token;

      const errorMessage = state.errorMessage;
      const successMessage = state.successMessage;

      this.dismissedLocation = state.lastDismissed;
      this.showDismissed = state.showDismissed;

      if (this.currentToken !== token && token !== undefined)
      {
        this.utilitiesService.sendToNative(token, 'saveToken');
        this.currentToken = token;
      }

      if (errorMessage && errorMessage.code !== this.currentError){
        const config = new MatSnackBarConfig();
        config.duration = 3000;
        config.panelClass = ['error-snackbar'];
        this.snackBar.open(errorMessage.message, 'OK', config);
        this.currentError = errorMessage.code;
      }

      if (successMessage && successMessage.code !== this.currentSuccess){
        const config = new MatSnackBarConfig();
        config.duration = 3000;
        config.panelClass = ['success-snackbar'];
        this.snackBar.open(successMessage.message, 'OK', config);
        this.currentSuccess = successMessage.code;
      }
    });
    // this.subscription = this.alertService.getMessage().subscribe(message => {
    //   console.log('hi ' + message.location + ' ' + message.resStatus);
    //   this.openDialog(/*message*/);
    // });
    this.subscriptionLocationid = this.alertService.getMessageLocationid().subscribe(message => {
      this.registerLocationmessage = message;
    });
    this.subscriptionNativeSettingCheckResult = this.alertService.getMessageNativeSettingCheck().subscribe(message => {
      this.nativeSettingType = message.nativeSettingType;
    });
  }

  ngOnInit() {
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(0));
    this.appStore.dispatch(this.locationActions.changeOnExhibit(false));

    this.requestCheckedPlatform();
    this.getTokenForAutoLogin();

  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;

    const dialogRef = this.dialog.open(AlertDialogComponent,
      {data: { number: this.registerLocationmessage.location},
      disableClose: true,
      autoFocus: false
    });
    this.utilitiesService.sendToNative('success', 'triggerSignal');
    this.subscriptionBack = dialogRef.afterClosed().subscribe(result => {
      const data = {result: result, location: this.registerLocationmessage.location, resStatus: this.registerLocationmessage.resStatus};
      this.alertService.sendMessageResponse(data);
    });
  }

  openDialogDismissed() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;

    const dialogRef = this.dialog.open(AlertDialogComponent,
      {data: { number: this.dismissedLocation },
        disableClose: true,
        autoFocus: false
      });
    this.subscriptionBack = dialogRef.afterClosed().subscribe(result => {
      const data = {result: result, location: this.dismissedLocation, resStatus: this.registerLocationmessage.resStatus};
      this.alertService.sendMessageResponse(data);
    });
  }

  openNativeSetting() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;

    if(this.nativeSettingType === "Wifi"){
      console.log("openNativeSetting " + this.nativeSettingType);
      var platformSpecificConfirm;
      if(this.utilitiesService.checkPlatform() === 'Android'){
        platformSpecificConfirm = "To the Settings";
      }else if(this.utilitiesService.checkPlatform() === 'IOS'){
        platformSpecificConfirm = "To the Settings";
      }
      const dialogRef = this.dialog.open(NativeSettingDialogComponent,
        {data: { settingtype: this.nativeSettingType, confirmDialogText: platformSpecificConfirm},
        disableClose: true,
        autoFocus: false
      });
      this.subscriptionBack = dialogRef.afterClosed().subscribe(result => {
        const data = {result: result};
        this.alertService.sendMessageNativeWifiSettingCheckResult(data);
      });
    }else if(this.nativeSettingType === "Bluetooth"){
      var platformSpecificConfirm;
      if(this.utilitiesService.checkPlatform() === 'Android'){
        platformSpecificConfirm = "Activate Bluetooth";
      }else if(this.utilitiesService.checkPlatform() === 'IOS'){
        platformSpecificConfirm = "To the Settings";
      }
      const dialogRef = this.dialog.open(NativeSettingDialogComponent,
        {data: { settingtype: this.nativeSettingType, confirmDialogText: platformSpecificConfirm},
        disableClose: true,
        autoFocus: false
      });
      this.subscriptionBack = dialogRef.afterClosed().subscribe(result => {
        const data = {result: result};
        this.alertService.sendMessageNativeBluetoothSettingCheckResult(data);
      });
    }
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
}
