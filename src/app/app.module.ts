import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from 'src/angular-material/angular-material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RegisterComponent } from './components/register/register.component';
import { SettingsComponent } from './components/settings/settings.component';
import { GameComponent } from './components/game/game.component';
import { AuthGuard } from './services/auth-guard.service';

import { FlexLayoutModule } from '@angular/flex-layout';
import { QuizmasterComponent } from './components/quizmaster/quizmaster.component';
import { QuizConfigComponent } from './components/quiz-config/quiz-config.component';
import { AuthInterceptor } from './services/auth-interceptor.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { UnauthorisedDialogComponent } from './components/dialogs/unauthorised-dialog/unauthorised-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    LogoutComponent,
    RegisterComponent,
    SettingsComponent,
    GameComponent,
    QuizmasterComponent,
    QuizConfigComponent,
    UnauthorisedDialogComponent,

  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule,
    FlexLayoutModule,
  ],

  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-GB',
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

