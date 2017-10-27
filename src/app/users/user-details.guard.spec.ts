import { TestBed, async, inject } from '@angular/core/testing';

import { UserDetailsGuard } from './user-details.guard';

describe('UserDetailsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserDetailsGuard]
    });
  });

  it('should ...', inject([UserDetailsGuard], (guard: UserDetailsGuard) => {
    expect(guard).toBeTruthy();
  }));
});
