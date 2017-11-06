import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NgZone } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatToolbarModule, MatMenuModule, MatIconModule, MatCardModule,
  MatFormFieldModule, MatInputModule} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppRoutingModule } from './app-routing.module';

import {BeaconService} from './beacon.service';
import { WindowRef } from './WindowRef';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterComponent } from './register/register.component';


const socketConfig: SocketIoConfig = { url: 'http://god.meeteux.fhstp.ac.at:3000', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    SocketIoModule.forRoot(socketConfig),
    AppRoutingModule
  ],
  providers: [BeaconService, WindowRef],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private winRef: WindowRef, private zone:NgZone) {

    //console.log('Window object', winRef.nativeWindow);

    winRef.nativeWindow.angularComponentRef = {
      zone: this.zone,
      componentFn: (message, value) => this.callFromOutside(message, value),
      component: this
    };
    console.log('reference added');
  }

  callFromOutside(message, value) {
    // this.zone.run(() => {
      console.log('calledFromOutside ' + message + value);
    // });
    switch(message) {
       case "update_location": {
          //statements;
          break;
       }
       case "send_device_infos": {
          //statements;
          break;
       }
       default: {
          //statements;
          break;
       }
    }

  }

}
