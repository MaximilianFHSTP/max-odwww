import { Component, Inject, Injectable, OnInit } from '@angular/core';
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
export class AppSettingsComponent implements OnInit {
  private subscriptionNativeBackbutton: Subscription;
  public guest: boolean;
  public wifiStatus = 'error';
  public bluetoothStatus = 'error';
  public locationStatus = 'error';

  constructor(
    @Inject('AppStore') private appStore,
    private router: Router,
    private dialog: MatDialog,
    public languageService: LanguageService,
    private alertService: AlertService,
    private translate: TranslateService,
    private nativeCommunicationService: NativeCommunicationService,
    private nativeResponseService: NativeResponseService
  ) { 
    this.subscriptionNativeBackbutton = this.alertService.getMessageNativeBackbutton().subscribe(() => {
      const elm: HTMLElement = document.getElementById('closebutton') as HTMLElement;
      if(elm){ elm.click(); }
    });
  }

  ngOnInit() {
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

  public closeWindow(){
    this.router.navigate(['mainview']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Main View', 'print');
      }
    );
  }

}
