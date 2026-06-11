import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HavestSaleComponent } from './havest-sale.component';

describe('HavestSaleComponent', () => {
  let component: HavestSaleComponent;
  let fixture: ComponentFixture<HavestSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HavestSaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HavestSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
