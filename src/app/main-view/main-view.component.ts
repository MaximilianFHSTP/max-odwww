import { Component, OnInit, Inject, Injectable } from '@angular/core';
import {NativeCommunicationService} from '../services/native-communication.service';
import {LocationService} from '../services/location.service';
import {UserActions} from '../actions/UserActions';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
@Injectable()
export class MainViewComponent implements OnInit {
  private user: any;
  private lookuptable: any;
  public isWeb: boolean;

  constructor(
    private nativeCommunicationService: NativeCommunicationService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private userActions: UserActions
  ) { }

  public requestRegisterLocation()
  {
    this.nativeCommunicationService.transmitLocationRegister({minor: 100, major: 10});
  }

  ngOnInit() {
    // TODO: Change to appStore
    const state = this.appStore.getState();
    this.user = state.user;
    //this.user = JSON.parse(localStorage.getItem('user'));

    this.locationService.lookuptable = JSON.parse(localStorage.getItem('lookuptable'));

    this.isWeb = this.nativeCommunicationService.isWeb;
  }

}
