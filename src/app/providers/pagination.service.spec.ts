import { TestBed, inject } from '@angular/core/testing';

import { PaginationService } from './pagination.service';

describe('PaginationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaginationService]
    });
  });

  it('should ...', inject([PaginationService], (service: PaginationService) => {
    expect(service).toBeTruthy();
  }));
});
