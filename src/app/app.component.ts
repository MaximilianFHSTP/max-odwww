import { Component, NgZone, Inject, Injectable, OnInit } from '@angular/core';
import {UserActions} from './actions/UserActions';
import {LocationActions} from './actions/LocationActions';
import { UtilitiesService } from './services/utilities.service';


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
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private locationActions: LocationActions,
    private utilitiesService: UtilitiesService 
  ) { }

  ngOnInit() {
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(0));
    this.appStore.dispatch(this.locationActions.changeOnExhibit(false));

    this.requestCheckedPlatform();
  }

  public requestCheckedPlatform(){
    this.appStore.dispatch(this.userActions.changePlatform(this.utilitiesService.checkPlatform()));
  }
}
