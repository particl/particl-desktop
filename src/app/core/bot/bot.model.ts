export class Bot {

  get address(): string { return this.bot.address }
  get name(): string { return this.bot.name }
  get description(): string { return this.bot.description }
  get version(): string { return this.bot.version }
  get type(): string { return this.bot.type }
  get image(): string { return this.bot.image }
  get enabled(): boolean { return this.bot.wallets.length > 0 }

  constructor(private readonly bot: any) {}
}
