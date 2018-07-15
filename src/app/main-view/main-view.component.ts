import { Component, OnInit, Inject, Injectable } from '@angular/core';
import {NativeCommunicationService} from '../services/native-communication.service';
import {LocationService} from '../services/location.service';
import {UserActions} from '../actions/UserActions';
import { UtilitiesService } from '../services/utilities.service';

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
    private userActions: UserActions,
    private utilitiesService: UtilitiesService
  ) { }

  public requestRegisterLocationTableAt()
  {
    this.nativeCommunicationService.transmitLocationRegister({minor: 100, major: 10});
  }

  public requestRegisterLocationPassive()
  {
    this.nativeCommunicationService.transmitLocationRegister({minor: 1009, major: 10});
  }

  ngOnInit() {

    const state = this.appStore.getState();
    this.user = state.user;
    this.locationService.lookuptable = state.lookupTable;

    this.isWeb = this.utilitiesService.isWeb;
  }

}
