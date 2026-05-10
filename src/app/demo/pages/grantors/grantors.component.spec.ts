import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrantorsComponent } from './grantors.component';

describe('GrantorsComponent', () => {
  let component: GrantorsComponent;
  let fixture: ComponentFixture<GrantorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrantorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrantorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
