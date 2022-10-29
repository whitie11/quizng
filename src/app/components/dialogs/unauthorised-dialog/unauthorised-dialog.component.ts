import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/_models/dialogData';



@Component({
  selector: 'app-unauthorised-dialog',
  templateUrl: './unauthorised-dialog.component.html',
  styleUrls: ['./unauthorised-dialog.component.css']
})
export class UnauthorisedDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
  }


}
