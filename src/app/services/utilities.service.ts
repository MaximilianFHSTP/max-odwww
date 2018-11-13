import { Injectable } from '@angular/core';
import { WindowRef } from '../WindowRef';

@Injectable()
export class UtilitiesService {

  public isIOS = true;
  public isAndroid = false;
  public isWeb = false;

  constructor(
    private winRef: WindowRef
  ) { }

    // handels console.log - sends to native console if iOS || Android
    public sendToNative(messageBody, messageName){
      if (this.isWeb)
      {
        switch (messageName)
        {
          case 'saveToken':
            // console.log(messageBody);
            localStorage.setItem('token', JSON.stringify({token: messageBody}));
            break;

          case 'print':
            console.log(messageBody);
            break;

          case 'clearToken':
            localStorage.removeItem('token');
            break;

          default:
            break;
        }
      }

      if (this.isIOS)
      {
        const message =
        {
          'name' : messageName,
          'data' : messageBody
        };

        this.winRef.nativeWindow.webkit.messageHandlers.observe.postMessage(message);
      }

      if (this.isAndroid)
      {
        switch (messageName) {
          case 'print':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.print(messageBody);
            break;

          case 'getDeviceInfos':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.getDeviceInfos();
            break;

          case 'registerOD':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.registerOD();
            break;

          case 'triggerSignal':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.triggerSignal();
            break;

          case 'saveToken':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.saveToken(messageBody);
            break;

          case 'clearToken':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.clearToken();
            break;

          case 'showUnityView':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.showUnityView();
            break;

          case 'getToken':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.getToken();
            break;

          default:
            break;
        }
      }
    }

    // sets OS platform
    public checkPlatform(){
      const userAgent: any = window.navigator.userAgent;
      let safariCheck = false;
      let chromeCheck = false;
      let androidCheck = false;

      if (userAgent.indexOf('Safari') !== (-1))
      {
        safariCheck = true;
      }
      if (userAgent.indexOf('Chrome') !== (-1))
      {
        chromeCheck = true;
      }
      if (userAgent.indexOf('Android') !== (-1))
      {
        androidCheck = true;
      }

      if (androidCheck){
        this.isAndroid = true;
        this.isIOS = false;
        return 'Android';
      }
      else if (safariCheck || chromeCheck)
      {
        if (!androidCheck)
        {
          this.isWeb = true;
          this.isIOS = false;
          return 'Web';
        }
      }
      return 'IOS';
    }
}
