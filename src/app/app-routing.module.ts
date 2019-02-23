import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { MainViewComponent } from './components/main-view/main-view.component';
import { ContentTableAtComponent } from './components/content-table-at/content-table-at.component';
import { ContentTableOnComponent } from './components/content-table-on/content-table-on.component';
import { StartViewComponent } from './components/start-view/start-view.component';
import { ChangeCredentialsComponent } from './components/change-credentials/change-credentials.component';
import { QuizComponent } from './components/quiz/quiz.component';



const routes: Routes = [
  { path: '', component: StartViewComponent},
  { path: 'login', component: LoginComponent},
  { path: 'mainview', component: MainViewComponent },
  { path: 'changecred', component: ChangeCredentialsComponent },
  { path: 'tableat', component: ContentTableAtComponent, runGuardsAndResolvers: 'always'},
  { path: 'tableon', component: ContentTableOnComponent },
  { path: 'quiz', component: QuizComponent},

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
