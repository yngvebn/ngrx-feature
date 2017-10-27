import { User } from './models/user';
import { Action } from '@ngrx/store';

export const LOAD_USERS = '[Users] Load';
export const LOAD_USERS_COMPLETE = '[Users] Load:Complete';

export class LoadUsers implements Action {
    readonly type = LOAD_USERS;
}

export class LoadUsersComplete implements Action {
    readonly type = LOAD_USERS_COMPLETE;
    constructor(public users: User[]) { }
}

export type Actions = LoadUsers | LoadUsersComplete;
