import {
  trigger, state, style,
  animate, transition, keyframes
} from '@angular/animations';

export function flyInOut() {
  return trigger('flyInOut', [
    transition('* => next', [
      animate(300, keyframes([
        style({transform: 'translateX(100%)', offset: 0}),
        style({transform: 'translateX(15px)',  offset: 0.3}),
        style({transform: 'translateX(0)',     offset: 1.0})
      ]))
      ]),
    transition('* => prev', [
      animate(300, keyframes([
        style({transform: 'translateX(-100%)',     offset: 0}),
        style({transform: 'translateX(-15px)', offset: 0.3}),
        style({transform: 'translateX(0)',  offset: 1.0})
      ]))
    ])
  ]);
}

export function slideDown() {
  return trigger('slideDown', [
    state('*', style({ 'overflow-y': 'hidden' })),
    state('void', style({ 'overflow-y': 'hidden' })),
    transition('* => void', [
      style({ height: '*' }),
      animate(250, style({ height: 0, padding: 0 }))
    ]),
    transition('void => *', [
      style({ height: '0', padding: 0 }),
      animate(250, style({ height: '*', padding: '*' }))
    ])
  ]);
}
