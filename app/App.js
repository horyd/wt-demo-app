import React from "react";
import { HashRouter, Route, Switch } from 'react-router-dom';

//Views
import Layout from "./Layout";
import Home from "./views/Home";
import Wallet from "./views/Wallet";
import Explorer from "./views/Explorer";
import Hotel from "./views/Hotel";
import Config from "./views/Config";
import Search from "./views/Search";
import MyBookings from "./views/MyBookings";

import { ToastContainer, toast } from 'react-toastify';
import Tx from './components/Tx'

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider || WEB3_PROVIDER));

export default class App extends React.Component {

	constructor() {
    super();
    this.state = {
      pendingTxHashes: [],
      txReceipts: [],
      wallet: window.localStorage.wallet ? JSON.parse(window.localStorage.wallet) : null
    };
  }

	transactionHashCallback(action) {
		return (hash) => {
			console.log('got hash');
			console.log(hash);
			toast.info('Sent Tx to ' + action);
			toast.info(<Tx hash={hash} />);
			Utils.decodeTxInput(hash, (window.localStorage.wtIndexAddress || WTINDEX_ADDRESS), this.state.wallet.address, web3)
			.then(decodedTx => {
				console.log('App.addPendingTx decodedTx');
				console.log(decodedTx);
				this.setState({pendingTxHashes: this.state.pendingTxHashes.concat([decodedTx])}, () => window.localStorage.pendingTxHashes = this.state.pendingTxHashes);
			})
		}
	}

	receiptCallback(action) {
		return (receipt) => {
			console.log('got receipt');
      console.log(receipt);
      toast.success('Mined TX to ' + action);
			toast.success(<Tx hash={receipt.transactionHash} />);
      this.setState({
				pendingTxHashes: this.state.pendingTxHashes.filter(e => e.hash != receipt.transactionHash),
				txReceipts: this.state.txReceipts.concat([receipt])
			}, () => {
				window.localStorage.pendingTxHashes = this.state.pendingTxHashes;
				window.localStorage.txReceipts = this.state.txReceipts;
			});
		}
	}

	errorCallback(action) {
		return async (error) => {
			//if it's a "not mined within 50 blocks" error, perform a check
			if(error.toString().includes("Transaction was not mined within 50 blocks")) {
				let receipt = await web3.eth.getTransactionReceipt(txHash);
				console.log('double checking receipt');
				console.log(receipt);
				//it was in fact mined!
				if(receipt && receipt.blockNumber) {
					toast.success('Mined TX to ' + action);
					this.setState({ pendingTxHashes: this.state.pendingTxHashes.filter(e => e.hash != receipt.transactionHash)}, () => window.localStorage.pendingTxHashes = this.state.pendingTxHashes);
					this.setState({ txReceipts: this.state.txReceipts.concat([receipt])}, () => window.localStorage.txReceipts = this.state.txReceipts);
					return;
				}
			}
			toast.error('Error in TX to ' + action);
			toast.error(error.toString());
			this.setState({ pendingTxHashes: this.state.pendingTxHashes.filter(e => e.hash != txHash)}, () => window.localStorage.pendingTxHashes = this.state.pendingTxHashes)
		}

	}

	getCallbacks(action) {
		let self = this;
		return {
			receipt: self.receiptCallback(action).bind(self),
			transactionHash: self.transactionHashCallback(action).bind(self),
			error: self.errorCallback(action).bind(self)
		}
	}

	render() {
    console.log('App this.state.pendingTxHashes');
    console.log(this.state.pendingTxHashes);
		return (
      <HashRouter>
        <Layout pendingTxHashes={this.state.pendingTxHashes}>
          <ToastContainer style={{zIndex: 2000}}/>
          <Switch>
            <Route exact path="/" component={Home}></Route>
            <Route path="/wallet" component={Wallet}></Route>
						<Route path="/explorer" component={Explorer}></Route>
            <Route path="/mybookings" component={MyBookings}></Route>
            <Route path="/hotel" render={() => <Hotel getCallbacks={this.getCallbacks.bind(this)} pendingTxHashes={this.state.pendingTxHashes}/>}></Route>
            <Route path="/config" component={Config}></Route>
            <Route path="/search" component={Search}></Route>
          </Switch>
        </Layout>
      </HashRouter>
		);
	}
}
