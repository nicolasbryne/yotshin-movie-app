import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMetainfoComponent } from './edit-metainfo.component';

describe('EditMetainfoComponent', () => {
  let component: EditMetainfoComponent;
  let fixture: ComponentFixture<EditMetainfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditMetainfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMetainfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
