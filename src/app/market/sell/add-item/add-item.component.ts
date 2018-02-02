import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  backToSell() {
    this.router.navigate(['/market/sell']);
  }

}
