import { TestBed, inject } from '@angular/core/testing';

import { NativeResponseService } from './native-response.service';

describe('NativeResponseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NativeResponseService]
    });
  });

  it('should be created', inject([NativeResponseService], (service: NativeResponseService) => {
    expect(service).toBeTruthy();
  }));
});
