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
        console.log(messageBody);
      }
  
      if (this.isIOS)
      {
        switch (messageName) {
          case 'print':
            this.winRef.nativeWindow.webkit.messageHandlers.print.postMessage(messageBody);
            break;
        
          case 'getDeviceInfos':
            this.winRef.nativeWindow.webkit.messageHandlers.getDeviceInfos.postMessage(messageBody);
            break;
          
          case 'registerOD':
            this.winRef.nativeWindow.webkit.messageHandlers.registerOD.postMessage(messageBody);
            break;
  
          case 'triggerSignal':
            this.winRef.nativeWindow.webkit.messageHandlers.triggerSignal.postMessage(messageBody);
            break;
  
          default:
            break;
        }
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
