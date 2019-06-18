import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { UnlockDialogComponent } from '../unlock-dialog/unlock-dialog.component';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { NativeResponseService } from '../../services/native/native-response.service';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})

@Injectable()
export class HelpComponent implements OnInit {
  private subscriptionNativeBackbutton: Subscription;
  showMenu = true;
  showInfo = '';
  public guest: boolean;
  public showMore = false;

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

  public closeWindow(){
    this.router.navigate(['mainview']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Main View', 'print');
      }
    );
  }

  show(option: string){
    switch(option){
      case 'showMainScreenInfo':
        this.showMenu = false;
        this.showInfo = option;
        break;
      case 'showUnlockInfo':
        this.showMenu = false;
        this.showInfo = option;
        break;
      case 'showContentInfo':
        this.showMenu = false;
        this.showInfo = option;
        break;
      case 'showCOAInfo':
        this.showMenu = false;
        this.showInfo = option;
        break;
      case 'showDataInfo':
        this.showMenu = false;
        this.showInfo = option;
        break;
      case 'showWifiInfo':
        this.showMenu = false;
        this.showInfo = option;
        break;
      case 'showTroubleshootInfo':
        this.showMenu = false;
        this.showInfo = option;
        break;
      case 'showMenu':
        this.showMenu = true;
        this.showInfo = '';
        break;
      default:
        this.showMenu = true;
        this.showInfo = '';
        break;
    }
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

  public showWarningContent(show: boolean){
    this.showMore = show;
  }
}
