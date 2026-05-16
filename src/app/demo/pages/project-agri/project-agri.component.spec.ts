import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAgriComponent } from './project-agri.component';

describe('ProjectAgriComponent', () => {
  let component: ProjectAgriComponent;
  let fixture: ComponentFixture<ProjectAgriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectAgriComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectAgriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
