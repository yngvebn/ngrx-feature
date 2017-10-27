import { LoadUsers } from './users-store/users-store.actions';
import { UsersState } from './users-store/users-store.reducer';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserListGuard implements CanActivate {
  constructor(public store: Store<UsersState>) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this.store.dispatch(new LoadUsers());

    return true;

  }
}
