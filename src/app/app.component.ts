import {Component, NgZone, Inject, Injectable, OnInit, OnDestroy} from '@angular/core';
import {UserActions} from './actions/UserActions';
import {LocationActions} from './actions/LocationActions';
import { UtilitiesService } from './services/utilities.service';
import {Unsubscribe} from 'redux';
import {NativeCommunicationService} from './services/native-communication.service';
import {WindowRef} from './WindowRef';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@Injectable()
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';

  public platform: String;
  private _unsubscribe: Unsubscribe;
  private currentToken: String;

  constructor(
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private locationActions: LocationActions,
    private utilitiesService: UtilitiesService,
    private winRef: WindowRef,
    private nativeCommunicationService: NativeCommunicationService
  )
  {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      const token = state.token;

      if (this.currentToken !== token && token !== undefined)
      {
        this.utilitiesService.sendToNative(token, 'saveToken');
      }
    });
  }

  ngOnInit() {
    this.appStore.dispatch(this.locationActions.changeAtExhibitParentId(0));
    this.appStore.dispatch(this.locationActions.changeOnExhibit(false));

    this.requestCheckedPlatform();
    this.getTokenForAutoLogin();
  }

  ngOnDestroy() {
    this._unsubscribe();
  }

  public requestCheckedPlatform(){
    this.appStore.dispatch(this.userActions.changePlatform(this.utilitiesService.checkPlatform()));
  }

  public getTokenForAutoLogin()
  {
    const state = this.appStore.getState();
    const platform = state.platform;

    switch (platform) {
      case 'IOS':
        this.winRef.nativeWindow.webkit.messageHandlers.getToken.postMessage('get');
        break;

      case 'Android':
        // TODO: Android Implementation
        break;

      default:
        const data = JSON.parse(localStorage.getItem('token'));
        // console.log('LOCAL STORAGE: ' + data.token);
        if (data) {
          this.nativeCommunicationService.autoLogin(data);
        }
        break;
    }
  }

  public showUnityView()
  {
    // this.utilitiesService.sendToNative('AppComponent Show Unity', 'print');
    this.nativeCommunicationService.transmitShowUnity();
  }

  public logoutUser()
  {
    this.nativeCommunicationService.logout();
  }
}
