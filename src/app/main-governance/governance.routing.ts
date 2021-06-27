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
  LABEL_ABOUT = 'About & Howto'
}

export const routeData: RouteItem[] = [
  { path: 'proposals',
    text: TextContent.LABEL_PROPOSALS,
    icon: 'part-vote',
    lazyModule: () => import('./proposals/proposals.module').then(m => m.ProposalsModule),
    isFallbackRoute: true
  },
  { path: 'about-howto',
    text: TextContent.LABEL_ABOUT,
    icon: 'part-circle-info',
    lazyModule: () => import('./about-howto/about-howto.module').then(m => m.AboutHowtoModule),
  }
];
