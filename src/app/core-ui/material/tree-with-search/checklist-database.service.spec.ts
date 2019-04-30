import { TestBed } from '@angular/core/testing';

import { ChecklistDatabaseService } from './checklist-database.service';

describe('ChecklistDatabaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChecklistDatabaseService = TestBed.get(ChecklistDatabaseService);
    expect(service).toBeTruthy();
  });
});
