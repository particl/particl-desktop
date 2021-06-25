import { LoadChildren } from '@angular/router';


interface RouteItem {
  path: string;
  text: string;
  icon?: string;
  lazyModule: LoadChildren;
  isFallbackRoute?: boolean;
}

enum TextContent {
  LABEL_PROPOSALS = 'Proposals',
}

export const routeData: RouteItem[] = [
  { path: 'proposals',
    text: TextContent.LABEL_PROPOSALS,
    icon: 'part-star',
    lazyModule: () => import('./proposals/proposals.module').then(m => m.ProposalsModule),
  }
];
