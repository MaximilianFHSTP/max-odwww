import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { MainViewComponent } from './components/main-view/main-view.component';
import { ContentPassiveComponent } from './components/content-passive/content-passive.component';
import { ContentInteractiveComponent } from './components/content-interactive/content-interactive.component';
import { ContentTableAtComponent } from './components/content-table-at/content-table-at.component';
import { ContentTableOnComponent } from './components/content-table-on/content-table-on.component';
import { StartViewComponent } from './components/start-view/start-view.component';
import { ChangeCredentialsComponent } from './components/change-credentials/change-credentials.component';
import { RegisterRealuserComponent } from './components/register-realuser/register-realuser.component';
import { LanguageStartComponent } from './components/language-start/language-start.component';
import { WappenComponent } from './components/wappen/wappen.component';
import { AboutComponent } from './components/about/about.component';
import { LegalComponent } from './components/legal/legal.component';
import { EducationQuizComponent } from './components/education-quiz/education-quiz.component';
import {ContentTableNotifyAtComponent} from './components/content-table-notify-at/content-table-notify-at.component';
import {ContentTableNotifyOnComponent} from './components/content-table-notify-on/content-table-notify-on.component';



const routes: Routes = [
  { path: '', component: StartViewComponent},
  { path: 'login', component: LoginComponent},
  { path: 'mainview', component: MainViewComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'registerRealUser', component: RegisterRealuserComponent},
  { path: 'changeLanguageStart', component: LanguageStartComponent},
  { path: 'changecred', component: ChangeCredentialsComponent },
  { path: 'passive', component: ContentPassiveComponent },
  { path: 'interactive', component: ContentInteractiveComponent },
  { path: 'tableat', component: ContentTableAtComponent, runGuardsAndResolvers: 'always'},
  { path: 'tableon', component: ContentTableOnComponent },
  { path: 'about', component: AboutComponent },
  { path: 'legal', component: LegalComponent },
  { path: 'educationQuiz', component: EducationQuizComponent },
  { path: 'wappen', component: WappenComponent },
  { path: 'tableNotifyAt', component: ContentTableNotifyAtComponent},
  { path: 'tableNotifyOn', component: ContentTableNotifyOnComponent},

  { path: '**', component: PageNotFoundComponent }
  // don't touch this
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {onSameUrlNavigation: 'reload', enableTracing: false }) // <-- debugging purposes only)
    ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
