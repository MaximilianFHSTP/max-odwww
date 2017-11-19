import { TestBed, inject } from '@angular/core/testing';

import { NativeCommunicationService } from './native-communication.service';

describe('NativeCommunicationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NativeCommunicationService]
    });
  });

  it('should be created', inject([NativeCommunicationService], (service: NativeCommunicationService) => {
    expect(service).toBeTruthy();
  }));
});
