import React from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider || WEB3_PROVIDER));

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        blockNumber: 0,
        networkType: '',
        logoutModal: false,
        wallet: window.localStorage.wallet ? JSON.parse(window.localStorage.wallet) : null,
        dropdownOpen: false
      }
    }

    async componentWillMount(){
      const networkType = await web3.eth.net.getNetworkType();
      this.setState({
        blockNumber: (await web3.eth.getBlock('latest')).number,
        networkType: networkType.charAt(0).toUpperCase()+networkType.slice(1)+' Network'
      });
    }

    logout(){
      window.localStorage.wallet = "";
      window.location.replace(window.location.origin+'/');
      window.location.reload();
    }

    toggle() {
      this.setState({
        dropdownOpen: !this.state.dropdownOpen
      });
    }

    render() {
      var self = this;
      var pendingTxs = this.props.pendingTxHashes;
      return(
        <nav class='navbar navbar-expand-md fixed-top navbar-main'>
          <Link class='navbar-brand' to='/'><strong>WT</strong></Link>
          <button class='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarCollapse' aria-controls='navbarCollapse' aria-expanded='false' aria-label='Toggle navigation'>
            <span class='navbar-toggler-icon'></span>
          </button>
          <div class='collapse navbar-collapse' id='navbarCollapse'>
            <ul class='navbar-nav mr-auto'>
              <li class={window.location.pathname == '/wallet' ? 'nav-item active' : 'nav-item'}>
                <Link class='nav-link' to='/wallet'>Wallet</Link>
              </li>
              <li class={window.location.pathname == '/hotel' ? 'nav-item active' : 'nav-item'}>
                <Link class='nav-link' to='/hotel'>Hotel Manager</Link>
              </li>
              <li class={window.location.pathname == '/explorer' ? 'nav-item active' : 'nav-item'}>
                <Link class='nav-link' to='/explorer'>Explorer</Link>
              </li>
              <li class={window.location.pathname == '/mybookings' ? 'nav-item active' : 'nav-item'}>
                <Link class='nav-link' to='/mybookings'>My Bookings</Link>
              </li>
            </ul>
            <ul class="navbar-nav ml-auto">
              <li class="nav-item pull-right">
                <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle.bind(this)}>
                  <DropdownToggle caret disabled={pendingTxs.length == 0}>
                    Pending TXs: {pendingTxs.length}
                  </DropdownToggle>
                  <DropdownMenu>
                  {pendingTxs.map(function(tx, i){
                      return <DropdownItem key={i}>{tx.method.name}</DropdownItem>;
                  })}
                  </DropdownMenu>
                </ButtonDropdown>
              </li>
              <li class='nav-item pull-right'>
                <span class="nav-link text-success">Block #{self.state.blockNumber} - {self.state.networkType}</span>
              </li>
              <li class={window.location.pathname == '/config' ? 'nav-item pull-right active' : 'nav-item pull-right'}>
                <Link class='nav-link config-icon' to='/config'><span class="fa fa-cog"></span></Link>
              </li>
            </ul>
            {self.state.wallet &&
              <form class='form-inline mt-2 mt-md-0'>
                <button class='btn btn-link my-2 my-sm-0' type='button'
                  onClick={() => self.setState({logoutModal:true})}
                >Logout</button>
              </form>
            }
          </div>
          {self.state.wallet &&
            <Modal
              isOpen={self.state.logoutModal}
              onRequestClose={() => self.setState({logoutModal:false})}
              contentLabel='Modal'
              style={{
                overlay : {
                  position          : 'fixed',
                  top               : 50,
                  left              : 0,
                  right             : 0,
                  bottom            : 0,
                  backgroundColor   : 'rgba(255, 255, 255, 0.75)'
                },
                content : {
                  maxWidth                   : '350px',
                  maxHeight                  : '300px',
                  margin                     : 'auto',
                  textAlign                  : 'center',
                  border                     : '1px solid #ccc',
                  background                 : '#fff',
                  overflow                   : 'auto',
                  WebkitOverflowScrolling    : 'touch',
                  borderRadius               : '4px',
                  outline                    : 'none',
                  padding                    : '20px'
                }
              }}
            >
              <h3>Are you sure?</h3>
              <small>Your account will be removed from the browser, be sure to have it in your device.</small>
              <a class="btn btn-primary pointer"
                href={"data:application/json;base64,"+window.btoa(JSON.stringify(self.state.wallet))}
                download={self.state.wallet.address+".json"}
              >
                Download Wallet <span class="fa fa-download"></span>
              </a>
              <br></br>
              <button class='btn btn-danger top-margin' onClick={() => self.logout()}>Close Wallet</button>
              <br></br>
              <button class='btn btn-info top-margin' onClick={() => self.setState({logoutModal:false})}>Cancel</button>
            </Modal>
          }
        </nav>
      );
    }

}
