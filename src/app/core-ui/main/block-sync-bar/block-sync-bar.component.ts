import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Log } from 'ng2-logger';
import { BlockStatusService } from 'app/core/rpc/rpc.module';
import { takeWhile, distinctUntilChanged } from 'rxjs/operators';


@Component({
  selector: 'block-sync-bar',
  templateUrl: './block-sync-bar.component.html',
  styleUrls: ['./block-sync-bar.component.scss']
})
export class BlockSyncBarComponent implements OnInit, OnDestroy {

  private log: any = Log.create('block-sync-bar.component');
  private destroyed: boolean = false;

  @Input() sidebar: boolean = false;

  /* ui state */
  public initialized: boolean = false; // hide if no progress has been retrieved yet

  /* block state */
  public syncPercentage: number = 0;
  public syncString: string;

  constructor( private _blockStatusService: BlockStatusService) { this.log.d('initiated block-sync-bar'); }

  ngOnInit(): void {
    /* Hook BlockStatus -> open syncing modal */
    this._blockStatusService.statusUpdates.asObservable().pipe(
      takeWhile(() => !this.destroyed)
    ).subscribe(status => {
      this.log.d(`updating block-sync-bar`);
      this.updateProgress(status.syncPercentage);
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
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
