import { TestBed, inject } from '@angular/core/testing';

import { ExhibitService } from './exhibit.service';

describe('ExhibitService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExhibitService]
    });
  });

  it('should be created', inject([ExhibitService], (service: ExhibitService) => {
    expect(service).toBeTruthy();
  }));
});
