import * as fromUsersStore from './users-store/users-store.reducer';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule, ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

export const getUsersFeatureState = createFeatureSelector<fromUsersStore.UsersState>('users');

export const getUserEntities = createSelector(getUsersFeatureState, fromUsersStore.getUserEntities);
