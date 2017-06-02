import { Injectable } from '@angular/core';

@Injectable()
export class BalanceService {

  balanceBeforePoint: number = 123000;
  balanceAfterPoint: number = 4586649;


  typeOfBalance: string;

  constructor() { }

  /*


  _____  _____   _____
 |  __ \|  __ \ / ____|
 | |__) | |__) | |
 |  _  /|  ___/| |
 | | \ \| |    | |____
 |_|  \_\_|     \_____|


*/

/*
	Load transactions over RPC, then parse JSON and call addTransaction to add them to txs array.

*/
  rpc_loadBalance(type: any) {

  }

/*


   _____ _____ _____ _   _          _
  / ____|_   _/ ____| \ | |   /\   | |
 | (___   | || |  __|  \| |  /  \  | |
 \___ \  | || | |_ | . ` | / /\ \ | |
 ____) |_| || |__| | |\  |/ ____ \| |____
|_____/|_____\_____|_| \_/_/    \_\______|



*/

  register_newBalanceService(/* RPC-service */): void {
    /*
      This function registers this balance service instance with the CENTRALIZED RPC-service which in turn will
      call all the signals when it receives updates.
      A central RPC-service is required for a good design, we want to maintain one connection to the RPC and
      not spawn a new one for each BalanceService.
    */
  }

  signal_updateBalance(): void {
    /*
      When a new transaction arrives, we must update the balance. Might be worth ignoring this on IBD.
  	*/
  }
}
