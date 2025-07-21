import { TestBed } from '@angular/core/testing';

import { Link } from './link';

describe('Link', () => {
  let service: Link;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Link);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
