import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NgZone } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatToolbarModule, MatMenuModule, MatIconModule, MatCardModule,
  MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule} from '@angular/material';

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
    ContentPassiveComponent
  ],
  imports: [
    BrowserModule,
    SocketIoModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AppRoutingModule,
    FormsModule
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
    UtilitiesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private winRef: WindowRef,
    private zone: NgZone,
    private nativeCommunicationService: NativeCommunicationService,
    private utilitiesService: UtilitiesService
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
          this.nativeCommunicationService.transmitLocationRegister(value);
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
       default: {
          break;
       }
    }

  }

}
