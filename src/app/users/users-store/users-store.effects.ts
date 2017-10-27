import { User } from './models/user';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import * as usersActions from './users-store.actions';


@Injectable()
export class UsersStoreEffects {

    @Effect() fetchUsers$ = this.actions$
        .ofType(usersActions.LOAD_USERS)
        .switchMap(() => this.http.get<{ info: any, results: User[] }>('https://randomuser.me/api/?results=10&seed=abc')
            .map(res => new usersActions.LoadUsersComplete(res.results)));

    constructor(private actions$: Actions, private http: HttpClient) { }
}
