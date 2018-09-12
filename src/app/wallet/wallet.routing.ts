import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProposalsComponent } from './proposals/proposals.component';
import { AddProposalComponent } from './proposals/add-proposal/add-proposal.component';
import { OverviewComponent } from './overview/overview.component';
import { ReceiveComponent, SendComponent, HistoryComponent, AddressBookComponent } from './wallet/wallet.module';

const wallet_routes_children =
  [
    { path: '', redirectTo: 'overview', pathMatch: 'full' },
    { path: 'overview', component: OverviewComponent, data: { title: 'Overview' } },
    { path: 'receive', component: ReceiveComponent, data: { title: 'Receive' } },
    { path: 'send', component: SendComponent, data: { title: 'Send' } },
    { path: 'history', component: HistoryComponent, data: { title: 'History' } },
    { path: 'address-book', component: AddressBookComponent, data: { title: 'Address Book' } },
    { path: 'proposals', component: ProposalsComponent, data: { title: 'Proposals' } },
    { path: 'proposal', component: AddProposalComponent, data: { title: 'Proposals › Submit new' } }
  ];

export const wallet_routing: ModuleWithProviders = RouterModule.forChild(wallet_routes_children);
