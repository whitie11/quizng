import { Injectable } from '@angular/core';
import { stringToKeyValue } from '@angular/flex-layout/extended/style/style-transforms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UnauthorisedDialogComponent } from '../components/dialogs/unauthorised-dialog/unauthorised-dialog.component';
import { TokenStorageService } from './token-storage.service';


@Injectable({
  providedIn: 'root'
})
export class RoleGuardGuard implements CanActivate {

  userRole = '';

  constructor(
    private tokenService: TokenStorageService,
    private dialogRef: MatDialog
    ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.hasRole(route);
  }

  private hasRole(route: ActivatedRouteSnapshot): boolean {
    this.userRole = this.tokenService.getRole();
    if (this.userRole == ''){
      return false;
    }

    const expectedRoles: string[] = route.data['expectedRoles'];
    const message: string = route.data['message'];
    const roleMatch = expectedRoles.findIndex(element => element==this.userRole);
    if (roleMatch <0) {
      this.showUnauthorisedDialog(message);
      return false
    }
      else return true
  }

  private showUnauthorisedDialog(message: string){
    const dialogRef = this.dialogRef.open(UnauthorisedDialogComponent,
      {
        data: {
          message: message
        }
      })
  }

}
