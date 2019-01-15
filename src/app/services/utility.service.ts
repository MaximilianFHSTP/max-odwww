import { Injectable } from '@angular/core';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private alertService: AlertService
  ) { }

  public checkIfEmail(email: string){
    let isEmail;
    const re = new RegExp(/^([\w\-\.]+)@((\[([0-9]{1,3}\.){3}[0-9]{1,3}\])|(([\w\-]+\.)+)([a-zA-Z]{2,4}))$/);
    // const re = new RegExp('^([\w\-\.]+)@((\[([0-9]{1,3}\.){3}[0-9]{1,3}\])|(([\w\-]+\.)+)([a-zA-Z]{2,4}))$');
    isEmail = re.test(email);
    return isEmail;
  }

  public triggerJumpTimeline(data: any){
    this.alertService.sendMessageLocationid(data);
  }
}
