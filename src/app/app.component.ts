import { Component, NgZone, Inject, Injectable, OnInit } from '@angular/core';
import {NativeCommunicationService} from './services/native-communication.service';
import {UserActions} from './actions/UserActions';
import {LocationActions} from './actions/LocationActions';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@Injectable()
export class AppComponent implements OnInit {
  title = 'app';

  public platform: String;

  constructor(
    private nativeCommunicationService: NativeCommunicationService,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private locationActions: LocationActions
  ) { }

  ngOnInit() {
    // localStorage.setItem('atExhibitParent', JSON.stringify(0));
    // localStorage.setItem('onExhibit', JSON.stringify(false));
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(0));
    this.appStore.dispatch(this.locationActions.changeOnExhibit(false));

    this.requestCheckedPlatform();
  }

  public requestCheckedPlatform(){
    this.appStore.dispatch(this.userActions.changePlatform(this.nativeCommunicationService.checkPlatform()));
    // this.platform = this.nativeCommunicationService.checkPlatform();
    // console.log("Detected Platform " + this.platform);
  }
}
