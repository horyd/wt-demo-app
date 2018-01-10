import React from 'react';
import { Link } from 'react-router-dom';
import ReactModal from 'react-modal';
import { Component } from 'react';
import ReactDOM from 'react-dom';
import { Carousel } from 'react-responsive-carousel';

import moment from 'moment';
import DateRangePicker from 'react-dates/lib/components/DateRangePicker';
import BookUnit from '../components/BookUnit';
import Address from '../components/Address';
import { ToastContainer, toast } from 'react-toastify';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider || WEB3_PROVIDER));

import Select from 'react-select';
var _ = require('lodash');

let WTUtils = Utils;

export default class MyBookings extends React.Component {

    constructor() {
      super();
      let keyStore;
      if(window.localStorage.wallet) {
        keyStore = JSON.parse(window.localStorage.wallet);
      }
      this.state = {
        indexAddress: '0x0000000000000000000000000000000000000000',
        hotels: [],
        hotelNames: [],
        bookingTxs: [],
        transaction: {},
        importKeystore: keyStore,
        section: 'hotels',
        hotelSection: 'list',
        hotelManager: {},
        loading: false
      }
    }

    async componentWillMount() {
        let address = (this.state.importKeystore ? this.state.importKeystore.address : '0x0000000000000000000000000000000000000000');
        let hotelManager = new HotelManager({
          indexAddress: window.localStorage.wtIndexAddress || WTINDEX_ADDRESS,
          owner: address,
          web3: web3,
          gasMargin: 1.5
        });
        hotelManager.setWeb3(web3);
        let bookingData = new BookingData(web3);
        let user = new User({
          account: address,       // Client's account address
          gasMargin: 2,               // Multiple to increase gasEstimate by to ensure tx success.
          tokenAddress: window.localStorage.lifTokenAddress || LIFTOKEN_ADDRESS,  // LifToken contract address
          web3: web3                     // Web3 object instantiated with a provider
        })
        await this.setState({hotelManager: hotelManager, bookingData: bookingData, user: user});
        await this.loadHotels();
        await this.loadTxs();
    }

    async loadTxs() {
      var self = this;
      let network = await web3.eth.net.getNetworkType();
      self.setState({loading: true});
      let txs = await Utils.getBookingTransactions(
        '0x'+self.state.importKeystore.address,
        (window.localStorage.wtIndexAddress || WTINDEX_ADDRESS),
        WTINDEX_BLOCK,
        web3,
        network);
        console.log('got TXs');
        console.log(txs);
      self.setState({bookingTxs: txs, loading: false});
    }

    async loadHotels() {
      var self = this;
      self.setState({loading: true});
      var hotelsAddrs = await self.state.hotelManager.WTIndex.methods.getHotels().call();
      hotelsAddrs = hotelsAddrs.filter(addr => addr !== "0x0000000000000000000000000000000000000000");
      var hotels = [];
      let totalHotels = hotelsAddrs.length;
      for (var i = 0; i <= totalHotels - 1; i++)
        hotels.push(await self.getHotelInfo(hotelsAddrs[i]));
      self.setState({
        hotels: hotels,
        totalHotels: totalHotels,
        loading: false
      });
    }

    async getHotelInfo(hotelAddr) {
      var self = this;
      var hotelInstance = Utils.getInstance('Hotel', hotelAddr, {web3: web3});
      let hotelNames = self.state.hotelNames;
      hotelNames[hotelAddr] = await hotelInstance.methods.name().call();
      self.setState({ hotelNames: hotelNames });
    }

    render() {
      var self = this;

      return(
        <div class='row justify-content-md-center'>
          <ToastContainer style={{zIndex: 2000}}/>
          <div class='col-md-10'>
            <div class={self.state.loading ? 'jumbotron loading' : 'jumbotron'}>
            <div class="box">
              <h2>My Bookings</h2>
              {self.state.bookingTxs &&
              <div>
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Hotel Name</th>
                      <th>Action</th>
                      <th>From Date</th>
                      <th>To Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {self.state.bookingTxs.map(function(tx, i){
                        if(tx.hotel && !self.state.hotelNames[tx.hotel])
                          self.getHotelInfo(tx.hotel);
                        return (
                          <tr key={'tx'+i} class="pointer">
                            <td>{tx.hotel ? self.state.hotelNames[tx.hotel] : ''}</td>
                            <td>{tx.method.name}</td>
                            <td>{tx.fromDate.toString()}</td>
                            <td>{tx.toDate.toString()}</td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>}
              </div>
            </div>
          </div>
        </div>
      )
    }

}
