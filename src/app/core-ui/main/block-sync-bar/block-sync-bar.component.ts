import { Component, OnInit, Input } from '@angular/core';
import { Log } from 'ng2-logger';

import { BlockStatusService } from '../../../core/rpc/rpc.module';

@Component({
  selector: 'block-sync-bar',
  templateUrl: './block-sync-bar.component.html',
  styleUrls: ['./block-sync-bar.component.scss']
})
export class BlockSyncBarComponent implements OnInit {

  private log: any = Log.create('app-block-sync-bar.component');

  @Input() sidebar: boolean = false;

  /* ui state */
  public initialized: boolean = false; // hide if no progress has been retrieved yet

  /* block state */
  public syncPercentage: number = 0;
  public syncString: string;

  constructor( private _blockStatusService: BlockStatusService) { this.log.d('initiated block-sync-bar'); }

  ngOnInit(): void {
    this.log.d('initiated block-sync-bar');
    /* Hook BlockStatus -> open syncing modal */
    this._blockStatusService.statusUpdates.asObservable().subscribe(status => {
      this.log.d(`updating block-sync-bar`);
      this.updateProgress(status.syncPercentage);
    });
  }

  /**
   * Update sync progress
   * @param {number} number  The sync percentage
   */
  // @TODO create sparate component to display process
  updateProgress(progress: number): void {
    this.log.d('updateProgress', progress);
    this.initialized = true;
    this.syncPercentage = progress;
    this.syncString = progress === 100
      ? 'Fully synced'
      : `${progress.toFixed(2)} %`
  }
}
