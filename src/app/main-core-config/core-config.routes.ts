

export const childRoutes = [
  { path: 'startup', loadChildren: () => import('./settings-pages/startup/startup.module').then(m => m.CoreStartupModule), data: {pathName: 'startup'} },
  { path: 'network', loadChildren: () => import('./settings-pages/network/network.module').then(m => m.CoreNetworkModule), data: {pathName: 'network'} },
  { path: 'authentication', loadChildren: () => import('./settings-pages/authentication/authentication.module').then(m => m.CoreAuthenticationModule), data: {pathName: 'authentication'} },
  { path: 'proxy', loadChildren: () => import('./settings-pages/proxy/proxy.module').then(m => m.CoreProxyModule), data: {pathName: 'proxy/tor'} },
  { path: 'updates', loadChildren: () => import('./settings-pages/updates/updates.module').then(m => m.CoreUpdatesModule), data: {pathName: 'updates'} },
  // { path: 'verification', loadChildren: () => import('./settings-pages/verification/verification.module').then(m => m.CoreVerificationModule), data: {pathName: 'verification'} },
  // { path: '**', redirectTo: 'startup' },
  { path: '', redirectTo: 'startup', pathMatch: 'full'},
];
