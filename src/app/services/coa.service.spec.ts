import { TestBed, inject } from '@angular/core/testing';

import { CoaService } from './coa.service';

describe('CoaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoaService]
    });
  });

  it('should be created', inject([CoaService], (service: CoaService) => {
    expect(service).toBeTruthy();
  }));
});
