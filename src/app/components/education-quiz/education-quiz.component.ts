import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import {AlertService} from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-education-quiz',
  templateUrl: './education-quiz.component.html',
  styleUrls: ['./education-quiz.component.css']
})
export class EducationQuizComponent implements OnInit {
  private subscriptionNativeBackbutton: Subscription;
  correctAnswer = 'Bernhardinus';
  options = ['Benedictus','Bernhardinus','Bartholomäus','Basilius'];
  trialSuccess = false;
  trialError = false;

  constructor(
    private alertService: AlertService,
    private router: Router, 
    private nativeCommunicationService: NativeCommunicationService
  ) { 
    this.subscriptionNativeBackbutton = this.alertService.getMessageNativeBackbutton().subscribe(() => {
      const elm: HTMLElement = document.getElementById('closebutton') as HTMLElement;
      if(elm){ elm.click(); }
    });
  }

  ngOnInit() {
    this.options = this.shuffle(this.options);
  }

  public closeWindow(){
    this.router.navigate(['interactive']).then( () => {
      this.nativeCommunicationService.sendToNative('Interactive', 'print');
    }); 
  }

  answer(option: string){
    if(!this.trialSuccess && !this.trialError){
      (option === this.correctAnswer) ? this.trialSuccess = true : this.trialError = true;
    } 
  }

  shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

}
