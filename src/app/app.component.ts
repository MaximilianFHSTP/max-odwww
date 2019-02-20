import {Component, Inject, Injectable, OnInit, OnDestroy} from '@angular/core';
import {UserActions} from './store/actions/UserActions';
import {LocationActions} from './store/actions/LocationActions';
import {StatusActions} from './store/actions/StatusActions';
import { NativeCommunicationService } from './services/native/native-communication.service';
import {Unsubscribe} from 'redux';
import {NativeResponseService} from './services/native/native-response.service';
import {WindowRef} from './WindowRef';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogConfig} from '@angular/material';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import {NativeSettingDialogComponent} from './components/native-setting-dialog/native-setting-dialog.component';
import {AlertService} from './services/alert.service';
import {Router} from '@angular/router';
import {LocationService} from './services/location.service';
import {TransmissionService} from './services/transmission.service';
import {LanguageService} from './services/language.service';
import * as languageTypes from './config/LanguageTypes';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@Injectable()
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';
  menuOpen = false;

  public platform: String;
  private readonly _unsubscribe: Unsubscribe;
  private currentToken: String;
  private subscription: Subscription;
  private subscriptionBack: Subscription;
  private subscriptionLocationid: Subscription;
  private subscriptionNativeSettingCheckResult: Subscription;
  private subscriptionNativeBackbuttonTimelineResult: Subscription;
  private subscriptionNativeBackbuttonStartResult: Subscription;
  private registerLocationmessage: any;
  public nativeSettingType: any;
  public language: string;
  public guest: boolean;
  public isConnectedToGod: boolean;

  constructor(
    @Inject('AppStore') private appStore,
    private statusActions: StatusActions,
    private userActions: UserActions,
    private locationActions: LocationActions,
    private locationService: LocationService,
    private nativeCommunicationService: NativeCommunicationService,
    private nativeResponseService: NativeResponseService,
    private winRef: WindowRef,
    private dialog: MatDialog,
    private alertService: AlertService,
    private transmissionService: TransmissionService,
    public router: Router,
    private translate: TranslateService,
    private languageService: LanguageService
  )
  {
    translate.setDefaultLang('en');
    this.language = 'en';

    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      const token = state.token;

      this.isConnectedToGod = state.isConnectedToGod;

      if(state.user !== undefined){
        this.guest = state.user.isGuest;
        // console.log('Guest '+state.user.isGuest);
      }

      if (this.currentToken !== token && token !== undefined)
      {
        this.nativeCommunicationService.sendToNative(token, 'saveToken');
        this.currentToken = token;
      }
    });

    this.subscriptionLocationid = this.alertService.getMessageLocationid().subscribe(message => {
      this.registerLocationmessage = message;
    });
    this.subscriptionNativeSettingCheckResult = this.alertService.getMessageNativeSettingCheck().subscribe(message => {
      this.nativeSettingType = message.nativeSettingType;
    });
    this.subscriptionNativeBackbuttonTimelineResult = this.alertService.getMessageNativeBackbuttonTimeline().subscribe(() => {
      this.redirectToTimeline();
    });
    this.subscriptionNativeBackbuttonStartResult = this.alertService.getMessageNativeBackbuttonStart().subscribe(() => {
      this.redirectToStart();
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

    this.subscriptionBack = dialogRef.afterClosed().subscribe(result => {
      const data = {result: result, location: this.registerLocationmessage.location, resStatus: this.registerLocationmessage.resStatus};
      this.alertService.sendMessageResponse(data);
    });
  }

  openNativeSetting() {

    const dialogConfig = new MatDialogConfig();

    // console.log(this.nativeSettingType);

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    if(this.nativeSettingType === 'wifi'){

      // console.log('openNativeSetting ' + this.nativeSettingType);
      let platformSpecificConfirm;
      if(this.nativeCommunicationService.checkPlatform() === 'Android'){
        platformSpecificConfirm = 'To the Settings';
      }else if(this.nativeCommunicationService.checkPlatform() === 'IOS'){
        platformSpecificConfirm = 'To the Settings';
      } else {
        platformSpecificConfirm = 'To the Settings';
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
    }else if(this.nativeSettingType === 'Bluetooth'){
      let platformSpecificConfirm;
      if(this.nativeCommunicationService.checkPlatform() === 'Android'){
        platformSpecificConfirm = 'Activate Bluetooth';
      }else if(this.nativeCommunicationService.checkPlatform() === 'IOS'){
        platformSpecificConfirm = 'To the Settings';
      }
      const dialogRef = this.dialog.open(NativeSettingDialogComponent, {data: { settingtype: this.nativeSettingType,
          confirmDialogText: platformSpecificConfirm}, disableClose: true, autoFocus: false });
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
    this.appStore.dispatch(this.userActions.changePlatform(this.nativeCommunicationService.checkPlatform()));
  }

  public getTokenForAutoLogin()
  {
    const state = this.appStore.getState();
    const platform = state.platform;

    this.nativeCommunicationService.sendToNative('getToken', 'getToken');

    if (platform !== 'IOS' && platform !== 'Android')
    {
      const data = JSON.parse(localStorage.getItem('token'));
      // console.log('LOCAL STORAGE: ' + data.token);
      if (data) {
        this.nativeResponseService.autoLogin(data);
      }
    }
  }

  public logoutUser()
  {
    this.dismissMenu();
    this.transmissionService.logout();
  }

  public redirectToTimeline()
  {
    this.locationService.setToStartPoint();
    this.router.navigate(['/mainview']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('success', 'redirectToTimeline');
      }
    );
  }

  public redirectToStart()
  {
    this.locationService.setToStartPoint();
    this.router.navigate(['']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('redirectToStart', 'print');
      }
    );
  }

  public registerRealuserRouting(){
    this.dismissMenu();
    this.router.navigate(['registerRealUser']).then( () =>
      {
        window.scrollTo(0, 0);
        this.nativeCommunicationService.sendToNative('Register as real user', 'print');
      }
    );
  }

  public logoutRouting(){
    this.dismissMenu();
    this.router.navigate(['']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('User Logged out', 'print');
      }
    );
  }

  public useLanguage(language: string) {
    this.translate.use(language);

    if(language === 'de')
    {
      this.languageService.transmitChangeUserLanguage(languageTypes.DE);
    }
    else {
      this.languageService.transmitChangeUserLanguage(languageTypes.ENG);
    }
    this.language = language;
  }

  public userCredentials(){
    this.dismissMenu();
    this.router.navigate(['changecred']).then( () =>
      {
        window.scrollTo(0, 0);
        this.nativeCommunicationService.sendToNative('User Credentials', 'print');
      }
    );
  }

  public userCoA(){
    this.router.navigate(['wappen']).then( () =>
      {
        window.scrollTo(0, 0);
        this.nativeCommunicationService.sendToNative('Coat of Arms', 'print');
      }
    );
  }

  public openAboutView(){
    this.dismissMenu();
    this.router.navigate(['about']).then( () =>
      {
        window.scrollTo(0, 0);
        this.nativeCommunicationService.sendToNative('About', 'print');
      }
    );
  }

  public openLegalView(){
    this.dismissMenu();
    this.router.navigate(['legal']).then( () =>
      {
        window.scrollTo(0, 0);
        this.nativeCommunicationService.sendToNative('Legal', 'print');
      }
    );
  }

  public dismissMenu(){
    this.menuOpen = false;
  }

  public openMenu(){
    this.menuOpen ? this.menuOpen = false : this.menuOpen = true;
  }

}
