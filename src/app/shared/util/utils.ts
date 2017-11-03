export class Amount {

  constructor(private amount: number) {

  }

  public getAmount() {
    return this.amount;
  }

  public getIntegerPart(): number {
    return +this.splitAmountByDot(this.amount);
  }
  // e.g  25.69323 -> 69323
  public getFractionalPart(): number {
    return +this.splitAmountByDot(this.amount, true);
  }

  public splitAmountByDot(int: number, afterDot?: boolean): String {
    if ((int.toString()).indexOf('.') !== -1) {
      return (int.toString()).split('.')[+(!!afterDot)]; // undefined -> 1 -> 0
    } else if (int > 0) {
      return int.toString();
    }
    return '0';
  }

}

export class Duration {

  constructor(private duration: number) {
    /*
      test time formatter
      this.log.d(`setting expectedtime 1 year and 6 months = ${this.formatTime(47304000)}`);
      this.log.d(`setting expectedtime 10 months and 11 days = ${this.formatTime(27247838)}`);
      this.log.d(`setting expectedtime 1 minute = ${this.formatTime(60)}`);
    */
  }

  public getReadableDuration(): String {
    return this.formatTime(this.duration);
  }

    // seconds into readable format
    private formatTime(seconds: number): String {
      const years: number = Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24 /*hour*/ * 365/*days*/));
      const months: number =  Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24 /*hours*/ * 30.5/*months*/)) - years * 12;
      const days: number =  Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24/*hours*/)) - months * 30.5;
      const hours: number =  Math.floor(seconds / (60 /*s*/ * 60/*min*/)) - days * 24;
      const minutes: number =  Math.floor(seconds / (60/*s*/)) - hours * 60;

      if (years > 0) {
        return  years + ' years' + (months > 0 ? ' and ' + Math.ceil(months) + ' months' : '');
      } else if (months > 0) {
        return  months + ' months' + (days > 0 ? ' and ' + Math.ceil(days) + ' days' : '');
      } else if (days > 0) {
        return  days + ' days' + (hours > 0 ? ' and ' + Math.ceil(hours) + ' hours' : '');
      } else if (hours > 0) {
        return  hours + ' hours' + (minutes > 0 ? ' and ' + Math.ceil(minutes) + ' minutes' : '');
      } else if (minutes > 0) {
        return  minutes + ' minutes';
      }
    }

  }
