import { TestBed, inject } from '@angular/core/testing';

import { ExhibitSocketService } from './exhibit-socket.service';

describe('ExhibitSocketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExhibitSocketService]
    });
  });

  it('should be created', inject([ExhibitSocketService], (service: ExhibitSocketService) => {
    expect(service).toBeTruthy();
  }));
});
