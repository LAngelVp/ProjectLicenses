import { TestBed } from '@angular/core/testing';

import { CryptoLicenciaService } from './crypto-licencia.service';

describe('CryptoLicenciaService', () => {
  let service: CryptoLicenciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoLicenciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
