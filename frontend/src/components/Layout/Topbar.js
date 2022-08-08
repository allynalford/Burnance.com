/* global BigInt */
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import {Container} from "reactstrap";
import Badge from 'react-bootstrap/Badge'
import {Event, initGA} from "../../common/gaUtils";
import { getChain, getNetworkName, getNetwork, getChainId } from "../../common/config";
import dateFormat from "dateformat";
import Web3 from 'web3';
import Burnance from '../../abis/Burnance.v2.1.json';
const ethers = require('ethers');
var endpoint = require('../../common/endpoint');
var sessionstorage = require('sessionstorage');
var USD = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'USD'});
var WEI = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 6 })


class Topbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethereumAddress: '',
      walletConnected: false,
      burnanceAddr: '',
      isValidSig: false,
      provider: {},
      ethPrice: 0,
      gasPrice: 0.00000,
      ethBalance: 0,
      isOpen: false,
      dropdownOpenShop: false,
      navLinks: [],
      wishlistModal: false,
      dropdownIsOpen: false,
    };
    this.toggleLine = this.toggleLine.bind(this);
    this.openBlock.bind(this);
    this.openNestedBlock.bind(this);
    this.toggleDropdownShop.bind(this);
    this.toggleWishlistModal.bind(this);
    this.toggleDropdownIsOpen.bind(this);
    this.connectWallet.bind(this);
    this.accountsChanged.bind(this);
    this.addWallet.bind(this);
    this.signAndVerify.bind(this);
    this.getEthPrice.bind(this);
    this.loadBlockchainData.bind(this);
    this.detectEthereumNetwork.bind(this);
  }


  detectEthereumNetwork = async () => {
    const web3 = window.web3;

    const networkId = await web3.eth.net.getId();

    
        if(networkId !== getChainId()){
          const switchRequest = getNetwork().switch;
          switchRequest.params[0].chainId = Web3.utils.toHex(switchRequest.params[0].chainId);
          await web3.currentProvider.request(switchRequest);
        };

    // web3.eth.net.getNetworkType().then(async (netName) => {
    //     if(netName !== getNetworkName()){
    //       const switchRequest = getNetwork().switch;
    //       switchRequest.params[0].chainId = Web3.utils.toHex(switchRequest.params[0].chainId);
    //       await web3.currentProvider.request(switchRequest);
    //     };
    // });
}

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      //await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!',
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const networkId = await web3.eth.net.getId();
    const burnanceAddr = await Burnance.networks[networkId].address;
    this.setState({ navLinks: [
      { id: 1, title: 'Home', link: '/' },
      { id: 2, title: 'Transactions', link: '/account' },
      { id: 3, title: 'Collections', link: '/collections' },
      { id: 4, title: 'Coins', link: '/coins' },
      { id: 5, title: 'Batch', link: '/batch' },
      { id: 6, title: 'Contract', link: `${process.env.REACT_APP_ETHERSCAN_BASE_URL}address/${burnanceAddr}`, external: true },
    ] });
    this.detectEthereumNetwork();
  };

  async init() {
    await this.loadBlockchainData();
  }

  toggleWishlistModal = () => {
    this.setState((prevState) => ({
      wishlistModal: !prevState.wishlistModal,
    }));
  };

  toggleDropdownShop = () => {
    this.setState({
      dropdownOpenShop: !this.state.dropdownOpenShop,
    });
  };
  toggleDropdownIsOpen = () => {
    this.setState({
      dropdownIsOpen: !this.state.dropdownIsOpen,
    });
  };

  toggleLine() {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  }

  componentDidMount() {
    var matchingMenuItem = null;
    var ul = document.getElementById('top-menu');
    var items = ul.getElementsByTagName('a');
    for (var i = 0; i < items.length; ++i) {
      if (this.props.location.pathname === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      this.activateParentDropdown(matchingMenuItem);
    }

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.on('accountsChanged', this.accountsChanged);
      //We need ethers for this
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      this.setState({provider});

      this.init();

      if (
        window.ethereum &&
        window.ethereum._state.isConnected &&
        typeof window.ethereum._state.accounts[0] !== 'undefined'
      ) {
        //console.log("connected",window.ethereum._state);
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });
      }

      this.getEthPrice();

      // const interval = setInterval(()=>{
      //   //console.log("Gwei:", gasPrice.gwei);
      //   //alert(gasPrice.gwei);
      //   this.getEthPrice();
      // }, 120000);
      //console.log('interval', interval);
 
    }

    initGA();
  }

  connectWallet = () => {
    Event('connectWallet', 'Connection Request', 'connect');
    if (window.ethereum) {
      // Do something
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((ethereumAddress) => {
          this.setState({ ethereumAddress, walletConnected: true });
          Event('connectWallet', 'Connection Made', 'connected');
        });
    } else {
      alert('install metamask extension!!');
      Event('connectWallet', 'MetaMask', 'missing');
    }
  };

  accountsChanged = () => {
    if (typeof window.ethereum._state.accounts[0] === 'undefined') {

      //This is a disconnect
      this.setState({ walletConnected: false, ethereumAddress: '' });
      console.info('disconnected');

    }else if(typeof window.ethereum._state.accounts[0] !== 'undefined'){
      if(this.state.ethereumAddress === ""){
        console.info("Connected wallet...")
        this.addWallet('ethereum', window.ethereum._state.accounts[0]);

        //Ask them to sign a mesage
        this.signAndVerify();
      }
    }
  };

  getEthPrice = async () => {
    function expired(date) {
      const today = new Date();
      var Christmas = new Date(date);
      var diffMs = today - Christmas; // milliseconds between now & Christmas
      var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
      console.debug('cache age:', diffMins + ' | ' + dateFormat(new Date(), 'isoUtcDateTime'));
      return diffMins < 2 ? false : true;
    }

    let ethPrice = JSON.parse(sessionstorage.getItem('ethPrice'));
    let gasPrice = JSON.parse(sessionstorage.getItem('gasPrice'));

    if (ethPrice !== null &&
      typeof ethPrice.dt !== 'undefined' &&
      expired(ethPrice.dt) === true
    ) {
      //Set the price temporarily
      this.setState({ ethPrice: ethPrice.ethusd });
      //Prompt for a price update
      ethPrice = undefined;
    }

    if ((typeof ethPrice === 'undefined') | (ethPrice === null)) {
     //console.log(getChain()['eth'].getEthPriceApiUrl)
      try{
        ethPrice = await endpoint._get(getChain()['eth'].getEthPriceApiUrl);
        ethPrice = ethPrice.data.result;
        ethPrice.dt = dateFormat(new Date(), 'isoUtcDateTime');
        sessionstorage.setItem('ethPrice', JSON.stringify(ethPrice));
      }catch(e){
        console.error(e);
      }


    };

    if ((typeof gasPrice === 'undefined') | (gasPrice === null)) {
      const dt = dateFormat(new Date(), 'isoUtcDateTime');

      gasPrice = await endpoint._get(getChain()['eth'].getGasPriceApiUrl);
      gasPrice = gasPrice.data;
      gasPrice.dt = dt;
      //console.log(gasPrice);

      gasPrice.gwei = ethers.utils.formatUnits(BigInt(gasPrice.result).toString(), "gwei");

      sessionstorage.setItem("gasPrice", JSON.stringify(gasPrice));
    };

    //console.log(gasPrice);

    this.setState({ ethPrice: ethPrice.ethusd, gasPrice:  gasPrice.gwei});

  
  };

  signAndVerify = async () =>{
    //We need ethers for this
    const ethers = require("ethers");
    //Use this module to verify the signature
    const { verifyMessage } = require('@ambire/signature-validator');
    //The message to be signed
    const message = "Welcome to Burnance....";
    //Request accounts from MetaMask
    await window.ethereum.request({method: 'eth_requestAccounts'});
    //Use MetaMask as the provider
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    //Pull the accounts
    await provider.send("eth_requestAccounts", []);
    //Get a signer
    const signer = provider.getSigner();
    //Grab the address
    const address = await signer.getAddress();
    //Request the user sign the message
    const signature = await signer.signMessage(message);
    //Validate the message signature
    const isValidSig = await verifyMessage({
	    signer: address,
	    message,
	    signature,
	    provider,
	});
	  console.info('is the sig valid: ', isValidSig);
    this.setState({isValidSig});
  }

  addWallet =  async (chain, address) => {
    console.log("Running Wallet Add..")
    if (typeof address !== 'undefined' && typeof chain !== 'undefined') {
      console.log("adding wallet")
      endpoint._post(getChain()['eth'].addWalletApiUrl, {chain, address})
    }
  };


  activateParentDropdown = (item) => {
    const parent = item.parentElement;
    if (parent) {
      parent.classList.add('active'); // li
      const parent1 = parent.parentElement;
      parent1.classList.add('active'); // li
      if (parent1) {
        const parent2 = parent1.parentElement;
        parent2.classList.add('active'); // li
        if (parent2) {
          const parent3 = parent2.parentElement;
          parent3.classList.add('active'); // li
          if (parent3) {
            const parent4 = parent3.parentElement;
            parent4.classList.add('active'); // li
          }
        }
      }
    }
  };

  openBlock = (level2_id) => {
    var tmpLinks = this.state.navLinks;
    tmpLinks.map((tmpLink) =>
      //Match level 2 id
      tmpLink.id === level2_id
        ? (tmpLink.isOpenSubMenu = !tmpLink.isOpenSubMenu)
        : false,
    );
    this.setState({ navLinks: tmpLinks });
  };

  openNestedBlock = (level2_id, level3_id) => {
    var tmpLinks = this.state.navLinks;
    tmpLinks.map((tmpLink) =>
      //Match level 2 id
      tmpLink.id === level2_id
        ? tmpLink.child.map((tmpchild) =>
            //if level1 id is matched then match level 3 id
            tmpchild.id === level3_id
              ? //if id is matched then update status(level 3 sub menu will be open)
                (tmpchild.isOpenNestedSubMenu = !tmpchild.isOpenNestedSubMenu)
              : (tmpchild.isOpenNestedSubMenu = false),
          )
        : false,
    );
    this.setState({ navLinks: tmpLinks });
  };

  render() {
    return (
      <React.Fragment>
        {this.props.tagline ? this.props.tagline : null}

        <header id="topnav" className="defaultscroll sticky">
          <Container>
            {/* <div>

              {this.props.hasDarkTopBar ? (
                <a className="logo" href="index.html">
                  <img src={logodark} height="59" className="logo-light-mode" alt="Tenably Labs NFT Alternative Text" />
                  <img src={logodark} height="59" className="logo-dark-mode" alt="Tenably Labs NFT Alternative Text" />
                </a>
              ) :
                <a className="logo" href="index.html">
                  <span className="logo-light-mode">
                    <img src={logodark} className="l-dark" height="59" alt="Tenably Labs NFT Alternative Text" />
                    <img src={logodark} className="l-light" height="59" alt="Tenably Labs NFT Alternative Text" />
                  </span>
                  <img src={logodark} height="59" className="logo-dark-mode" alt="Tenably Labs NFT Alternative Text" />
                </a>
              }
            </div> */}

            <div className="buy-button">
            <Badge bg="#00AA55" style={{marginRight: '5px',  backgroundColor: '#00AA55'}} 
                   className="badge-outline text h6" pill> 
            {WEI.format(this.state.gasPrice)}{' '}<i className="mdi mdi-fuel h6" style={{color: '#F22613'}}> </i>
            </Badge>
            <Badge style={{marginRight: '20px', backgroundColor: '#4183D7'}} 
                   className="badge-outline text h6" pill> 
            {USD.format(this.state.ethPrice)}<i className="mdi mdi-ethereum h6" style={{color: '#939393'}}> </i>
            </Badge>
              <Link
                to="#"
                target="_blank"
                className="btn btn-pills"
                style={{ backgroundColor: '#ff914d' }}
                onClick={(e) => {
                  e.preventDefault();
                  if (this.state.walletConnected === false) {
                    this.connectWallet();
                  }
                }}
              >
                {this.state.walletConnected && this.state.ethereumAddress !== ''
                  ? 'Connected'
                  : 'Connect Wallet'}
              </Link>
            </div>

            <div className="menu-extras">
              <div className="menu-item">
                <Link
                  to="#"
                  aria-label="Toggle menu"
                  onClick={this.toggleLine}
                  className={
                    this.state.isOpen ? 'navbar-toggle open' : 'navbar-toggle'
                  }
                >
                  <div className="lines">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </Link>
              </div>
            </div>

            <div
              id="navigation"
              style={{ display: this.state.isOpen ? 'block' : 'none' }}
            >
              <ul className="navigation-menu" id="top-menu">
                {this.state.navLinks.map((navLink, key) =>
                  navLink.child ? (
                    <li className="has-submenu" key={key}>
                      {/* child item(menu Item) - Level 1 */}
                      <Link
                        to={navLink.link}
                        onClick={(event) => {
                          event.preventDefault();
                          this.openBlock(navLink.id);
                        }}
                      >
                        {navLink.title}
                      </Link>
                      {/* <i className="mdi mdi-chevron-right me-1"></i> */}
                      <span className="menu-arrow"></span>
                      {navLink.isMegaMenu ? (
                        // if menu is mega menu(2 columns grid)
                        <ul
                          className={
                            navLink.isOpenSubMenu
                              ? 'submenu megamenu open'
                              : 'submenu megamenu'
                          }
                        >
                          <li>
                            <ul>
                              {navLink.child.map((item, childKey) =>
                                item.id < 12 ? (
                                  <li key={childKey}>
                                    <Link to={item.link}>{item.title}</Link>
                                  </li>
                                ) : null,
                              )}
                            </ul>
                          </li>
                          <li>
                            <ul>
                              {navLink.child.map((item, childKey) =>
                                item.id < 23 && item.id > 11 ? (
                                  <li key={childKey}>
                                    <Link to={item.link}>
                                      {item.title}
                                      {item.isNew ? (
                                        <span className="badge bg-danger rounded ms-2">
                                          new
                                        </span>
                                      ) : null}
                                    </Link>
                                  </li>
                                ) : null,
                              )}
                            </ul>
                          </li>
                          <li>
                            <ul>
                              {navLink.child.map((item, childKey) =>
                                item.id < 34 && item.id > 22 ? (
                                  <li key={childKey}>
                                    <Link to={item.link}>
                                      {item.title}
                                      {item.isNew ? (
                                        <span className="badge bg-danger">
                                          new
                                        </span>
                                      ) : null}
                                      {item.isOnePage ? (
                                        <span className="badge bg-warning rounded ms-2">
                                          Onepage
                                        </span>
                                      ) : null}
                                      {item.isupdatePage ? (
                                        <span className="badge badge-pill bg-info">
                                          Updated
                                        </span>
                                      ) : null}
                                    </Link>
                                  </li>
                                ) : null,
                              )}
                            </ul>
                          </li>
                          <li>
                            <ul>
                              {navLink.child.map((item, childKey) =>
                                item.id < 45 && item.id > 33 ? (
                                  <li key={childKey}>
                                    <Link to={item.link}>
                                      {item.title}

                                      {item.isOnePage ? (
                                        <span className="badge bg-warning rounded ms-2">
                                          Onepage
                                        </span>
                                      ) : null}
                                      {item.isupdatePage ? (
                                        <span className="badge badge-pill bg-info">
                                          Updated
                                        </span>
                                      ) : null}
                                    </Link>
                                  </li>
                                ) : null,
                              )}
                            </ul>
                          </li>
                          <li>
                            <ul>
                              {navLink.child.map((item, childKey) =>
                                item.id < 56 && item.id > 44 ? (
                                  <li key={childKey}>
                                    <Link to={item.link}>
                                      {item.title}

                                      {item.isOnePage ? (
                                        <span className="badge bg-warning rounded ms-2">
                                          Onepage
                                        </span>
                                      ) : null}
                                      {item.isupdatePage ? (
                                        <span className="badge badge-pill bg-info">
                                          Updated
                                        </span>
                                      ) : null}
                                    </Link>
                                  </li>
                                ) : null,
                              )}
                            </ul>
                          </li>
                        </ul>
                      ) : (
                        // if menu is not mega menu(1grid)
                        <ul
                          className={
                            navLink.isOpenSubMenu ? 'submenu open' : 'submenu'
                          }
                        >
                          {navLink.child.map((childArray, childKey) =>
                            childArray.nestedChild ? (
                              // sub menu item - Level 2
                              <li className="has-submenu" key={childKey}>
                                <Link
                                  to={childArray.link}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    this.openNestedBlock(
                                      navLink.id,
                                      childArray.id,
                                    );
                                  }}
                                >
                                  {childArray.title}{' '}
                                  {childArray.isNew ? (
                                    <span className="badge badge-pill badge-success">
                                      Added
                                    </span>
                                  ) : null}
                                </Link>
                                <span className="submenu-arrow"></span>
                                <ul
                                  className={
                                    childArray.isOpenNestedSubMenu
                                      ? 'submenu open'
                                      : 'submenu'
                                  }
                                >
                                  {childArray.nestedChild.map(
                                    (nestedChildArray, nestedKey) => (
                                      // nested sub menu item - Level 3
                                      <li key={nestedKey}>
                                        <Link to={nestedChildArray.link}>
                                          {nestedChildArray.title}{' '}
                                          {nestedChildArray.isNewPage ? (
                                            <span className="badge badge-danger rounded">
                                              NEW
                                            </span>
                                          ) : null}
                                          {nestedChildArray.isupdatePage ? (
                                            <span className="badge badge-pill badge-info">
                                              Updated
                                            </span>
                                          ) : null}
                                        </Link>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </li>
                            ) : (
                              <li key={childKey}>
                                <Link to={childArray.link}>
                                  {childArray.title}
                                </Link>
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </li>
                  ) : (
                    <li key={key}>
                      {typeof navLink.external !== 'undefined' &&
                      navLink.external === true ? (
                        <a href={navLink.link} target="_new">
                          {navLink.title}
                        </a>
                      ) : (
                        <Link to={navLink.link}>{navLink.title}</Link>
                      )}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </Container>
        </header>
      </React.Fragment>
    );
  }
}

export default withRouter(Topbar);
