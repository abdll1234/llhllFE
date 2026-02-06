import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Upload4 } from './upload4';

describe('Upload4', () => {
  let component: Upload4;
  let fixture: ComponentFixture<Upload4>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Upload4]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Upload4);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
