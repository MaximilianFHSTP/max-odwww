import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatToolbarModule, MatMenuModule, MatIconModule, MatCardModule,
  MatFormFieldModule, MatInputModule} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppRoutingModule } from './app-routing.module';

import {BeaconService} from './beacon.service';

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
  providers: [BeaconService],
  bootstrap: [AppComponent]
})
export class AppModule { }
