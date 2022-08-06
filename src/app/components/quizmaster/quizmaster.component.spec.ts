import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizmasterComponent } from './quizmaster.component';

describe('QuizmasterComponent', () => {
  let component: QuizmasterComponent;
  let fixture: ComponentFixture<QuizmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizmasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
