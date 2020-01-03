import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-count-badge',
  templateUrl: './count-badge.component.html',
  styleUrls: ['./count-badge.component.scss']
})
export class CountBadgeComponent {
  @Input() count: number = 0;
}
