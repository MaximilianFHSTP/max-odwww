import { Component, Inject, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { UnlockDialogComponent } from '../unlock-dialog/unlock-dialog.component';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { NativeResponseService } from '../../services/native/native-response.service';
import { LanguageService } from '../../services/language.service';
import { AlertService } from '../../services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.css']
})
export class AppSettingsComponent implements OnInit, OnDestroy {
  private subscriptionNativeBackbutton: Subscription;
  private correctWifiSubscribe: Subscription;
  private correctLocationSubscribe: Subscription;
  private correctBluetoothSubscribe: Subscription;
  public guest: boolean;
  public wifiStatus = 'loading';
  public bluetoothStatus = 'loading';
  public locationStatus = 'loading';
  public wifiCheck = false;
  public bluetoothCheck = false;
  public locationCheck = false;
  public isIOS = false;
  public isAndroid = false;

  constructor(
    @Inject('AppStore') private appStore,
    private router: Router,
    private dialog: MatDialog,
    public languageService: LanguageService,
    private alertService: AlertService,
    private translate: TranslateService,
    private nativeCommunicationService: NativeCommunicationService,
    private nativeResponseService: NativeResponseService,
    private ngZone: NgZone
  ) { 
    this.correctWifiSubscribe = this.alertService.getMessageCorrectWifi().subscribe(value => {
      this.setValue(value, 'wifi');
    });
    this.correctLocationSubscribe = this.alertService.getMessageCorrectLocation().subscribe(value => {
      this.setValue(value, 'location');
    });
    this.correctBluetoothSubscribe = this.alertService.getMessageCorrectBluetooth().subscribe(value => {
      this.setValue(value, 'bluetooth');
    });
    this.subscriptionNativeBackbutton = this.alertService.getMessageNativeBackbutton().subscribe(() => {
      const elm: HTMLElement = document.getElementById('closebutton') as HTMLElement;
      if(elm){ elm.click(); }
    });
  }

  ngOnDestroy() {
    if(this.correctWifiSubscribe){
      this.correctWifiSubscribe.unsubscribe();
    }
    if(this.correctLocationSubscribe){
      this.correctLocationSubscribe.unsubscribe();
    }
    if(this.correctBluetoothSubscribe){
      this.correctBluetoothSubscribe.unsubscribe();
    }
  }

  ngOnInit() {
    this.nativeCommunicationService.sendToNative('statusLocation', 'statusLocation');
    this.nativeCommunicationService.sendToNative('statusBluetooth', 'statusBluetooth');
    this.nativeCommunicationService.sendToNative('statusWifi', 'statusWifi');
    this.isAndroid = this.nativeCommunicationService.isAndroid;
    this.isIOS = this.nativeCommunicationService.isIOS;

    const state = this.appStore.getState();
    if(state.user !== undefined) { this.guest = state.user.isGuest; }
  }

  public unlockAll(){ 
    window.scrollTo(0, 0);
    const dialogRef = this.dialog.open(UnlockDialogComponent,
      {data: { username: this.appStore.getState().user.name},
        disableClose: true,
        autoFocus: false
      });
    dialogRef.afterClosed().subscribe(result =>{
      if(result === this.translate.instant('app.confirm')){
        this.nativeResponseService.unlockAllTimelineLocations();
      }
    });
  }

  setValue(value: any, func: string){
    let status = '';
    (value.toString() === 'true') ? status = 'success' : status = 'error';

    switch(func){
      case 'wifi':
        this.ngZone.run(() => {
          if(this.wifiStatus !== status) {this.wifiStatus = status; }
        });
        break;
      case 'bluetooth':
        this.ngZone.run(() => {
          if(this.bluetoothStatus !== status) { this.bluetoothStatus = status; }
        });        
        break;
      case 'location':
        this.ngZone.run(() => {
          if(this.locationStatus !== status) { this.locationStatus = status; }
        });        
        break;
    }
  }

  fix(op: string){
    switch(op){
      case 'wifi':
        this.nativeResponseService.getWifiDataFromGoD(); 
        this.wifiCheck = true;
        this.wifiStatus = 'loading'; 
        break;
      case 'bluetooth':
        this.nativeCommunicationService.sendToNative('activateBluetoothCheck', 'activateBluetoothCheck');
        this.bluetoothCheck = true;
        this.bluetoothStatus = 'loading';    
        break;
      case 'location':
        this.nativeCommunicationService.sendToNative('activateLocationCheck', 'activateLocationCheck');
        this.locationCheck = true;
        this.locationStatus = 'loading'; 
        break;
    }
  }

  get(op: string){
    switch(op){
      case 'wifi':
        this.wifiCheck = false;
        this.nativeCommunicationService.sendToNative('statusWifi', 'statusWifi');
        break;
      case 'bluetooth':
        this.bluetoothCheck = false;
        this.nativeCommunicationService.sendToNative('statusBluetooth', 'statusBluetooth');
        break;
      case 'location':
        this.locationCheck = false;
        this.nativeCommunicationService.sendToNative('statusLocation', 'statusLocation');
        break;
    }
  }

  public closeWindow(){
    this.router.navigate(['mainview']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Main View', 'print');
      }
    );
  }

}
