import { TestBed, async, inject } from '@angular/core/testing';

import { UserListGuard } from './user-list.guard';

describe('UserListGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserListGuard]
    });
  });

  it('should ...', inject([UserListGuard], (guard: UserListGuard) => {
    expect(guard).toBeTruthy();
  }));
});
