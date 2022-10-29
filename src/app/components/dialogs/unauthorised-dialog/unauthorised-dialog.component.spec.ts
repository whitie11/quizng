import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorisedDialogComponent } from './unauthorised-dialog.component';

describe('UnauthorisedDialogComponent', () => {
  let component: UnauthorisedDialogComponent;
  let fixture: ComponentFixture<UnauthorisedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnauthorisedDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthorisedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
