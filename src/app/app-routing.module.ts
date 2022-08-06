import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { GameComponent } from './components/game/game.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { QuizmasterComponent } from './components/quizmaster/quizmaster.component';
import { RegisterComponent } from './components/register/register.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AuthGuard } from './services/auth-guard.service';

const routes: Routes = [
  { path: 'login/:username/:password', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'logout', component: LogoutComponent },
  // { path: 'settings', component: SettingsComponent },
  { path: 'game', component: GameComponent, canActivate: [AuthGuard]},
  { path: 'quizmaster', component: QuizmasterComponent, canActivate: [AuthGuard]},
  { path: '', component: LoginComponent, canActivate: [AuthGuard] },
  { path: '**', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
