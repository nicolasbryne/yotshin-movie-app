import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrarySettingComponent } from './library-setting.component';

describe('LibrarySettingComponent', () => {
  let component: LibrarySettingComponent;
  let fixture: ComponentFixture<LibrarySettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibrarySettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibrarySettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
