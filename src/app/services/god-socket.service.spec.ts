import { TestBed, inject } from '@angular/core/testing';

import { GodSocketService } from './god-socket.service';

describe('GodSocketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GodSocketService]
    });
  });

  it('should be created', inject([GodSocketService], (service: GodSocketService) => {
    expect(service).toBeTruthy();
  }));
});
