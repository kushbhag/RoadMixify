import { TestBed } from '@angular/core/testing';

import { PlaylistGuard } from './playlist.guard';

describe('PlaylistGuard', () => {
  let guard: PlaylistGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PlaylistGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
