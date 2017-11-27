import { Component, OnInit } from '@angular/core';
import { ModalsService } from '../../modals.service'
import { Log } from 'ng2-logger';

@Component({
  selector: 'app-percentage-bar',
  templateUrl: './percentage-bar.component.html',
  styleUrls: ['./percentage-bar.component.scss']
})
export class PercentageBarComponent implements OnInit {

  public syncPercentage: number = 0;
  public syncString: string;

  private logger: any = Log.create('app-percentage-bar.component');
  constructor( private _modalService: ModalsService) { }

  ngOnInit() {
    // update progress bar blockstatus
    this._modalService.getProgress().subscribe(
      progress => this.updateProgress(<number>progress)
    );
  }

  /**
   * Update sync progress
   * @param {number} number  The sync percentage
   */
  // @TODO create sparate component to display process
  updateProgress(progress: number): void {
    this.logger.d('updateProgress', progress);
    this.syncPercentage = progress;
    this.syncString = progress === 100
      ? 'blockchain fully synced'
      : `${progress.toFixed(2)} %`
  }
}
