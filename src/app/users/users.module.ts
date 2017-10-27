import { UserDetailsGuard } from './user-details.guard';
import { UserListGuard } from './user-list.guard';
import { usersReducer } from './users-store/users-store.reducer';
import { UsersStoreEffects } from './users-store/users-store.effects';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    component: UserListComponent,
    canActivate: [UserListGuard],
  }
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature('users', usersReducer),
    EffectsModule.forFeature([UsersStoreEffects]),
    RouterModule.forChild(routes)
  ],
  declarations: [UserListComponent, UserDetailsComponent],
  providers: [UserListGuard]
})
export class UsersModule { }
