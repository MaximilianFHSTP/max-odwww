import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NgZone } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatToolbarModule, MatMenuModule, MatIconModule, MatCardModule,
  MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule, MatBadgeModule,
  MatListModule} from '@angular/material';

import { SocketIoModule} from 'ngx-socket-io';
import {GodSocketService} from './services/god-socket.service';
import {ExhibitSocketService} from './services/exhibit-socket.service';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';

import {NativeCommunicationService} from './services/native-communication.service';
import {GodService} from './services/god.service';
import {ExhibitService} from './services/exhibit.service';
import { WindowRef } from './WindowRef';
import { UtilitiesService } from './services/utilities.service';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { MainViewComponent } from './main-view/main-view.component';
import { ContentTableAtComponent } from './content-table-at/content-table-at.component';
import { ContentTableOnComponent } from './content-table-on/content-table-on.component';
import { ContentPassiveComponent } from './content-passive/content-passive.component';
import {LocationService} from './services/location.service';

import { applyMiddleware, createStore } from 'redux';
import { rootReducer } from './reducers/rootReducer';
import { LocationActions } from './actions/LocationActions';
import { UserActions } from './actions/UserActions';
import { StatusActions } from './actions/StatusActions';
import logger from 'redux-logger';

import { MatDialogModule } from '@angular/material';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { NativeSettingDialogComponent } from './native-setting-dialog/native-setting-dialog.component';
import {StartViewComponent} from './start-view/start-view.component';

import {AlertService} from './services/alert.service';

import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// import ngx-translate and the http loader
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';



export const appStore = createStore(
  rootReducer,
  applyMiddleware(logger)
);

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    RegisterComponent,
    MainViewComponent,
    ContentTableAtComponent,
    ContentTableOnComponent,
    ContentPassiveComponent,
    AlertDialogComponent,
    NativeSettingDialogComponent,
    LoginComponent,
    StartViewComponent
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
    NativeCommunicationService,
    WindowRef,
    GodService,
    ExhibitService,
    LocationService,
    { provide: 'AppStore', useValue: appStore },
    LocationActions,
    UserActions,
    StatusActions,
    UtilitiesService,
    AlertService,
    FormBuilder
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
    private nativeCommunicationService: NativeCommunicationService,
    private utilitiesService: UtilitiesService,
    private godService: GodService,
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
      this.utilitiesService.sendToNative('calledFromOutside ' + message, 'print');

    switch (message) {
       case 'update_location': {
         this.utilitiesService.sendToNative('Received Location Register ' + value.minor, 'print');
          this.nativeCommunicationService.transmitTimelineUpdate(value);
          break;
       }
       case 'send_device_infos': {
          this.nativeCommunicationService.transmitODRegister(value);
          break;
       }
      case 'logout_success': {
        this.nativeCommunicationService.logoutSuccess();
        break;
      }
      case 'send_token': {
        this.nativeCommunicationService.autoLogin(value);
        break;
      }
      case 'send_wifi_ssid': {
        this.nativeCommunicationService.checkWifi(value);
        break;
      }
      case 'send_bluetooth_check': {
        this.nativeCommunicationService.checkBluetooth();
        break;
      }
      case 'back_button_pressed': {
        if(this.router.url === '/register' || this.router.url === '/login' || this.router.url === ''){
          // this.nativeCommunicationService.redirectToStart();
          const elm: HTMLElement = document.getElementById('redirectStart') as HTMLElement;
          elm.click();
        }else{
          // this.nativeCommunicationService.redirectToTimeline();
          const elm: HTMLElement = document.getElementById('redirectTimeline') as HTMLElement;
          elm.click();
        }
        break;
      }
       default: {
          break;
       }
    }

  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
