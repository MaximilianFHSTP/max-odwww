import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NgZone } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatToolbarModule, MatMenuModule, MatIconModule, MatCardModule,
  MatFormFieldModule, MatInputModule} from '@angular/material';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';

import {CommunicationService} from './communication.service';
import {GodService} from './god.service';
import { WindowRef } from './WindowRef';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterComponent } from './register/register.component';
import { MainViewComponent } from './main-view/main-view.component';
import { ContentTableAtComponent } from './content-table-at/content-table-at.component';
import { ContentTableOnComponent } from './content-table-on/content-table-on.component';
import { ContentPassiveComponent } from './content-passive/content-passive.component';


const socketConfig: SocketIoConfig = { url: 'http://god.meeteux.fhstp.ac.at:3000', options: {} };

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
    AppRoutingModule,
    FormsModule
  ],
  providers: [CommunicationService, WindowRef, GodService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private winRef: WindowRef,
    private zone: NgZone,
    private communicationService: CommunicationService
  ) {

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
      console.log('calledFromOutside ' + message);
    // });
    switch(message) {
       case "update_location": {
          //statements;
          console.log(value);
          break;
       }
       case "send_device_infos": {
          //statements;
          this.communicationService.transmitODRegister(value);
          break;
       }
       default: {
          //statements;
          break;
       }
    }

  }

}
