import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldTopViewComponent } from './world-top-view.component';

describe('WorldTopViewComponent', () => {
  let component: WorldTopViewComponent;
  let fixture: ComponentFixture<WorldTopViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorldTopViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorldTopViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
