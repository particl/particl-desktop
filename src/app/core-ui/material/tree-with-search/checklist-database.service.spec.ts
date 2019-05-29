import { TestBed } from '@angular/core/testing';

import { ChecklistDatabaseService } from './checklist-database.service';
import { categories } from 'app/_test/core-test/market-test/category-test/mock-data';
import { Category } from 'app/core/market/api/category/category.model';

describe('ChecklistDatabaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChecklistDatabaseService = TestBed.get(ChecklistDatabaseService);
    expect(service).toBeTruthy();
  });

  it('should initialize method set all the tree requirement', () => {
    const service: ChecklistDatabaseService = TestBed.get(ChecklistDatabaseService);
    expect(service).toBeTruthy();
    expect(service.data).toEqual([]);
    const Categories = categories.map((category) => new Category(category))
    service.initialize(Categories);
    expect(service.data).not.toEqual([]);
    expect(service.data.length).toEqual(1);
  });

});
