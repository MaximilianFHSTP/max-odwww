import { Component, NgZone, Inject, Injectable, OnInit } from '@angular/core';
import {NativeCommunicationService} from './services/native-communication.service';
import {UserActions} from './actions/UserActions';


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
    private userActions: UserActions
  ) { }

  ngOnInit() {
    localStorage.setItem('atExhibitParent', JSON.stringify(0));
    localStorage.setItem('onExhibit', JSON.stringify(false));
    this.requestCheckedPlatform();
  }

  public requestCheckedPlatform(){
    this.appStore.dispatch(this.userActions.changePlatform(this.nativeCommunicationService.checkPlatform()));
    // this.platform = this.nativeCommunicationService.checkPlatform();
    // console.log("Detected Platform " + this.platform);
  }
}
