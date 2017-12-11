import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'accordion-group',
  templateUrl: './accordion-group.component.html',
  styleUrls: ['./accordion-group.component.scss']
})
export class AccordionGroupComponent implements OnInit {

  @Input()
  isCollapsed: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  toggleCollapse(collapse?: boolean) {
    this.isCollapsed = String(collapse) !== 'undefined' ? collapse : !this.isCollapsed;
  }

}
