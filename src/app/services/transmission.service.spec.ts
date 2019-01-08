import { TestBed, inject } from '@angular/core/testing';

import { TransmissionService } from './transmission.service';

describe('TransmissionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransmissionService]
    });
  });

  it('should be created', inject([TransmissionService], (service: TransmissionService) => {
    expect(service).toBeTruthy();
  }));
});
