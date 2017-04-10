import { Injectable } from '@angular/core';
import { Transaction, deserialize, TEST_TXS_JSON } from './transaction';

@Injectable()
export class TransactionService {

	/* 
		Stores transactions objects.
	*/
	txs : Transaction[] = [];
	tx_count : number = 0;
	page : number = 0;
	total_page_count : number = 0;

	//This is crappy but ngFor is a dick
	page_array : number[] = [0];

	/* 
		How many transactions do we display per page and keep in memory at all times. When loading more transactions they are fetched JIT and added to txs.
	*/
	MAX_TXS_PER_PAGE : number = 3;



  constructor() { 
  	this.initializeTestData();
  	console.log("page count" + this.updatePageCount());
   }


   //Pull test data and populate array of txs.
   initializeTestData() : void {
  	this.loadTestTransaction(0);
  	this.tx_count = TEST_TXS_JSON.length;
   }

   loadTestTransaction(index_start : number) : void {
   	for(var i = 0; i < this.MAX_TXS_PER_PAGE; i++){
  		let json = TEST_TXS_JSON[index_start + i];
    	this.addTransaction(json);
  	}
   }
/*


  _    _ _______ _____ _      
 | |  | |__   __|_   _| |     
 | |  | |  | |    | | | |     
 | |  | |  | |    | | | |     
 | |__| |  | |   _| |_| |____ 
  \____/   |_|  |_____|______|
                              
                              
*/

	changePage(page : number){
		this.page = page;

		this.deleteTransactions();

		//page = 0 (first page) => loadTransactionsRPC(MAX_TXS_PER_PAGE, 0) => (0,10)
		//page = 1 (second page) => loadTransactionsRPC(MAX_TXS_PER_PAGE, 1 * MAX_TXS_PER_PAGE) (10, 20)
		this.loadTransactionsRPC(page * this.MAX_TXS_PER_PAGE);
	}

	updatePageCount() : number{
		this.total_page_count = Math.ceil(this.tx_count/this.MAX_TXS_PER_PAGE);

		this.crappyPaginationHack();
		
  		if(this.page != 0){
  			let residual = this.tx_count % this.MAX_TXS_PER_PAGE; 
  			if(residual == 0) //new page
  				this.page++; 

		}
		return this.total_page_count;
  	}

  	crappyPaginationHack(){
  		for(var i = 0; i < this.total_page_count; i++){
  			this.page_array[i] = i;
		}
  	}

  	deleteTransactions(){
  		this.txs = [];
  	}
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

  loadTransactionsRPC(index_start : number) : void{

  	this.loadTestTransaction(index_start);
  	//loadTransactionsRPC should call listtransaction amount index_start.
  	//return this.txs;
  }

  loadTransactionCountRPC() : void{
  	//call getwalletinfo txcount
  	this.tx_count = TEST_TXS_JSON.length-1;
  }

  //Deserializes JSON objects to Transaction classes. 
  //This does not enforce statically typed stuff at runtime tho, there is one lib called TypedJSON that does.
  addTransaction(json: Object) : void {
  	let instance = deserialize(json, Transaction);
  	if(typeof instance.txid == "undefined")
  		return;

  	this.txs.splice(0,0,instance);
  }

/*


   _____ _____ _____ _   _          _      
  / ____|_   _/ ____| \ | |   /\   | |     
 | (___   | || |  __|  \| |  /  \  | |     
  \___ \  | || | |_ | . ` | / /\ \ | |     
  ____) |_| || |__| | |\  |/ ____ \| |____ 
 |_____/|_____\_____|_| \_/_/    \_\______|
                                           
                                           

*/
  signal_newTransaction() : void {
  	/*
  		When bitcoind finds a new transaction, it must signal it to the GUI.
  		We constantly need to be aware of the latest transactions for a good UX, 
  		another good reason is that the RPC call listtransactions uses indexes to track the transactions. 
  		So if we're not aware of the latest transaction, some shitty stuff may happen when loading more transactions.
  		example: (tx_NEW0, tx_old1, tx_old2, tx_old3, tx_old4)
  		If the GUI is not aware tx_NEW0 and assumes that tx_old1 has index 0 (in reality it would be 1) then it could break pagination.
  		Assume each page displays 2 transactions, if we were not aware of the new transaction then every index is shifted by one and we would load a duplicate.
  		tx_old2 would be retrieved again, while already being displayed. This can serve as a failsafe to check if our signalling still works timely and properly.

  		Note: when opening a transaction we must 

  		Pseudo code
  		//only delete transaction records when we are on the first page. If you're on page five and the tx records start shifting due to new transactions, you might get annoyed as it goes out of focus.
  		updateTxCount();
  			if(onFirstPageOfTransactions) 
  				deleteExcessTransactionsFromTxs(); //to keep GUI lightweight
  				loadTransactionOverRPC(0,1); //load latest record.
  			else
				doNothing();
		signal_updateBalance();

  		


  	*/
  }

  signal_updateBalance() : void {
  	/* 
  		When a new transaction arrives, we must update the balance. Might be worth ignoring this on IBD.
  	*/
  }

}
