import {Component, Inject, Injectable, OnInit, OnDestroy} from '@angular/core';
import {UserActions} from './actions/UserActions';
import {LocationActions} from './actions/LocationActions';
import {StatusActions} from './actions/StatusActions';
import { UtilitiesService } from './services/utilities.service';
import {Unsubscribe} from 'redux';
import {NativeCommunicationService} from './services/native-communication.service';
import {WindowRef} from './WindowRef';
import { Subscription } from 'rxjs/Subscription';
import { MatDialog, MatDialogConfig} from '@angular/material';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import {AlertService} from './services/alert.service';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {Router} from '@angular/router';
import {LocationService} from './services/location.service';

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
  private currentError: number;
  private currentSuccess: number;
  private registerLocationmessage: any;

  constructor(
    @Inject('AppStore') private appStore,
    private statusActions: StatusActions,
    private userActions: UserActions,
    private locationActions: LocationActions,
    private locationService: LocationService,
    private utilitiesService: UtilitiesService,
    private winRef: WindowRef,
    private dialog: MatDialog,
    private alertService: AlertService,
    private nativeCommunicationService: NativeCommunicationService,
    public snackBar: MatSnackBar,
    public router: Router
  )
  {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      const token = state.token;

      const errorMessage = state.errorMessage;
      const successMessage = state.successMessage;

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

  public logoutUser()
  {
    this.nativeCommunicationService.logout();
  }

  public redirectToTimeline()
  {
    this.locationService.setToStartPoint();
    this.router.navigate(['/mainview']).then( () =>
      {
        // send success to native & start beacon scan
        this.utilitiesService.sendToNative('success', 'redirectToTimeline');
      }
    );
  }
}
