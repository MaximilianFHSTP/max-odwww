import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NgZone } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatToolbarModule, MatMenuModule, MatIconModule, MatCardModule,
  MatFormFieldModule, MatInputModule, MatProgressSpinnerModule} from '@angular/material';

import { SocketIoModule} from 'ngx-socket-io';
import {GodSocketService} from './services/god-socket.service';
import {ExhibitSocketService} from './services/exhibit-socket.service';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';

import {NativeCommunicationService} from './services/native-communication.service';
import {GodService} from './services/god.service';
import {ExhibitService} from './services/exhibit.service';
import { WindowRef } from './WindowRef';

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
    LocationActions
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private winRef: WindowRef,
    private zone: NgZone,
    private nativeCommunicationService: NativeCommunicationService
  ) {

    // console.log('Window object', winRef.nativeWindow);

    winRef.nativeWindow.angularComponentRef = {
      zone: this.zone,
      componentFn: (message, value) => this.callFromOutside(message, value),
      component: this
    };
    console.log('reference added');
  }

  callFromOutside(message, value) {
    // this.zone.run(() => {
      console.log('calledFromOutside ' + message);
    // });
    switch (message) {
       case 'update_location': {
          // statements;
          // console.log(value);
          // this.communicationService.transmitLocationRegister({minor: 100, major: 10});
          this.nativeCommunicationService.transmitLocationRegister(value);
          break;
       }
       case 'send_device_infos': {
          // statements;
          this.nativeCommunicationService.transmitODRegister(value);
          break;
       }
       default: {
          // statements;
          break;
       }
    }

  }

}
