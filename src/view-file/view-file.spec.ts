import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFile } from './view-file';

describe('ViewFile', () => {
  let component: ViewFile;
  let fixture: ComponentFixture<ViewFile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewFile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
