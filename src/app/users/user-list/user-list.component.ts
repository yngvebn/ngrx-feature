import { Observable } from 'rxjs/Observable';
import { User } from './../users-store/models/user';
import { Store } from '@ngrx/store';
import { UsersState } from '../users-store/users-store.reducer';
import * as fromUsers from '../users.store';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  users$: Observable<User[]>;

  constructor(public store: Store<UsersState>) {
    this.users$ = store.select(fromUsers.getUserEntities);
  }

  ngOnInit() {
  }

}
