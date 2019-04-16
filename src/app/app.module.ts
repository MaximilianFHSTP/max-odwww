import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NgZone } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Material Design
import {MatButtonModule, MatCheckboxModule, MatToolbarModule, MatMenuModule, MatIconModule, MatCardModule,
  MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule, MatBadgeModule,
  MatListModule, MatDialogModule} from '@angular/material';

// Services
import { SocketIoModule} from 'ngx-socket-io';
import {GodSocketService} from './services/god/god-socket.service';
import {ExhibitSocketService} from './services/exhibit/exhibit-socket.service';
import {UtilityService} from './services/utility.service';
import {NativeResponseService} from './services/native/native-response.service';
import {GodService} from './services/god/god.service';
import {ExhibitService} from './services/exhibit/exhibit.service';
import { NativeCommunicationService } from './services/native/native-communication.service';
import {AlertService} from './services/alert.service';
import {LocationService} from './services/location.service';
import {TransmissionService} from './services/transmission.service';
import {CoaService} from './services/coa.service';

// Routing
import { AppRoutingModule } from './app-routing.module';
import { Router } from '@angular/router';

// Forms
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { WindowRef } from './WindowRef';

// Components
import { AppComponent } from './app.component';
import { AboutComponent } from './components/about/about.component';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { ChangeCredentialsComponent } from './components/change-credentials/change-credentials.component';
import { ContentInteractiveComponent } from './components/content-interactive/content-interactive.component';
import { ContentPassiveComponent } from './components/content-passive/content-passive.component';
import { ContentTableAtComponent } from './components/content-table-at/content-table-at.component';
import { ContentTableNotifyAtComponent } from './components/content-table-notify-at/content-table-notify-at.component';
import { ContentTableNotifyOnComponent } from './components/content-table-notify-on/content-table-notify-on.component';
import { ContentTableOnComponent } from './components/content-table-on/content-table-on.component';
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component';
import { EducationQuizComponent } from './components/education-quiz/education-quiz.component';
import { LanguageStartComponent } from './components/language-start/language-start.component';
import { LoginComponent } from './components/login/login.component';
import { MainViewComponent } from './components/main-view/main-view.component';
import { NativeSettingDialogComponent } from './components/native-setting-dialog/native-setting-dialog.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';
import { QuestionnaireDialogComponent } from './components/questionnaire-dialog/questionnaire-dialog.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { RegisterComponent } from './components/register/register.component';
import { RegisterRealuserComponent } from './components/register-realuser/register-realuser.component';
import { StartViewComponent } from './components/start-view/start-view.component';
import { UnlockComponent } from './components/unlock/unlock.component';
import { UnlockDialogComponent } from './components/unlock-dialog/unlock-dialog.component';
import { WappenComponent } from './components/wappen/wappen.component';
import { WifiComponent } from './components/wifi/wifi.component';

// Redux
import { applyMiddleware, createStore } from 'redux';
import { rootReducer } from './store/reducers/rootReducer';
import { LocationActions } from './store/actions/LocationActions';
import { UserActions } from './store/actions/UserActions';
import { StatusActions } from './store/actions/StatusActions';

// import ngx-translate and the http loader
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export const appStore = createStore(
  rootReducer
);

@NgModule({
  declarations: [
    AboutComponent,
    AlertDialogComponent,
    AppComponent,
    ChangeCredentialsComponent,
    ChangeCredentialsComponent,
    ContentInteractiveComponent,
    ContentPassiveComponent,
    ContentTableAtComponent,
    ContentTableNotifyAtComponent,
    ContentTableNotifyOnComponent,
    ContentTableOnComponent,
    DeleteDialogComponent,
    EducationQuizComponent,
    EducationQuizComponent,
    LanguageStartComponent,
    LoginComponent,
    MainViewComponent,
    NativeSettingDialogComponent,
    PageNotFoundComponent,
    QuestionnaireComponent,
    QuestionnaireDialogComponent,
    QuizComponent,
    RegisterComponent,
    RegisterRealuserComponent,
    StartViewComponent,
    UnlockComponent,
    UnlockDialogComponent,
    WappenComponent,
    WifiComponent
  ],
  imports: [
    BrowserModule,
    SocketIoModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatDialogModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    GodSocketService,
    ExhibitSocketService,
    NativeResponseService,
    WindowRef,
    GodService,
    ExhibitService,
    LocationService,
    { provide: 'AppStore', useValue: appStore },
    LocationActions,
    UserActions,
    StatusActions,
    NativeCommunicationService,
    AlertService,
    FormBuilder,
    UtilityService,
    TransmissionService,
    CoaService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    AlertDialogComponent,
    NativeSettingDialogComponent,
    DeleteDialogComponent,
    UnlockDialogComponent,
    QuestionnaireDialogComponent
  ]
})
export class AppModule {
  constructor(
    private winRef: WindowRef,
    private zone: NgZone,
    private nativeResponseService: NativeResponseService,
    private nativeCommunicationService: NativeCommunicationService,
    public router: Router
  ) {

    winRef.nativeWindow.angularComponentRef = {
      zone: this.zone,
      componentFn: (message, value) => this.callFromOutside(message, value),
      component: this
    };
  }

  callFromOutside(message, value) {
      // console.log('calledFromOutside ' + message);
      this.nativeCommunicationService.sendToNative('calledFromOutside ' + message, 'print');

    switch (message) {
      case 'send_language': {
        this.nativeCommunicationService.sendToNative('Received OS Language: ' + value.language, 'print');
        this.nativeResponseService.updateAppLanguage(value.language);
        break;
      }
       case 'update_location': {
         this.nativeCommunicationService.sendToNative('Received Location Register ' + value.minor, 'print');
          this.nativeResponseService.timelineUpdate(value);
          break;
       }
       case 'send_device_infos': {
          this.nativeResponseService.odRegister(value);
          break;
       }
      case 'logout_success': {
        this.nativeResponseService.logoutSuccess();
        break;
      }
      case 'send_token': {
        this.nativeResponseService.autoLogin(value);
        break;
      }
      case 'send_wifi_ssid': {
        this.nativeResponseService.getWifiDataFromGoD();
        break;
      }
      case 'send_correct_wifi': {
        this.nativeResponseService.getWifiDataFromNative(value);
        break;
      }
      case 'send_bluetooth_check': {
        this.nativeResponseService.checkBluetooth();
        break;
      }
      case 'back_button_pressed': {
        this.nativeResponseService.redirectView();
        break;
      }
      case 'unlock_all_timeline_locations':{
        this.nativeResponseService.unlockAllTimelineLocations();
        break;
      }
      case 'send_swipedirection': {
        //this.nativeCommunicationService.sendToNative(value, 'print');
        this.nativeResponseService.swipeNavigation(value);
        break;
      }
      default: {
        break;
      }
    }
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
