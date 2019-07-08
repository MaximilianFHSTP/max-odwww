import { Injectable } from '@angular/core';
import { WindowRef } from '../../WindowRef';

@Injectable()
export class NativeCommunicationService {

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
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.getDeviceInfos(messageBody);
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

          case 'getWifiStatusResult':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.getWifiStatusResult(messageBody);
            break;

          case 'activateBluetoothCheck':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.activateBluetoothCheck();
            break;

          case 'activateLocationCheck':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.activateLocationCheck();
            break;

          case 'activateBluetooth':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.activateBluetooth();
            break;

          case 'activateWifiSettings':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.activateWifiSettings();
            break;

          case 'showBackgroundNotification':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.showBackgroundNotification(messageBody);
            break;

          case 'openWifiDialogNative':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.openWifiDialogNative();
            break;

          case 'receiveWifiData':
            const messageString = messageBody.ssid + ' ' + messageBody.password;
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.receiveWifiData(messageString);
            break;

          case 'statusWifi':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.statusWifi();
            break;

          case 'statusLocation':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.statusLocation();
            break;

          case 'statusBluetooth':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.statusBluetooth();
            break;

          case 'getLanguage':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.getLanguage();
            break;

          case 'triggerAR':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.triggerAr();
            break;

          case 'sendPermissionCheck':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.sendPermissionCheck();
            break;

          case 'getAppVersion':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.getAppVersion();
            break;

          case 'displayUpdateMessage':
            this.winRef.nativeWindow.MEETeUXAndroidAppRoot.displayUpdateMessage();
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
