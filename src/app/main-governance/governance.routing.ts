import { LoadChildren } from '@angular/router';


interface RouteItem {
  path: string;
  text: string;
  icon?: string;
  lazyModule: LoadChildren,
  isFallbackRoute?: boolean
}

enum TextContent {
  LABEL_OVERVIEW = 'Overview',
  LABEL_CURRENT = 'Current/Active',
  LABEL_PAST = 'Previous',
}

export const routeData: RouteItem[] = [
  { path: 'overview',
    text: TextContent.LABEL_OVERVIEW,
    icon: 'part-overview',
    lazyModule: () => import('./overview/overview.module').then(m => m.OverviewModule),
    isFallbackRoute: true
  },
  { path: 'current',
    text: TextContent.LABEL_CURRENT,
    icon: 'part-next_double',
    lazyModule: () => import('./current/current.module').then(m => m.CurrentModule),
  },
  { path: 'past',
    text: TextContent.LABEL_PAST,
    icon: 'part-previous-double',
    lazyModule: () => import('./previous/previous.module').then(m => m.PreviousModule),
  },
];
