import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule} from '@angular/material/icon';
import { MatToolbarModule} from '@angular/material/toolbar';
import { MatListModule} from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelectModule} from '@angular/material/select';
import { MatTableModule } from '@angular/material/table'

import {FlexLayoutModule } from '@angular/flex-layout';

import {MatGridListModule} from '@angular/material/grid-list';
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

const materialModules = [
  MatIconModule,
  MatToolbarModule,
  MatListModule,
  MatButtonModule,
  MatMenuModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatDialogModule,
  MatProgressBarModule,
  MatSelectModule,
  MatGridListModule,
  MatTableModule,
  MatPaginatorModule,

  MatRadioModule,
  MatCheckboxModule,
  FlexLayoutModule,
  
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    materialModules

  ],
  exports: [
    materialModules
  ]
})
export class AngularMaterialModule { }
