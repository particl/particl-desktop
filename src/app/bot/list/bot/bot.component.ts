import { Component, Input } from '@angular/core';
import { Bot } from 'app/core/bot/bot.model';
import { BotService } from 'app/core/bot/bot.service';
import { SnackbarService } from 'app/core/core.module';
import { Log } from 'ng2-logger';

@Component({
  selector: 'app-bot-item',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.scss']
})
export class BotComponent {

  log: any = Log.create('bot.component');

  @Input() bot: Bot;

  public requestInProgress: boolean = false;

  constructor(
    private botService: BotService,
    private snackbarService: SnackbarService
  ) {}

  async enable() {
    this.requestInProgress = true;
    try {
      this.bot = await this.botService.enable(this.bot.address);
    } catch (e) {
      this.snackbarService.open('Error enabling bot.');
      this.log.er(e);
    }
    this.requestInProgress = false;
  }

  async disable() {
    this.requestInProgress = true;
    try {
      this.bot = await this.botService.disable(this.bot.address);
    } catch (e) {
      this.snackbarService.open('Error disabling bot.');
      this.log.er(e);
    }
    this.requestInProgress = false;
  }
}
