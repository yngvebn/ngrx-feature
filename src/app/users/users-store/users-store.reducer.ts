import { User } from './models/user';
import * as usersActions from './users-store.actions';
import { createSelector } from '@ngrx/store';

export interface UsersState {
    users: User[];
    loading: boolean;
}

export const initialState: UsersState = {
    users: [],
    loading: false,
}

export function usersReducer(state: UsersState = initialState, action: usersActions.Actions): UsersState {
    switch (action.type) {
        case usersActions.LOAD_USERS: {
            return {
                ...state,
                loading: true
            };
        }
        case usersActions.LOAD_USERS_COMPLETE: {
            return {
                ...state,
                users: action.users,
                loading: false
            };
        }
        default:
            return state;
    }
}

export const getIsLoading = (state: UsersState) => state.loading;

export const getUserEntities = (state: UsersState) => state.users;
