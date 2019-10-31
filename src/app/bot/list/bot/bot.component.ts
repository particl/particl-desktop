import { Component, Input } from '@angular/core';
import { Bot } from 'app/core/bot/bot.model';
import { BotService } from 'app/core/bot/bot.module';

@Component({
  selector: 'app-bot-item',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.scss']
})
export class BotComponent {

  @Input() bot: Bot;

  constructor(
    private botService: BotService
  ) {}

  async enable() {
    this.bot = await this.botService.enable(this.bot.address);
  }

  async disable() {
    this.bot = await this.botService.disable(this.bot.address);
  }
}
