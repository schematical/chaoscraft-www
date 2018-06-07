import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotVisionComponent } from './bot-vision.component';

describe('BotVisionComponent', () => {
  let component: BotVisionComponent;
  let fixture: ComponentFixture<BotVisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotVisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotVisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
