import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrainViewComponent } from './brain-view.component';

describe('BrainViewComponent', () => {
  let component: BrainViewComponent;
  let fixture: ComponentFixture<BrainViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrainViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrainViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
