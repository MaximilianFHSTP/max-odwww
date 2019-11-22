import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NgZone } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Material Design
import {MatButtonModule, MatCheckboxModule, MatToolbarModule, MatMenuModule, MatIconModule, MatCardModule,
  MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule, MatBadgeModule,
  MatListModule, MatDialogModule} from '@angular/material';

// Services
import {UtilityService} from './services/utility.service';
import {NativeResponseService} from './services/native/native-response.service';
import { NativeCommunicationService } from './services/native/native-communication.service';
import {AlertService} from './services/alert.service';
import {LocationService} from './services/location.service';

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
import { ContentInteractiveComponent } from './components/content-interactive/content-interactive.component';
import { ContentPassiveComponent } from './components/content-passive/content-passive.component';
import { ContentTableAtComponent } from './components/content-table-at/content-table-at.component';
import { ContentTableNotifyAtComponent } from './components/content-table-notify-at/content-table-notify-at.component';
import { EducationQuizComponent } from './components/education-quiz/education-quiz.component';
import { HelpComponent } from './components/help/help.component';
import { LanguageStartComponent } from './components/language-start/language-start.component';
import { MainViewComponent } from './components/main-view/main-view.component';
import { NativeSettingDialogComponent } from './components/native-setting-dialog/native-setting-dialog.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { StartViewComponent } from './components/start-view/start-view.component';
import { WappenComponent } from './components/wappen/wappen.component';

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
    ContentInteractiveComponent,
    ContentPassiveComponent,
    ContentTableAtComponent,
    ContentTableNotifyAtComponent,
    EducationQuizComponent,
    EducationQuizComponent,
    LanguageStartComponent,
    MainViewComponent,
    NativeSettingDialogComponent,
    PageNotFoundComponent,
    StartViewComponent,
    WappenComponent,
    HelpComponent
  ],
  imports: [
    BrowserModule,
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
    NativeResponseService,
    WindowRef,
    LocationService,
    { provide: 'AppStore', useValue: appStore },
    LocationActions,
    UserActions,
    StatusActions,
    NativeCommunicationService,
    AlertService,
    FormBuilder,
    UtilityService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    AlertDialogComponent,
    NativeSettingDialogComponent
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

        break;
      }
      case 'send_correct_appSettings': {
        this.nativeResponseService.getAppSettingsDataFromNative(value);
        break;
      }
      case 'send_correct_wifi': {

        break;
      }
      case 'send_app_version': {
        this.nativeResponseService.getAppVersionNative(value);
        break;
      }
      case 'send_correct_location': {
        this.nativeResponseService.getLocationDataFromNative(value);
        break;
      }
      case 'send_correct_bluetooth': {
        this.nativeResponseService.getBluetoothDataFromNative(value);
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
      case 'permissionresult': {
        this.nativeResponseService.handleNoPermissionsGranted('true');
        break;
      }
      case 'permissions_granted': {
        this.nativeResponseService.handleNoPermissionsGranted('false');
        break;
      }
      case 'unlock_all_timeline_locations':{
        this.nativeResponseService.unlockAllTimelineLocations();
        break;
      }
      case 'send_swipedirection': {
        // this.nativeCommunicationService.sendToNative(value, 'print');
        this.nativeResponseService.swipeNavigation(value);
        break;
      }
      case 'ar_object_found': {
        this.nativeResponseService.arObjectFound();
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
