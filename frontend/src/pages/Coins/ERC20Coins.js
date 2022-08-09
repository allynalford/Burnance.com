// React Basic and Bootstrap
import React, { Component } from 'react';
import { Container, Row, Col, Table, FormGroup, Input, Label, Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { Link } from "react-router-dom";
import {Helmet} from "react-helmet";
import LoadingOverlay from 'react-loading-overlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Web3 from 'web3';
import { getChain } from '../../common/config';
import { initGA, PageView, Event } from '../../common/gaUtils';
import DataTable from 'react-data-table-component';
import DataTableLoader from '../../components/DataTable';
//Import components
import PageBreadcrumb from "../../components/Shared/PageBreadcrumb";
import { faDeleteLeft, faFireBurner, faRefresh, faShieldHalved, } from '@fortawesome/free-solid-svg-icons';
import { ERC20 } from '../../common/contractUtils';
import Burnance from '../../abis/Burnance.ERC20.json';
//Import Icons

const CoinsCache = require('../../model/Coins');

const Swal = require('sweetalert2');
var endpoint = require('../../common/endpoint');
var cryptoFormatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'USD'});
var formatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'USD'});
//var numFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 20 });
class ERC20Coins extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pathItems: [
        //id must required
        { id: 1, name: 'Burnance', link: '/' },
        { id: 2, name: 'Coins', link: '/coins' },
      ],
      coinApproved: false,
      contentLoading: false,
      loading: false,
      isOpen: false,
      isAllowanceOpen: false,
      isTransferOpen: false,
      isGuaranteeOpen: false,
      ethereumAddress: '',
      account: '',
      batch: '',
      wallet: {},
      walletConnected: false,
      burnanceAddr: '',
      burnance: '',
      guaranteeFee: 0,
      guaranteeMonths: 1,
      importTokenNameDefault: 'Custom Token',
      importTokenName: 'Custom Token',
      importToken: {},
      importTokenContractAddress: '',
      importTokenSymbol: '',
      importTokenDecimal: 0,
      selectedLoading: false,
      selectTokenAllowanceDisplay: 0,
      selectedTokenAllowance: 0,
      selectedTokenAdditionalAllowance: "0001",
      selectedTokenNameDefault: 'Custom Token',
      selectedTokenName: 'Custom Token',
      selectedToken: {},
      selectedTokenContractAddress: '',
      selectedTokenSymbol: '',
      selectedTokenDecimal: 0,
      selectedTokenTransferAmountTotal: 0,
      selectedTokenTransferAmount: 0,
      placeHolderText: '',
      coins: [],
    };
    this.openModal.bind(this);
    this.openAllowanceModal.bind(this);
    this.openTransferModal.bind(this);
    this.openGuaranteeModal.bind(this);
    this.accountsChanged.bind(this);
    this.getCoinMetaData.bind(this);
    this.getCoins.bind(this);
    this.addCoin.bind(this);
    this.deleteCoin.bind(this);
    this.refreshWallet.bind(this);
    this.fireMsg.bind(this);
    this.loadWeb3.bind(this);
    this.loadBlockchainData.bind(this);
    this.approve.bind(this);
  }

  fireMsg(title, text, icon) {
    icon = icon.toLowerCase();
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'Ok',
      confirmButtonAriaLabel: 'Ok',
      focusConfirm: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
      timer: 5000,
      timerProgressBar: true,
    });
  }

  async init() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  componentDidMount() {
    try {
      //Template stuff
      document.body.classList = '';
      document.getElementById('top-menu').classList.add('nav-light');
      window.addEventListener('scroll', this.scrollNavigation, true);

      //Start GA
      initGA();
      PageView();

      document.title = "Burnance Coin Burn"

      //Kick off Web3
      this.init();

      //getMetadatav2("0x4cA3f3CFa03400fD6B1983161b40256053c51720");
    } catch (e) {
      console.warn(e.message);
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.accountsChanged);
      if (
        window.ethereum._state.isConnected &&
        typeof window.ethereum._state.accounts[0] !== 'undefined'
      ) {
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });

        this.getCoins('ethereum', window.ethereum._state.accounts[0]);
      }
    }
  }

  // Make sure to remove the DOM listener when the component is unmounted.
  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollNavigation, true);
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
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const contractAddr = await Burnance.networks[networkId].address;
    const burnance = new web3.eth.Contract(Burnance.abi, contractAddr);
    this.setState({ burnance });
    //this.getPromissoryList()
    this.setState({ loading: false, burnanceAddr: contractAddr });

  }

  scrollNavigation = () => {
    var doc = document.documentElement;
    var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    if (top > 80) {
      document.getElementById('topnav').classList.add('nav-sticky');
    } else {
      document.getElementById('topnav').classList.remove('nav-sticky');
    }
  };

  getWallet = async (chain, address) => {
    const walletResp = await endpoint._get(
      getChain()['eth'].getWalletApiUrl + `/${chain}/${address}`,
    );

    this.setState({ wallet: walletResp.data });
  };

  refreshWallet = async (chain, address) => {
    //Clear the cache
    const _CoinsCache = new CoinsCache('ethereum', address);

    _CoinsCache.remove('ethereum', address);

    this.getCoins(chain, address);

    Event(
      'Wallet Coins',
      'Ethereum',
      'Refresh',
    );
  };

  addCoin = async (chain, address, contractAddress, symbol, decimal, cmcid) => {
    this.setState({ loading: true });
    const coinResp = await endpoint._post(getChain()['coins'].addCoinApiUrl, {
      chain: 'ethereum',
      address,
      contractAddress,
      symbol,
      decimal,
      cmcid,
    });

    if (coinResp.data.error === false) {
      //Clear the cache
      const _CoinsCache = new CoinsCache('ethereum', address);

      _CoinsCache.remove('ethereum', address);

      this.setState({
        importTokenContractAddress: '',
        importTokenDecimal: 0,
        importTokenName: this.state.importTokenNameDefault,
        importTokenSymbol: '',
      });
      this.openModal();
    }

    this.getCoins(chain, address);

    Event(
      'Wallet Coins',
      'Add Token',
      symbol
    );
  };

  deleteCoin = async (chain, address, contractAddress) => {
    const deleteResp = await endpoint._delete(
      getChain()['coins'].deleteCoinApiUrl +
        `${chain}/${address}/${contractAddress}`,
    );

    console.log('deleteResp', deleteResp);

    //Clear the cache
    const _CoinsCache = new CoinsCache('ethereum', address);

    _CoinsCache.remove('ethereum', address);

    //Reload the data
    this.getCoins(chain, address);

    
    Event(
      'Wallet Coins',
      'Delete Token',
      contractAddress
    );
  };

  requestBurn = async (type) => {
    this.fireMsg(type, 'This feature is not yet available.', 'info');
    Event(
      'Wallet Coins',
      'Burn Request',
       type
    );
  };

  getQuotes = async (symbols) => {
    const quotesResp = await endpoint._post(
      getChain()['coins'].getCMCQuotesApiUrl,{symbols}
    );
    return quotesResp;
  };

  getCoins = async (chain, address) => {
    this.setState({ loading: true });
    const _CoinsCache = new CoinsCache('ethereum', address);

    let coins = _CoinsCache.get('ethereum', address);

    console.log('Cache', coins !== null)
    //If the cache is empty, pull the data
    if (coins === null) {
      const coinsResp = await endpoint._get(
        getChain()['coins'].getCoinsApiUrl + `${chain}/${address}`,
      );

      //Load the data result
      coins = coinsResp.data.result;

      //Set the values for now and stop loading
      this.setState({ coins, loading: false });

      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.REACT_APP_NODE_URL),
      );
      const ethers = require('ethers');

      let symbols = [];
      //Let's pull the balances
      for (const coin of coins) {
        //console.log(coin);
        //Init contract for each coin
        const contract = new web3.eth.Contract(
          getChain()['coinAbi'],
          coin.contractAddress,
        );
        //console.log(address);
        //Grab the balance
        const balance = await contract.methods
          .balanceOf(address)
          .call();
        //Convert and set it
        coin.balance = ethers.utils.formatEther(ethers.BigNumber.from(balance));

        symbols.push(coin.symbol);
      };

      //Update the table with balances
      this.setState({ coins, loading: false });

      if(symbols.length > 0){
        
      const quotes = await this.getQuotes(symbols);

    
      for (const coin of coins) {
        
        const quote = quotes.data.results.data[coin.symbol];

        if(typeof quote !== "undefined" && typeof quote[0] !== "undefined"){
          coin.price = quote[0].quote.USD.price;
          coin.volume_24h = quote[0].quote.USD.volume_24h;
          coin.volume_change_24h = quote[0].quote.USD.volume_change_24h;
          coin.num_market_pairs = quote[0].num_market_pairs;
          coin.circulating_supply = quote[0].circulating_supply;
          coin.value = (quote[0].quote.USD.price * coin.balance);
        }else{
            coin.price = 0.0;
            coin.volume_24h = 0;
            coin.volume_change_24h = 0;
            coin.num_market_pairs = 0;
            coin.circulating_supply = 0;
            coin.value = 0;
        }
      }

      this.setState({ coins });
      }
  

      if (coins.length !== 0) {
        //Cache the data
        _CoinsCache.set('ethereum', address, coins);
      }

    }else{
      //Update the table with balances
      this.setState({ coins, loading: false });
    }

  };

  getCoinMetaData = async (address) => {
    this.setState({ loading: true, placeHolderText: 'Looking Up Symbol' });

    const metaDataResp = await endpoint._get(
      getChain()['coins'].getCMCCoinMetaDataApiUrl + `/${address}`,
    );

    if (
      typeof metaDataResp.data !== 'undefined' &&
      metaDataResp.data.error === true
    ) {
      this.setState({
        loading: false,
        placeHolderText: 'Token Not found. Please enter Symbol',
      });
    } else {
      const key = Object.keys(metaDataResp.data.metaData.data)[0];
      const importToken = metaDataResp.data.metaData.data[key];

      this.setState({
        importToken,
        importTokenSymbol: importToken.symbol,
        importTokenName: importToken.name,
        loading: false,
        placeHolderText: '',
      });
    }
  };

  openModal = async () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  getCoinAllowance = async (chain, tokenAddress, owner, contractAddress) => {
    const allowanceResp = await endpoint._get(
      getChain()['coins'].getAllowanceApiUrl + `${chain}/${tokenAddress}/${owner}/${contractAddress}`);
      console.log({chain, tokenAddress, owner, contractAddress});
      const ethers = require('ethers');
      const web3 = window.web3;
      //const selectedTokenAllowance = web3.utils.hexToNumber(allowanceResp.data.allowance)
      const selectedTokenAllowance = ethers.BigNumber.from(allowanceResp.data.allowance.hex).toString()
      const allowance = web3.utils.fromWei(selectedTokenAllowance, 'ether');

     
      console.log('allowance | selectedTokenAllowance', {allowance, selectedTokenAllowance});

      this.setState({
        selectedTokenAllowance: allowance,
        selectedTokenTransferAmountTotal: allowance,
        selectedTokenTransferAmount: selectedTokenAllowance,
        selectedLoading: false,
      });
  };

  openAllowanceModal = async (contractAddress) => {
    
 

    if (typeof contractAddress === "string") {
      this.setState({
        contentLoading: true
      });
      const _ = require('lodash');
      let coin = _.find(this.state.coins, { contractAddress });
      this.setState({
        selectedTokenName: coin.symbol,
        selectedTokenDecimal: coin.decimal,
        selectedTokenSymbol: coin.symbol,
        selectedTokenContractAddress: coin.contractAddress,
        selectedLoading: true
      });
      this.getCoinAllowance('ethereum', coin.contractAddress, this.state.ethereumAddress, this.state.burnanceAddr);
   
    }


    this.setState((prevState) => ({
      isAllowanceOpen: !prevState.isAllowanceOpen
    }));
  };

  openTransferModal = async (contractAddress) => {
    
    if (typeof contractAddress === "string") {
      const _ = require('lodash');
      let coin = _.find(this.state.coins, { contractAddress });
      this.setState({
        selectedTokenName: coin.symbol,
        selectedTokenDecimal: coin.decimal,
        selectedTokenSymbol: coin.symbol,
        selectedTokenContractAddress: coin.contractAddress,
        selectedLoading: true
      });

      const allowanceResp = await endpoint._get(
        getChain()['coins'].getAllowanceApiUrl + `ethereum/${coin.contractAddress}/${this.state.ethereumAddress}/${this.state.burnanceAddr}`);
        const ethers = require('ethers');
        const web3 = window.web3;
        //const selectedTokenAllowance = web3.utils.hexToNumber(allowanceResp.data.allowance)
        const selectedTokenAllowance = ethers.BigNumber.from(allowanceResp.data.allowance.hex).toString()
        const allowance = web3.utils.fromWei(selectedTokenAllowance, 'ether');
  
       
        console.log('allowance | selectedTokenAllowance', {allowance, selectedTokenAllowance});
  
        this.setState({
          selectedTokenAllowance: allowance,
          selectedTokenTransferAmountTotal: allowance,
          selectedTokenTransferAmount: selectedTokenAllowance,
          selectedLoading: false,
          isTransferOpen: true,
          contentLoading: false
        });
      
    }else{
      this.setState((prevState) => ({
        isTransferOpen: !prevState.isTransferOpen,
        contentLoading: false
      }));
    }
 
  

  };
  openGuaranteeModal = async (contractAddress) => {
    
    if (typeof contractAddress === "string") {
      const _ = require('lodash');
      let coin = _.find(this.state.coins, { contractAddress });

      let guaranteeFee = await this.state.burnance.methods.guaranteeFee().call();
          guaranteeFee = Web3.utils.fromWei(guaranteeFee.toString(), 'ether');

      this.setState({
        guaranteeFee,
        selectedTokenName: coin.symbol,
        selectedTokenDecimal: coin.decimal,
        selectedTokenSymbol: coin.symbol,
        selectedTokenContractAddress: coin.contractAddress,
        selectedLoading: true
      });

      const allowanceResp = await endpoint._get(
        getChain()['coins'].getAllowanceApiUrl + `ethereum/${coin.contractAddress}/${this.state.ethereumAddress}/${this.state.burnanceAddr}`);
        const ethers = require('ethers');
        const web3 = window.web3;
        //const selectedTokenAllowance = web3.utils.hexToNumber(allowanceResp.data.allowance)
        const selectedTokenAllowance = ethers.BigNumber.from(allowanceResp.data.allowance.hex).toString()
        const allowance = web3.utils.fromWei(selectedTokenAllowance, 'ether');
  
       const selectTokenAllowanceDisplay = allowance;
       
        console.log('allowance | selectedTokenAllowance', {allowance, selectedTokenAllowance});
  
        this.setState({
          selectedTokenAllowance: allowance,
          selectedTokenTransferAmountTotal: allowance,
          selectedTokenTransferAmount: selectedTokenAllowance,
          selectedLoading: false,
          isGuaranteeOpen: true,
          contentLoading: false,
          selectTokenAllowanceDisplay
        });
      
    }else{
      this.setState((prevState) => ({
        isGuaranteeOpen: !prevState.isGuaranteeOpen,
        contentLoading: false
      }));
    }
 
  

  };
  accountsChanged = () => {
    if (
      window.ethereum._state.isConnected &&
      typeof window.ethereum._state.accounts[0] !== 'undefined'
    ) {
      if (this.state.ethereumAddress === '') {
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });

        this.getCoins('ethereum', window.ethereum._state.accounts[0]);
      }
    } else if (typeof window.ethereum._state.accounts[0] === 'undefined') {
      this.setState({coins: [], walletConnected: false, ethereumAddress: '' });
    }
  };

  approve = async (address, amount) => {
    //this.setState({ approving: true, contentLoading: true });
    const thisss = this;
    
    this.setState({selectedLoading: true, contentLoading: true})

    const web3 = window.web3;
    var BN = web3.utils.BN;
    const amount_string = amount.toLocaleString('fullwide', {useGrouping:false});
    //console.log({amount_string})
    const bigNumberAmount = new BN(amount_string)
    
    //web3.utils.toBN(amount_string)
   
    console.log({address, bigNumberAmount, spender: this.state.burnanceAddr})

      ERC20(address).methods.approve(this.state.burnanceAddr, bigNumberAmount)
        .send({ from: this.state.account })
        .on('transactionHash', (transactionHash) => {
          console.log('transactionHash(ERC20)', transactionHash);

          thisss.waitForReceipt(transactionHash, function (response) {
            
            if (response.status) {
              //alert("Set Approve for all Successfully");
              thisss.fireMsg(
                'Allowance Approval',
                'Approval successful',
                'INFO',
              );

              thisss.setState({selectedLoading: false, contentLoading: false, isAllowanceOpen: false});
              
              //Update the collection as Approved
            } else {
              alert(response.msg);
              thisss.fireMsg('Allowance Approval', response.msg, 'WARN');
              thisss.setState({ selectedLoading: false, contentLoading: false });
            }
          });
        })
        .on('error', function (error, receipt) {
          const title = error.message.split(':')[0];
          const msg = error.message.split(':')[1];
          thisss.fireMsg(title, msg, 'WARN');
          thisss.setState({ approving: false, contentLoading: false });
        });
  
  };

  transfer = async (address, amount) => {
    //e.preventDefault();
    const thisss = this;
    this.setState({selectedLoading: true, contentLoading: true, isTransferOpen: false})

    //const tokenId = e.target.tokenId.value

    this.state.burnance.methods
      .batchTransfer([address], [amount])
      .send({ from: this.state.ethereumAddress })
      .on('transactionHash', (transactionHash) => {
        //console.log('Transfer transactionHash', transactionHash);
        thisss.waitForReceipt(transactionHash, function (response) {
          if (response.status) {

            thisss.fireMsg(
              'Coin Transfer',
              'transfer was successful',
              'INFO',
            );

            thisss.setState({selectedLoading: false, contentLoading: false});

            thisss.refreshWallet('ethereum', thisss.state.ethereumAddress);

            // thisss.recordTx(tokenId, transactionHash, 'burn').then(function (result) {
            //       console.log('Transfer Transaction Logged', result);
            //       thisss.setState({
            //         transferring: false,
            //         approving: false,
            //         contentLoading: false,
            //       });
    
            //       thisss.getEthPrice(
            //         thisss.state.ethereumAddress,
            //         thisss.props.match.params.address,
            //       );
            //   }).catch((err) => {
            //     alert(err);
            //     console.error(err);
            //     thisss.setState({
            //       transferring: false,
            //       approving: false,
            //       contentLoading: false,
            //     });
  
            //     thisss.getEthPrice(
            //       thisss.state.ethereumAddress,
            //       thisss.props.match.params.address,
            //     );
            //   });

 


          } else {
            //alert(response.msg);
            thisss.fireMsg('Coin Transfer', response.msg, 'WARN');
            thisss.setState({ selectedLoading: false, contentLoading: false });
          }
        });
      })
      .on('error', function (error, receipt) {
        const title = error.message.split(':')[0];
        const msg = error.message.split(':')[1];
        thisss.fireMsg(title, msg, 'WARN');
        thisss.setState({ selectedLoading: false, contentLoading: false  });
        console.warn(error.message);
        console.error(error);
      });
  };

  guaranteeTransfer = async (address, months, amount) => {
    //e.preventDefault();
    const thisss = this;
    this.setState({
      transferring: true,
      approving: true,
      contentLoading: true,
    });

    //const tokenId = e.target.tokenId.value
    let guaranteeFee = await this.state.burnance.methods.guaranteeFee().call();
    //console.log(guaranteeFee);
    guaranteeFee = guaranteeFee * months;
    //console.log(guaranteeFee);

    this.state.burnance.methods
      .gauranteeTransfer(address, amount, months)
      .send({ from: this.state.ethereumAddress, value: Number(guaranteeFee) })
      .on('transactionHash', (transactionHash) => {
        //console.log('guaranteeTransfer transactionHash', transactionHash);
        thisss.waitForReceipt(transactionHash, function (response) {
          if (response.status) {
            thisss.fireMsg(
              'Coin Guarantee Transfer',
              'transfer was successful',
              'INFO',
            );

            thisss.setState({selectedLoading: false, contentLoading: false, isGuaranteeOpen: false, guaranteeMonths: 1});

            thisss.refreshWallet('ethereum', thisss.state.ethereumAddress);

            // thisss.recordTx(tokenId, transactionHash, 'guarantee').then(function (result) {
            //     console.log('Transaction Logged', result);
            //     thisss.setState({
            //       transferring: false,
            //       guaranteeMonths: 1,
            //       approving: false,
            //       contentLoading: false,
            //     });
  
            //     thisss.getEthPrice(
            //       thisss.state.ethereumAddress,
            //       thisss.props.match.params.address,
            //     );
            //   }).catch((err) => {
            //     alert(err);
            //     console.error(err);
            //     thisss.setState({
            //       transferring: false,
            //       guaranteeMonths: 1,
            //       approving: false,
            //       contentLoading: false,
            //     });
  
            //     thisss.getEthPrice(
            //       thisss.state.ethereumAddress,
            //       thisss.props.match.params.address,
            //     );
            //   });





          } else {
            //alert(response.msg);
            thisss.fireMsg('Coin Guarantee Transfer', response.msg, 'WARN');
            thisss.setState({
              transferring: false,
              approving: false,
              contentLoading: false,
              isGuaranteeOpen: false
            });
          }
        });
      })
      .on('error', function (error, receipt) {
        const title = error.message.split(':')[0];
        const msg = error.message.split(':')[1];
        thisss.fireMsg(title, msg, 'WARN');
        thisss.setState({
          transferring: false,
          approving: false,
          contentLoading: false,
          isGuaranteeOpen: false
        });
      });
  };

  async waitForReceipt(hash, cb) {
    const web3 = window.web3;
    const thiss = this;
    web3.eth.getTransactionReceipt(hash, function (err, receipt) {
      if (err) {
        console.log(err);
      }

      if (receipt !== null) {
        if (cb) {
          if (receipt.status === '0x0') {
            cb({
              status: false,
              msg: 'The contract execution was not successful, check your transaction !',
            });
          } else {
            cb({ status: true, msg: 'Execution worked fine!' });
          }
        }
      } else {
        window.setTimeout(function () {
          thiss.waitForReceipt(hash, cb);
        }, 1000);
      }
    });
  }

  render() {
    const customStyles = {
      headRow: {
        style: {
          border: 'none',
        },
      },
      headCells: {
        style: {
          color: '#202124',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      },
      rows: {
        highlightOnHoverStyle: {
          backgroundColor: 'rgb(230, 244, 244)',
          borderBottomColor: '#FFFFFF',
          borderRadius: '25px',
          outline: '1px solid #FFFFFF',
        },
      },
      pagination: {
        style: {
          border: 'none',
        },
      },
    };

    return (
      <React.Fragment>
        <Helmet>
          <title>Coin Liquidity Provider | Sell your ERC20 Tokens</title>
          <meta property="og:title" content="Burnance NFT Liquidity Provider" />
          <meta name="keywords" content="Token, Token Liquidity, Liquidity,Ethereum, ETH, ERC-20, burner, burn, burn rewards" />
          <meta name="description" content="Burn your Sh!t Tokens and get paid in (ETH) Ethereum" />
          <meta property="og:description" content="Burn your Sh!t Tokens and get paid in (ETH) Ethereum" />
          <meta name="twitter:title" content="Burnance | Token Liquidity Provider" />
        </Helmet>
        {/* breadcrumb */}
        <PageBreadcrumb title="Team Members" pathItems={this.state.pathItems} />
        <div className="position-relative">
          <div className="shape overflow-hidden text-white">
            <svg
              viewBox="0 0 2880 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        </div>
        <LoadingOverlay
          active={this.state.contentLoading}
          spinner
          text="Processing transaction......"
        >
          <section className="section">
            <Container>
              {this.state.walletConnected === true ? (
                <Row>
                  <Col md="6">
                    <Button
                      name="refresh"
                      className="btn btn-info rounded"
                      style={{ marginBottom: '15px' }}
                      onClick={(e) => {
                        e.preventDefault();
                        this.refreshWallet(
                          'ethereum',
                          this.state.ethereumAddress,
                        );
                      }}
                    >
                      {this.state.loading === true
                        ? 'Loading Coins...'
                        : 'Refresh Coins'}{' '}
                      <FontAwesomeIcon
                        icon={faRefresh}
                        color="#E76E3C"
                        spinPulse={this.state.loading}
                      />
                    </Button>
                  </Col>
                  {/* <Col md="6">
                <p className="text">
                      <Link
                        to="#"
                        onClick={(e) => {
                          e.preventDefault();
                          this.openModal();
                        }}
                      >
                        Import tokens
                      </Link>
                    </p>
                </Col> */}
                  <Col md="10">
                    <DataTable
                      title={'Wallet Coin Assets'}
                      customStyles={customStyles}
                      highlightOnHover
                      pointerOnHover
                      progressPending={this.state.loading}
                      progressComponent={<DataTableLoader width={'100%'} />}
                      columns={[
                        {
                          cell: (row) => (
                            <Link
                              to={`#`}
                              aria-label={`Delete ${row.symbol} from token list`}
                              onClick={(e) => {
                                e.preventDefault();
                                this.deleteCoin(
                                  'ethereum',
                                  this.state.ethereumAddress,
                                  row.contractAddress,
                                );
                              }}
                            >
                              <FontAwesomeIcon
                                size="2x"
                                icon={faDeleteLeft}
                                color="red"
                              />
                            </Link>
                          ),
                          width: '40px', // custom width for icon button
                          style: {
                            borderBottom: '1px solid #FFFFFF',
                            marginBottom: '-1px',
                          },
                        },
                        {
                          name: 'Token',
                          selector: (row) => row.symbol,
                          sortable: true,
                          format: (row) => row.symbol,
                          width: '100px',
                          style: {
                            color: '#202124',
                            fontSize: '16px',
                            fontWeight: 600,
                          },
                        },
                        {
                          name: 'Balance',
                          selector: (row) => row.balance,
                          sortable: true,
                          format: (row) =>
                            cryptoFormatter
                              .format(row.balance)
                              .replace('$', ''),
                          style: {
                            fontSize: '14px',
                            fontWeight: 600,
                          },
                        },
                        {
                          name: 'Price',
                          selector: (row) => row.balance,
                          sortable: true,
                          format: (row) => formatter.format(row.price),
                          width: '90px',
                          style: {
                            fontSize: '14px',
                          },
                        },
                        {
                          name: 'Value',
                          selector: (row) => row.value,
                          sortable: true,
                          format: (row) => formatter.format(row.value),
                          width: '110px',
                          style: {
                            fontSize: '14px',
                            fontWeight: 600,
                          },
                        },
                        {
                          cell: (row) => (
                            <Link
                              to={`#`}
                              aria-label={`Sell ${row.symbol} with Burn option`}
                              style={{
                                backgroundColor: '#E76E3C',
                                color: 'white',
                              }}
                              className="btn rounded btn-sm"
                              onClick={(e) => {
                                e.preventDefault();
                                this.openAllowanceModal(row.contractAddress);
                              }}
                            >
                              Approval{' '}
                              <FontAwesomeIcon
                                icon={faFireBurner}
                                alt="Sell with Burn option"
                              />
                            </Link>
                          ),
                          width: '135px',
                          style: {
                            borderBottom: '1px solid #FFFFFF',
                            marginBottom: '-1px',
                          },
                        },
                        {
                          cell: (row) => (
                            <Link
                              to={`#`}
                              aria-label={`Sell ${row.symbol} with Buy Back guarantee option`}
                              className="btn rounded btn-warning btn-sm"
                              onClick={(e) => {
                                e.preventDefault();
                                this.openTransferModal(row.contractAddress);
                              }}
                            >
                              Burn{' '}
                              <FontAwesomeIcon
                                icon={faFireBurner}
                                alt="Sell with Burn option"
                              />
                            </Link>
                          ),
                          width: '115px',
                          style: {
                            borderBottom: '1px solid #FFFFFF',
                            marginBottom: '-1px',
                          },
                        },
                        {
                          cell: (row) => (
                            <Link
                              to={`#`}
                              aria-label={`Sell ${row.symbol} with Buy Back guarantee option`}
                              className="btn rounded btn-success btn-sm"
                              onClick={(e) => {
                                e.preventDefault();
                                this.openGuaranteeModal(row.contractAddress);
                              }}
                            >
                              Buy Back{' '}
                              <FontAwesomeIcon
                                icon={faShieldHalved}
                                alt="Sell with Buy Back guarantee"
                              />
                            </Link>
                          ),
                          width: '135px',
                          style: {
                            borderBottom: '1px solid #FFFFFF',
                            marginBottom: '-1px',
                          },
                        },
                      ]}
                      data={this.state.coins}
                      pagination
                    />
                  </Col>
                  <Col xs={12} className="text-center">
                    <div className="section-title mb-4 pb-2">
                      <p className="text-center">Don't see your token? </p>
                      <p className="text-center">
                        <Link
                          to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            this.openModal();
                          }}
                        >
                          Import tokens
                        </Link>
                      </p>
                    </div>
                  </Col>
                </Row>
              ) : null}
            </Container>
          </section>
        </LoadingOverlay>
        <Modal
          isOpen={this.state.isOpen}
          role="dialog"
          autoFocus={true}
          centered={true}
          style={{ maxWidth: '500px', width: '500px' }}
        >
          <ModalHeader toggle={this.openModal}>Import Tokens</ModalHeader>
          <ModalBody>
            <div className="rounded shadow-lg p-4 sticky-bar">
              <div className="d-flex mb-4 justify-content-between">
                <h5>{this.state.importTokenName}</h5>
              </div>
              <div className="table-responsive">
                <Table className="table-end table-padding mb-0">
                  <tbody>
                    <tr>
                      <td className="h6 border-0">
                        <FormGroup className="position-relative">
                          <Label
                            className="form-label"
                            for="tokenContractAddress"
                          >
                            Token Contract Address{' '}
                            <span className="text-danger">*</span>
                          </Label>
                          <Input
                            name="tokenContractAddress"
                            id="tokenContractAddress"
                            type="text"
                            width="100%"
                            className="form-control"
                            placeholder="0x00000....."
                            disabled={this.state.loading}
                            value={this.state.importTokenContractAddress}
                            onBlur={(e) => {
                              if (e.target.value.length === 42) {
                                if (
                                  typeof this.state.importToken
                                    .contract_address !== 'undefined' &&
                                  this.state.importToken.contract_address[0]
                                    .contract_address !== e.target.value
                                ) {
                                  this.getCoinMetaData(e.target.value);
                                } else if (
                                  typeof this.state.importToken
                                    .contract_address === 'undefined'
                                ) {
                                  this.getCoinMetaData(e.target.value);
                                }
                              }
                            }}
                            onChange={(e) => {
                              this.setState({
                                importTokenContractAddress: e.target.value,
                              });
                            }}
                          />
                        </FormGroup>
                      </td>
                    </tr>
                    <tr>
                      <td className="h6 border-0">
                        <FormGroup className="position-relative">
                          <Label className="form-label" for="tokenSymbol">
                            Token Symbol{' '}
                          </Label>
                          <Input
                            name="tokenSymbol"
                            id="tokenSymbol"
                            type="text"
                            width="100%"
                            className="form-control"
                            disabled={this.state.loading}
                            value={this.state.importTokenSymbol}
                            placeholder={this.state.placeHolderText}
                            onChange={(e) => {
                              this.setState({
                                importTokenSymbol: e.target.value,
                              });
                            }}
                          />
                        </FormGroup>
                      </td>
                    </tr>
                    <tr>
                      <td className="h6 border-0">
                        <FormGroup className="position-relative">
                          <Label className="form-label" for="tokenDecimal">
                            Token Decimal{' '}
                          </Label>
                          <Input
                            name="tokenDecimal"
                            id="tokenDecimal"
                            type="number"
                            width="100%"
                            value={this.state.importTokenDecimal}
                            className="form-control"
                            placeholder="0"
                            disabled={this.state.loading}
                            onChange={(e) => {
                              this.setState({
                                importTokenDecimal: e.target.value,
                              });
                            }}
                          />
                        </FormGroup>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="mt-4 pt-2">
                  <div className="d-grid">
                    <Button
                      to="#"
                      className="btn btn-primary"
                      disabled={this.state.loading}
                      onClick={(e) => {
                        console.log(this.state.importToken);

                        let valid = true;

                        if (this.state.importTokenContractAddress === '') {
                          this.fireMsg(
                            'Token Import',
                            'Contract Address Required',
                            'warning',
                          );
                          valid = false;
                        }

                        if (
                          this.state.importTokenContractAddress.length !== 42
                        ) {
                          this.fireMsg(
                            'Token Import',
                            'Valid Contract Address Required',
                            'warning',
                          );
                          valid = false;
                        }

                        if (this.state.importTokenSymbol === '') {
                          this.fireMsg(
                            'Token Import',
                            'Token Symbol Required',
                            'warning',
                          );
                          valid = false;
                        }

                        if (valid === true) {
                          this.addCoin(
                            'ethereum',
                            this.state.ethereumAddress,
                            this.state.importTokenContractAddress,
                            this.state.importTokenSymbol,
                            this.state.importTokenDecimal,
                            typeof this.state.importToken.id !== 'undefined'
                              ? this.state.importToken.id
                              : undefined,
                          );
                        }
                      }}
                    >
                      Add Custom Token
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        </Modal>
        <Modal
          isOpen={this.state.isAllowanceOpen}
          role="dialog"
          autoFocus={true}
          centered={true}
          style={{ maxWidth: '500px', width: '500px' }}
        >
          <ModalHeader toggle={this.openAllowanceModal}>
            Coin Allowance Increase
          </ModalHeader>
          <ModalBody>
            <div className="rounded shadow-lg p-4 sticky-bar">
              <div className="d-flex mb-4 justify-content-between">
                <h5>{this.state.selectedTokenName}</h5>
              </div>
              <div className="table-responsive">
                <Table className="table-end table-padding mb-0">
                  <tbody>
                    <tr>
                      <td className="h6 border-0">Current Allowance</td>
                      <td className="text-end fw-bold border-0">
                        {cryptoFormatter
                          .format(this.state.selectedTokenAllowance)
                          .replace('$', '')}{' '}
                        {this.state.selectedTokenSymbol}
                      </td>
                    </tr>
                    <tr>
                      <td className="h6 border-0">Change Allowance</td>
                      <td className="text-end fw-bold border-0">
                        <div className="qty-icons">
                          <Input
                            type="text"
                            size={25}
                            maxLength={22}
                            name="coinallowance"
                            value={this.state.selectedTokenAdditionalAllowance}
                            onChange={(e) => {
                              const web3 = window.web3;

                              const selectedTokenAllowanceTotal =
                                web3.utils.fromWei(
                                  e.target.value.toString(),
                                  'ether',
                                );

                              this.setState({
                                selectedTokenAllowanceTotal,
                                selectedTokenAdditionalAllowance:
                                  e.target.value,
                              });
                            }}
                            title="Qty"
                            disabled={this.state.transferring}
                            className="btn btn-soft-primary qty-btn quantity"
                          />
                        </div>
                      </td>
                    </tr>
                    {/* <tr>
                      <td className="h6">Additional</td>
                      <td className="text-end fw-bold">
                        {this.state.selectedTokenAdditionalAllowance}{' '}
                        {this.state.selectedTokenSymbol}
                      </td>
                    </tr> */}
                    <tr className="bg-light">
                      <td className="h5 fw-bold">Allowance</td>
                      <td className="text-end text-primary fw-bold">
                        {this.state.selectedTokenAllowanceTotal}{' '}
                        {this.state.selectedTokenSymbol}
                      </td>
                    </tr>
                  </tbody>
                </Table>

                <div className="mt-4 pt-2">
                  <div>
                    <Link
                      to="#"
                      className="btn btn-warning"
                      onClick={(e) => {
                        this.setState({
                          selectedLoading: false,
                          contentLoading: false,
                          isAllowanceOpen: false,
                        });
                      }}
                      disabled={this.state.selectedLoading}
                    >
                      Cancel
                    </Link>
                    <Link
                      disabled={this.state.selectedLoading}
                      style={{ marginLeft: '15px' }}
                      to="#"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        //console.log('Transferring');
                        this.approve(
                          this.state.selectedTokenContractAddress,
                          this.state.selectedTokenAdditionalAllowance,
                        );
                      }}
                    >
                      Approve Allowance
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        </Modal>
        <Modal
          isOpen={this.state.isTransferOpen}
          role="dialog"
          autoFocus={true}
          centered={true}
          style={{ maxWidth: '500px', width: '500px' }}
        >
          <ModalHeader toggle={this.openTransferModal}>Coin Burn</ModalHeader>
          <ModalBody>
            <div className="rounded shadow-lg p-4 sticky-bar">
              <div className="d-flex mb-4 justify-content-between">
                <h5>{this.state.selectedTokenName}</h5>
              </div>
              <div className="table-responsive">
                <Table className="table-end table-padding mb-0">
                  <tbody>
                    <tr>
                      <td className="h6 border-0">Allowance</td>
                      <td className="text-end fw-bold border-0">
                        {cryptoFormatter
                          .format(this.state.selectedTokenAllowance)
                          .replace('$', '')}{' '}
                        {this.state.selectedTokenSymbol}
                      </td>
                    </tr>
                    <tr>
                      <td className="h6 border-0">Amount</td>
                      <td className="text-end fw-bold border-0">
                        <div className="qty-icons">
                          <Input
                            type="text"
                            size={35}
                            maxLength={30}
                            name="coinallowance"
                            value={this.state.selectedTokenTransferAmount}
                            onChange={(e) => {
                              const web3 = window.web3;

                              const selectedTokenTransferAmountTotal =
                                web3.utils.fromWei(
                                  e.target.value.toString(),
                                  'ether',
                                );

                              this.setState({
                                selectedTokenTransferAmountTotal,
                                selectedTokenTransferAmount: e.target.value,
                              });
                            }}
                            title="Qty"
                            disabled={this.state.transferring}
                            className="btn btn-soft-primary qty-btn quantity"
                          />
                        </div>
                      </td>
                    </tr>
                    {/* <tr>
                      <td className="h6">Additional</td>
                      <td className="text-end fw-bold">
                        {this.state.selectedTokenAdditionalAllowance}{' '}
                        {this.state.selectedTokenSymbol}
                      </td>
                    </tr> */}
                    <tr className="bg-light">
                      <td className="h5 fw-bold">Total</td>
                      <td className="text-end text-primary fw-bold">
                        {this.state.selectedTokenTransferAmountTotal}{' '}
                        {this.state.selectedTokenSymbol}
                      </td>
                    </tr>
                  </tbody>
                </Table>

                <div className="mt-4 pt-2">
                  <div>
                    <Link
                      to="#"
                      className="btn btn-secondary btn-sm rounded"
                      style={{ fontSize: '14px' }}
                      onClick={(e) => {
                        this.setState({
                          selectedLoading: false,
                          contentLoading: false,
                        });
                        this.openTransferModal();
                      }}
                      disabled={this.state.selectedLoading}
                    >
                      Cancel
                    </Link>
                    <Link
                      disabled={this.state.selectedLoading}
                      style={{ marginLeft: '15px', fontSize: '14px' }}
                      to="#"
                      className="btn btn-warning btn-sm rounded"
                      onClick={(e) => {
                        e.preventDefault();
                        //console.log('Transferring');
                        this.transfer(
                          this.state.selectedTokenContractAddress,
                          this.state.selectedTokenTransferAmount,
                        );
                      }}
                    >
                      Burn{' '}
                      <FontAwesomeIcon
                        icon={faFireBurner}
                        alt="Sell with Burn option"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        </Modal>
        <Modal
          isOpen={this.state.isGuaranteeOpen}
          role="dialog"
          autoFocus={true}
          centered={true}
          style={{ maxWidth: '500px', width: '500px' }}
        >
          <ModalHeader toggle={this.openGuaranteeModal}>
            Sell with Buy Back Guarantee
          </ModalHeader>
          <ModalBody>
            <div className="rounded shadow-lg p-4 sticky-bar">
              <div className="d-flex mb-4 justify-content-between">
                <h5>{this.state.selectedTokenName}</h5>
              </div>
              <div className="table-responsive">
                <Table className="table-end table-padding mb-0">
                  <tbody>
                    <tr>
                      <td className="h6 border-0">Fee</td>
                      <td className="text-end fw-bold border-0">
                        {this.state.guaranteeFee} ETH
                      </td>
                    </tr>
                    <tr>
                      <td className="h6 border-0">Months</td>
                      <td className="text-end fw-bold border-0">
                        <div className="qty-icons">
                          <Input
                            type="button"
                            value="-"
                            aria-label="reduce quantity"
                            onClick={() => {
                              if (this.state.guaranteeMonths !== 1) {
                                const guaranteeMonths =
                                  this.state.guaranteeMonths - 1;
                                this.setState({ guaranteeMonths });
                              }
                            }}
                            className="minus btn btn-icon btn-soft-primary"
                            disabled={this.state.transferring}
                            readOnly
                          />{' '}
                          <Input
                            type="text"
                            step="1"
                            min="1"
                            name="guaranteemonths"
                            value={this.state.guaranteeMonths}
                            onChange={(e) => {
                              if (e.target.value <= 36) {
                                this.setState({
                                  guaranteeMonths: e.target.value,
                                });
                              } else {
                                this.fireMsg(
                                  'Guarantee Months',
                                  'A guarantee can not exceed 36 months',
                                  'warn',
                                );
                                this.setState({
                                  guaranteeMonths: 36,
                                });
                              }
                            }}
                            title="Qty"
                            disabled={this.state.transferring}
                            className="btn btn-icon btn-soft-primary qty-btn quantity"
                          />{' '}
                          <Input
                            type="button"
                            value="+"
                            aria-label="Increase quantity"
                            onClick={() => {
                              const guaranteeMonths =
                                this.state.guaranteeMonths + 1;
                              this.setState({ guaranteeMonths });
                            }}
                            disabled={this.state.transferring}
                            readOnly
                            className="plus btn btn-icon btn-soft-primary"
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="h6">Allowance</td>
                      <td className="text-end fw-bold">
                        {this.state.selectTokenAllowanceDisplay}{' '}
                        {this.state.selectedTokenSymbol}
                      </td>
                    </tr>
                    <tr>
                      <td className="h6 border-0">Amount</td>
                      <td className="text-end fw-bold border-0">
                        <div className="qty-icons">
                          <Input
                            type="text"
                            size={35}
                            maxLength={30}
                            name="coinallowance"
                            value={this.state.selectedTokenTransferAmount}
                            onChange={(e) => {
                              const web3 = window.web3;

                              const selectedTokenTransferAmountTotal =
                                web3.utils.fromWei(
                                  e.target.value.toString(),
                                  'ether',
                                );

                              this.setState({
                                selectedTokenTransferAmountTotal,
                                selectedTokenTransferAmount: e.target.value,
                              });
                            }}
                            title="Qty"
                            disabled={this.state.transferring}
                            className="btn btn-soft-primary qty-btn quantity"
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="h6">Transfer</td>
                      <td className="text-end fw-bold">
                        {this.state.selectedTokenTransferAmountTotal}{' '}
                        {this.state.selectedTokenSymbol}
                      </td>
                    </tr>
                    <tr className="bg-light">
                      <td className="h5 fw-bold">Total</td>
                      <td className="text-end text-primary h4 fw-bold">
                        {(
                          this.state.guaranteeFee * this.state.guaranteeMonths
                        ).toFixed(4)}{' '}
                        ETH
                      </td>
                    </tr>
                  </tbody>
                </Table>

                <div className="mt-4 pt-2">
                  <div>
                    <Link
                      to="#"
                      className="btn btn-warning"
                      onClick={this.openGuaranteeModal}
                    >
                      Cancel
                    </Link>
                    <Link
                      style={{ marginLeft: '15px' }}
                      to="#"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        //console.log('Transferring');
                        this.guaranteeTransfer(
                          this.state.selectedTokenContractAddress,
                          this.state.guaranteeMonths,
                          this.state.selectedTokenTransferAmount,
                        );
                        this.setState({ transferring: true, isOpen: false });
                      }}
                    >
                      Place Guarantee
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </React.Fragment>
    );
  }
}
export default ERC20Coins;
