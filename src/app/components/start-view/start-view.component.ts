import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import { UserActions } from '../../store/actions/UserActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';

@Component({
  selector: 'app-start-view',
  templateUrl: './start-view.component.html',
  styleUrls: ['./start-view.component.css']
})

@Injectable()

export class StartViewComponent implements OnInit {
  constructor(
    private router: Router,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private nativeCommunicationService: NativeCommunicationService) { }


  ngOnInit(){}

  forwardToRegister(){
    this.router.navigate(['/register']);
  }

  forwardToLogin(){
    this.router.navigate(['/login']);
  }

  forwardToLanguage(){
    this.router.navigate(['/changeLanguageStart']);
  }

  loginAsGuest(){
    this.router.navigate(['/mainview']);
  }
}
