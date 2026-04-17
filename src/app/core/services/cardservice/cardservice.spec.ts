import { TestBed } from '@angular/core/testing';

import { Cardservice } from './cardservice';

describe('Cardservice', () => {
  let service: Cardservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cardservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
