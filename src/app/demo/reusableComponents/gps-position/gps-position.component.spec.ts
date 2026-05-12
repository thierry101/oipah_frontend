import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsPositionComponent } from './gps-position.component';

describe('GpsPositionComponent', () => {
  let component: GpsPositionComponent;
  let fixture: ComponentFixture<GpsPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GpsPositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GpsPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
