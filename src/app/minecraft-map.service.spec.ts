import { TestBed, inject } from '@angular/core/testing';

import { MinecraftMapService } from './minecraft-map.service';

describe('MinecraftMapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MinecraftMapService]
    });
  });

  it('should be created', inject([MinecraftMapService], (service: MinecraftMapService) => {
    expect(service).toBeTruthy();
  }));
});
