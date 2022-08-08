/* global BigInt */
import React, { Component, CSSProperties } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  ButtonGroup,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Table
} from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import BasicPopperToolTip from '../../../components/BasicPopperToolTip';
import FadeIn from 'react-fade-in';
import { getChain } from '../../../common/config';
import ImageGrid from '../../../components/ImageGrid';
import { initGA, PageView, Event } from '../../../common/gaUtils';
import RingLoader from 'react-spinners/RingLoader';
import { ERC721, ERC1155 } from '../../../common/contractUtils';
import Web3 from 'web3';
import Burnance from '../../../abis/Burnance.v2.1.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBasketShopping,
  faFireBurner,
  faPersonCirclePlus,
  faRotate,
  faShieldHalved,
  faThumbsUp,
  faUsersRectangle,
} from '@fortawesome/free-solid-svg-icons';
import LoadingOverlay from 'react-loading-overlay';
import { retryAsync, isTooManyTries } from "ts-retry";
//Import Images
import bgImg from "../../../assets/images/nfts/ac1_unfit_digital_collage_of_locally_owned_nfts_by_annie_bur.jpg";
const Swal = require('sweetalert2');
const ethers = require('ethers');
const Batch = require('../../../model/Batch');
const CollectionObj = require('../../../model/Collection');

var sessionstorage = require('sessionstorage');
var endpoint = require('../../../common/endpoint');
// Create our number formatter.
var formatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'USD'});
var numFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 })

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

class CollectionView extends Component {
  constructor(props, { match }) {
    super(props);
    this.state = {
      type: 'ERC721',
      isOpen: false,
      collection: { name: '' },
      batchSize: 0,
      ethereumAddress: '',
      account: '',
      batch: '',
      walletConnected: false,
      collectionApproved: false,
      contentLoading: false,
      loading: false,
      loadingCollection: false,
      approving: false,
      transferring: false,
      burnanceAddr: '',
      burnance: '',
      nfts: [],
      displayCategory: 'All',
      description: '',
      floorPrice: 0,
      avgPrice: 0,
      holdingValue: 0,
      ethPrice: 0,
      marketCap: 0,
      liquidity1d: 0,
      liquidity7d: 0,
      liquidity30d: 0,
      thirtyDayVolume: 0,
      totalSupply: 0,
      owners: 0,
      held: 0,
      guaranteeFee: 0,
      guaranteeMonths: 1,
      guaranteeTransferToken: { title: '' },
      backgroundImg: bgImg
    };
    this.setCategory.bind(this);
    this.getNFTs.bind(this);
    this.accountsChanged.bind(this);
    this.getEthPrice.bind(this);
    this.getWallet.bind(this);
    this.approveForAll.bind(this);
    this.guaranteeTransfer.bind(this);
    this.waitForReceipt.bind(this);
    this.loadBlockchainData.bind(this);
    this.loadWeb3.bind(this);
    this.fireMsg.bind(this);
    this.isApprovedForAll.bind(this);
    this.transfer.bind(this);
    this.refresh.bind(this);
    this.recordTx.bind(this);
    this.openModal.bind(this);
    this.checkApprovedForAll.bind(this);
    this.NotApproved.bind(this);
    this.ConfirmBurn.bind(this);
  }

  openModal = async (tokenId) => {
    const _ = require('lodash');

    if (typeof tokenId !== 'undefined') {
      const guaranteeTransferToken = _.find(this.state.nfts, [
        'tokenId',
        tokenId,
      ]);

      if (typeof guaranteeTransferToken !== 'undefined') {
        let guaranteeFee = await this.state.burnance.methods
          .guaranteeFee()
          .call();

        //let guaranteeFee = 1700000000000000;

        guaranteeFee = Web3.utils.fromWei(guaranteeFee.toString(), 'ether');

        this.setState({ guaranteeFee, guaranteeTransferToken });
      }
    }

    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  setCategory(category) {
    this.setState({
      displayCategory: category,
    });
  }

  // async componentWillMount() {
  //   await this.loadWeb3();
  //   await this.loadBlockchainData();
  // }

  componentWillMount() {
    try{
      ethers.utils.getAddress(this.props.match.params.address);
    }catch(e){
      window.location.href = window.location.origin + '/collections';
    }
  }

  async init() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  // Make sure to remove the DOM listener when the component is unmounted.
  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollNavigation, true);
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

      //Kick off Web3
      this.init();

    } catch (e) {
      console.warn(e.message);
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.accountsChanged);
      if (
        window.ethereum._state.isConnected &&
        typeof window.ethereum._state.accounts[0] !== 'undefined'
      ) {
        let batch = new Batch(window.ethereum._state.accounts[0]);

        const batchSize = batch.length(window.ethereum._state.accounts[0]);
        this.setState({ batchSize });

        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
          batch,
        });
        this.getEthPrice(
          window.ethereum._state.accounts[0],
          this.props.match.params.address,
        );

        this.getWallet('ethereum', window.ethereum._state.accounts[0]);
      }
    }
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

  NotApproved(tokenId, type) {
    Swal.fire({
      title: 'Collection Not Approved',
      html: '<p>Would you like to approve the collection? This will allow you to complete the transaction you requested.</p>',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Continue Transaction',
      confirmButtonText: 'Yes, approve it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.approveForAll();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log({ tokenId, type });
        if (type === 'burn') {
          this.ConfirmBurn(tokenId);
        } else if (type === 'guarantee') {
          this.openModal(tokenId);
        }
      }
    });
  }

  ConfirmBurn(tokenId) {
    Swal.fire({
      title: 'Standard Burn',
      html: '<h3 style="color:red">WARNING!</h3><br /><p>Doing a standard burn will send your asset to the <span style="color:red;font-weight:500;">furnace</span> to be <b style="text-decoration: red wavy underline;">BURNED</b> forever, or <br />secure your burn with <span style="color:green;font-weight:bold">BUYBACK Guarantee</span>.</p>',
      icon: 'warning',
      showDenyButton: true,
      showCancelButton: true,
      denyButtonColor: '#008040',
      confirmButtonColor: '#D43900',
      denyButtonText: "BUYBACK",
      cancelButtonText: 'Cancel',
      confirmButtonText: 'BURN it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.transfer(tokenId);
      } else if (result.isDenied) {
        this.setState({transferring: false});
        this.openModal(tokenId);
      }
    });
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

    this.isApprovedForAll(
      window.ethereum._state.accounts[0],
      this.props.match.params.address,
      contractAddr,
    );
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

  accountsChanged = () => {
    if (
      window.ethereum._state.isConnected &&
      typeof window.ethereum._state.accounts[0] !== 'undefined'
    ) {
      if (this.state.ethereumAddress === '') {
        let batch = new Batch(window.ethereum._state.accounts[0]);

        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
          batch,
        });

        this.getWallet('ethereum', window.ethereum._state.accounts[0]);
      }
    } else if (typeof window.ethereum._state.accounts[0] === 'undefined') {
      this.setState({ nfts: [], walletConnected: false, ethereumAddress: '' });
    }
  };

  getNFTs = async (ethereumAddress, contractAddress, ethusd) => {
    //console.log('Loading Page:',pageNumber);
    try {
      this.setState({
        loading: true,
        loadingCollection: true,
        approving: true,
      });

      let Collection, NFTS, gets;

      const collectionObj = new CollectionObj(ethereumAddress, contractAddress);

      //Check the cache
      gets = collectionObj.get(collectionObj.wallet, collectionObj.address);

      if (gets !== null) {
        Collection = gets.collection;
        NFTS = gets.nfts;

        //console.log('Cache', { Collection, NFTS });
      } else {
        try {
          gets = await endpoint._getMulti([
            getChain()['eth'].viewWalletCollectionApiUrl +
              `/ethereum/${ethereumAddress}/${contractAddress}`,
            getChain()['eth'].viewWalletCollectionNftsApiUrl +
              `/ethereum/${ethereumAddress}/${contractAddress}`,
          ]);
        } catch (e) {
          console.warn(e);
          gets = await endpoint._getMulti([
            getChain()['eth'].viewWalletCollectionApiUrl +
              `/ethereum/${ethereumAddress}/${contractAddress}`,
            getChain()['eth'].viewWalletCollectionNftsApiUrl +
              `/ethereum/${ethereumAddress}/${contractAddress}`,
          ]);
        }

        collectionObj.set(ethereumAddress, contractAddress, {
          collection: gets[0],
          nfts: gets[1],
        });

        Collection = gets[0];
        NFTS = gets[1];

        //console.log('Called Service', { Collection, NFTS });
      }

      

      const collection = Collection.data.collection;

      if(typeof collection.contract !== "undefined" && collection.contract.image_url !== null){
        this.setState({backgroundImg: collection.contract.image_url})
      }



      const floorPrice =
        typeof collection.statistics !== 'undefined'
          ? formatter.format(
              parseFloat(
                Number(collection.statistics.floor_price) * Number(ethusd),
              ),
            )
          : formatter.format(0.0);
      const marketCap =
        typeof collection.statistics !== 'undefined'
          ? formatter.format(
              parseFloat(
                Number(collection.statistics.market_cap) * Number(ethusd),
              ),
            )
          : formatter.format(0.0);
      const avgPrice =
        typeof collection.statistics !== 'undefined'
          ? formatter.format(
              parseFloat(
                Number(collection.statistics.average_price) * Number(ethusd),
              ),
            )
          : formatter.format(0.0);
      const thirtyDayVolume =
        typeof collection.statistics !== 'undefined'
          ? formatter.format(
              parseFloat(
                Number(collection.statistics.thirty_day_volume) *
                  Number(ethusd),
              ),
            )
          : formatter.format(0.0);
      const holdingValue =
        typeof collection.statistics !== 'undefined'
          ? formatter.format(
              parseFloat(
                Number(
                  NFTS.data.nfts.length * collection.statistics.floor_price,
                ) * Number(ethusd),
              ),
            )
          : formatter.format(0.0);

      
      
      this.setState({
        collection: Collection.data.collection,
        loadingCollection: false,
        nfts: NFTS.data.nfts,
        loading: false,
        approving: false,
        holdingValue,
        description: (typeof Collection.data.collection.description === "undefined" ? NFTS.data.nfts[0].description : Collection.data.collection.description),
        type: Collection.data.collection.tokenType,
        held: NFTS.data.nfts.length,
        floorPrice,
        avgPrice,
        marketCap,
        thirtyDayVolume,
        totalSupply:
          typeof collection.statistics !== 'undefined'
            ? collection.statistics.total_supply
            : '-',
        owners:
          typeof collection.statistics !== 'undefined'
            ? collection.statistics.num_owners
            : '-',
        liquidity1d:
          typeof collection.statistics !== 'undefined'
            ? (
                (collection.statistics.one_day_sales /
                  (collection.statistics.total_supply -
                    collection.statistics.num_owners)) *
                100
              ).toFixed(2)
            : 0.0,
        liquidity7d:
          typeof collection.statistics !== 'undefined'
            ? (
                (collection.statistics.seven_day_sales /
                  (collection.statistics.total_supply -
                    collection.statistics.num_owners)) *
                100
              ).toFixed(2)
            : 0.0,
        liquidity30d:
          typeof collection.statistics !== 'undefined'
            ? (
                (collection.statistics.thirty_day_sales /
                  (collection.statistics.total_supply -
                    collection.statistics.num_owners)) *
                100
              ).toFixed(2)
            : 0.0,
      });
    } catch (e) {
      console.error(e);
    }
  };

  getEthPrice = async (ethereumAddress, contractAddress) => {
    let ethPrice = JSON.parse(sessionstorage.getItem('ethPrice'));

    if ((typeof ethPrice === 'undefined') | (ethPrice === null)) {
      ethPrice = await endpoint._get(getChain()['eth'].getEthPriceApiUrl);
      ethPrice = ethPrice.data.result;
      sessionstorage.setItem('ethPrice', JSON.stringify(ethPrice));
    }

    //console.log('EthPrice: Running getNFTs', ethPrice)
    this.getNFTs(ethereumAddress, contractAddress, ethPrice.ethusd);

    this.setState({ ethPrice });
  };

  refresh = async () => {

    const collectionObj = new CollectionObj(this.state.ethereumAddress, this.props.match.params.address);
    collectionObj.remove(this.state.ethereumAddress, this.props.match.params.address);
    
    this.getEthPrice(
      this.state.ethereumAddress,
      this.props.match.params.address,
    );
  };

  getWallet = async (chain, address) => {
    const walletResp = await endpoint._get(
      getChain()['eth'].getWalletApiUrl + `/${chain}/${address}`,
    );

    this.setState({ wallet: walletResp.data });
  };

  approveForAll = async () => {
    this.setState({ approving: true, contentLoading: true });
    const thisss = this;
    const address = this.props.match.params.address;
    const type = this.state.type;

    console.log(type);

    if (type === 'ERC721') {
      ERC721(address)
        .methods.setApprovalForAll(this.state.burnanceAddr, true)
        .send({ from: this.state.account })
        .on('transactionHash', (transactionHash) => {
          console.log('transactionHash(ERC721)', transactionHash);

          thisss.waitForReceipt(transactionHash, function (response) {
            if (response.status) {
              //alert("Set Approve for all Successfully");
              thisss.fireMsg(
                'Collection Approval',
                'Collection Approval Successfully',
                'INFO',
              );
              thisss.setState({
                approving: false,
                collectionApproved: true,
                contentLoading: false,
              });

              //Update the collection as Approved
            } else {
              alert(response.msg);
              thisss.fireMsg('Collection Approval', response.msg, 'WARN');
              thisss.setState({ approving: false, contentLoading: false });
            }
          });
        })
        .on('error', function (error, receipt) {
          const title = error.message.split(':')[0];
          const msg = error.message.split(':')[1];
          thisss.fireMsg(title, msg, 'WARN');
          thisss.setState({ approving: false, contentLoading: false });
        });
    } else if (type === 'ERC1155') {
      ERC1155(address)
        .methods.setApprovalForAll(this.state.burnanceAddr, true)
        .send({ from: this.state.account })
        .on('transactionHash', (transactionHash) => {
          console.log('transactionHash', transactionHash);

          thisss.waitForReceipt(transactionHash, function (response) {
            if (response.status) {
              //alert("Set Approve for all Successfully");
              thisss.fireMsg(
                'Collection Approval',
                'Collection Approval Successfully',
                'INFO',
              );
              thisss.setState({
                approving: false,
                collectionApproved: true,
                contentLoading: false,
              });
            } else {
              //alert(response.msg);
              thisss.fireMsg('Collection Approval', response.msg, 'WARN');
              thisss.setState({ approving: false, contentLoading: false });
            }
          });
        })
        .on('error', function (error, receipt) {
          const title = error.message.split(':')[0];
          const msg = error.message.split(':')[1];
          thisss.fireMsg(title, msg, 'WARN');
          thisss.setState({ approving: false, contentLoading: false });
        });
    }
  };

  isApprovedForAll = async (account, tokenAddress, burnanceAddr) => {
    try {
      const collectionApproved = await endpoint._get(
        getChain()['eth'].getIsCollectionApprovedApiUrl +
          `ethereum/${account}/${tokenAddress}/${burnanceAddr}`,
      );
      this.setState({ collectionApproved: collectionApproved.data.isApproved });
    } catch (e) {
      console.error(e);
    }
  };

  checkApprovedForAll = async (account, tokenAddress, burnanceAddr) => {
    try {
      const collectionApproved = await endpoint._get(
        getChain()['eth'].getIsCollectionApprovedApiUrl +
          `ethereum/${account}/${tokenAddress}/${burnanceAddr}`,
      );

      //Makre sure some weird error didn't happen
      if (typeof collectionApproved.data === 'undefined') {
        return false;
      }

      return collectionApproved.data.isApproved;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  guaranteeTransfer = async (tokenId, months) => {
    //e.preventDefault();
    const thisss = this;
    this.setState({
      transferring: true,
      approving: true,
      contentLoading: true,
    });

    const address = this.props.match.params.address;
    //const tokenId = e.target.tokenId.value
    let guaranteeFee = await this.state.burnance.methods.guaranteeFee().call();
    //console.log(guaranteeFee);
    guaranteeFee = guaranteeFee * months;
    //console.log(guaranteeFee);

    this.state.burnance.methods
      .gauranteeTransfer(address, tokenId, months)
      .send({ from: this.state.ethereumAddress, value: Number(guaranteeFee) })
      .on('transactionHash', (transactionHash) => {
        //console.log('guaranteeTransfer transactionHash', transactionHash);
        thisss.waitForReceipt(transactionHash, function (response) {
          if (response.status) {
            thisss.fireMsg(
              'Guarantee NFT Transfer',
              'NFT transfer was successful',
              'INFO',
            );

            const collectionObj = new CollectionObj(thisss.state.ethereumAddress, thisss.props.match.params.address);
            collectionObj.remove(thisss.state.ethereumAddress, thisss.props.match.params.address);




            // thisss
            // .recordTx(tokenId, transactionHash, 'guarantee')
            // .then(function (result) {
            //   // (**)

            //   thisss.getEthPrice(
            //     thisss.state.ethereumAddress,
            //     thisss.props.match.params.address,
            //   );
            // })
            // .catch((err) => alert(err));

            thisss.recordTx(tokenId, transactionHash, 'guarantee').then(function (result) {
                console.log('Transaction Logged', result);
                thisss.setState({
                  transferring: false,
                  guaranteeMonths: 1,
                  approving: false,
                  contentLoading: false,
                });
  
                thisss.getEthPrice(
                  thisss.state.ethereumAddress,
                  thisss.props.match.params.address,
                );
              }).catch((err) => {
                alert(err);
                console.error(err);
                thisss.setState({
                  transferring: false,
                  guaranteeMonths: 1,
                  approving: false,
                  contentLoading: false,
                });
  
                thisss.getEthPrice(
                  thisss.state.ethereumAddress,
                  thisss.props.match.params.address,
                );
              });





          } else {
            //alert(response.msg);
            thisss.fireMsg('Guarantee nft Transfer', response.msg, 'WARN');
            thisss.setState({
              transferring: false,
              approving: false,
              contentLoading: false,
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
        });
      });
  };

  recordTx = async (tokenId, transactionHash, type) => {
    const _ = require('lodash');
    let nft = _.find(this.state.nfts, { tokenId: tokenId });
    console.log(nft);


    const tx = {
      chainAddress: (typeof nft.chain === "undefined" ? 'ethereum' + this.state.ethereumAddress : nft.chain + ":" + nft.owner),
      chain: (typeof nft.chain === "undefined" ? 'ethereum' : nft.chain),
      address: (typeof nft.owner === "undefined" ? this.state.ethereumAddress : nft.owner),
      transactionHash,
      contractAddresses: nft.contract.address,
      tokenID: tokenId,
      type,
      tokenType: this.state.type,
      valueUSD: (typeof nft.valueUSD === "undefined" ? 0 : nft.valueUSD),
      valueETH: (typeof nft.valueETH === "undefined" ? 0 : nft.valueETH),
      costUSD: (typeof nft.costUSD === "undefined" ? 0 : nft.costUSD),
      costETH: (typeof nft.costETH === "undefined" ? 0 : nft.costETH),
      ethTransPriceUSD: (typeof nft.ethTransPriceUSD === "undefined" ? 0 : nft.ethTransPriceUSD)
    }
    console.log('TX  ',tx);
    


    setTimeout(async function myFunc(tx) {
      try {
        await retryAsync(
          async () => {
            const lastResult = await endpoint._post(getChain()['eth'].addWalletSellTxApiUrl, tx);
            console.log('txResp  ', lastResult);
            return typeof lastResult.data !== "undefined";
          },
          {
            delay: 7000,
            maxTry: 5,
            until: (lastResult) => lastResult === true,
          }
        );
      } catch (err) {
        if (isTooManyTries(err)) {
          // Did not get 42 after 'maxTry' calls
          console.log('isTooManyTries', err)
        } else {
          // something else goes wrong
          console.log(err)
        }
      }
    }, 10000, tx);
    




    return true;
  };

  transfer = async (tokenId) => {
    //e.preventDefault();
    const thisss = this;
    this.setState({
      transferring: true,
      approving: true,
      contentLoading: true,
    });

    const address = this.props.match.params.address;
    //const tokenId = e.target.tokenId.value

    this.state.burnance.methods
      .batchTransfer([address], [tokenId], [1])
      .send({ from: this.state.ethereumAddress })
      .on('transactionHash', (transactionHash) => {
        //console.log('Transfer transactionHash', transactionHash);
        thisss.waitForReceipt(transactionHash, function (response) {
          if (response.status) {
            thisss.fireMsg(
              'NFT Transfer',
              'NFT transfer was successful',
              'INFO',
            );

            const collectionObj = new CollectionObj(thisss.state.ethereumAddress, thisss.props.match.params.address);
            collectionObj.remove(thisss.state.ethereumAddress, thisss.props.match.params.address);


            

            thisss.recordTx(tokenId, transactionHash, 'burn').then(function (result) {
                  console.log('Transfer Transaction Logged', result);
                  thisss.setState({
                    transferring: false,
                    approving: false,
                    contentLoading: false,
                  });
    
                  thisss.getEthPrice(
                    thisss.state.ethereumAddress,
                    thisss.props.match.params.address,
                  );
              }).catch((err) => {
                alert(err);
                console.error(err);
                thisss.setState({
                  transferring: false,
                  approving: false,
                  contentLoading: false,
                });
  
                thisss.getEthPrice(
                  thisss.state.ethereumAddress,
                  thisss.props.match.params.address,
                );
              });

 


          } else {
            //alert(response.msg);
            thisss.fireMsg('NFT Transfer', response.msg, 'WARN');
            thisss.setState({ transferring: false, contentLoading: false, approving: false });
          }
        });
      })
      .on('error', function (error, receipt) {
        const title = error.message.split(':')[0];
        const msg = error.message.split(':')[1];
        thisss.fireMsg(title, msg, 'WARN');
        thisss.setState({ transferring: false, contentLoading: false, approving: false  });
        console.warn(error.message);
        console.error(error);
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
    return (
      <React.Fragment>
        {/* breadcrumb */}
        <section
          className="bg-half d-table w-100"
          style={{ background: `url(${this.state.backgroundImg}) center center` }}
        >
          <div className="bg-overlay"></div>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-12 text-center">
                <div className="page-next-level">
                  <h1 className="title text-white title-dark">
                    {' '}
                    {this.state.collection.name}{' '}
                  </h1>
                  <div className="page-next">
                    <nav aria-label="breadcrumb" className="d-inline-block">
                      <ul className="breadcrumb bg-white rounded shadow mb-0">
                        <li className="breadcrumb-item">
                          <Link to="/">Burnance</Link>
                        </li>
                        <li className="breadcrumb-item">
                          <Link to="/collections">Collections</Link>
                        </li>
                        <li
                          className="breadcrumb-item active"
                          aria-current="page"
                        >
                          {this.state.collection.name}
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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
              <Row className="justify-content-center">
                <Col md="3">
                  <div
                    key={1}
                    className="d-flex key-feature align-items-center p-3 rounded shadow mt-4"
                  >
                    {/* <img
                  src={work1}
                  className="avatar avatar-ex-sm"
                  alt=""
                /> */}
                    <div className="flex-1 content ms-3">
                      <BasicPopperToolTip
                        title="Floor Price"
                        text={
                          'The real-time lowest listing price of NFTs in the collection in the market'
                        }
                      />
                      {this.state.loading === true ? (
                        <RingLoader
                          color={'#ff914d'}
                          loading={this.state.loadingCollection}
                          cssOverride={override}
                          size={50}
                        />
                      ) : (
                        <p className="text h3 mb-0">{this.state.floorPrice}</p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div
                    key={1}
                    className="d-flex key-feature align-items-center p-3 rounded shadow mt-4"
                  >
                    {/* <img
                  src={work1}
                  className="avatar avatar-ex-sm"
                  alt=""
                /> */}
                    <div className="flex-1 content ms-3">
                      <BasicPopperToolTip
                        title="Market Cap"
                        text={
                          'Market capitalization is calculated as the sum of each NFT valued at the greater of its last traded price and the floor price of the collection, respectively.'
                        }
                      />
                      {this.state.loading === true ? (
                        <RingLoader
                          color={'#ff914d'}
                          loading={this.state.loadingCollection}
                          cssOverride={override}
                          size={50}
                        />
                      ) : (
                        <p className="text h3 mb-0">{this.state.marketCap}</p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div
                    key={1}
                    className="d-flex key-feature align-items-center p-3 rounded shadow mt-4"
                  >
                    {/* <img
                  src={work1}
                  className="avatar avatar-ex-sm"
                  alt=""
                /> */}
                    <div className="flex-1 content ms-3">
                      <BasicPopperToolTip
                        title="30 Day Volume"
                        text={
                          'Market capitalization is calculated as the sum of each NFT valued at the greater of its last traded price and the floor price of the collection, respectively.'
                        }
                      />
                      {this.state.loading === true ? (
                        <RingLoader
                          color={'#ff914d'}
                          loading={this.state.loadingCollection}
                          cssOverride={override}
                          size={50}
                        />
                      ) : (
                        <p className="text h3 mb-0">
                          {this.state.thirtyDayVolume}
                        </p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div
                    key={1}
                    className="d-flex key-feature align-items-center p-3 rounded shadow mt-4"
                  >
                    {/* <img
                  src={work1}
                  className="avatar avatar-ex-sm"
                  alt=""
                /> */}
                    {/* The liquidity rate measures the relative liquidity of each collection. 
                Liquidity = Sales / The number of NFTs * 100% */}
                    <div className="flex-1 content ms-3">
                      <BasicPopperToolTip
                        title="Liquidity (1D)"
                        text={
                          'The liquidity rate measures the relative liquidity of each collection. Liquidity = 1 Day Sales / number of NFTs owners * 100%'
                        }
                      />

                      {this.state.loading === true ? (
                        <RingLoader
                          color={'#ff914d'}
                          loading={this.state.loadingCollection}
                          cssOverride={override}
                          size={50}
                        />
                      ) : (
                        <p className="text h3 mb-0">
                          {this.state.liquidity1d}%
                        </p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div
                    key={1}
                    className="d-flex key-feature align-items-center p-3 rounded shadow mt-4"
                  >
                    {/* <img
                  src={work1}
                  className="avatar avatar-ex-sm"
                  alt=""
                /> */}
                    {/* The liquidity rate measures the relative liquidity of each collection. 
                Liquidity = Sales / The number of NFTs * 100% */}
                    <div className="flex-1 content ms-3">
                      <BasicPopperToolTip
                        title="Liquidity (7D)"
                        text={
                          'The liquidity rate measures the relative liquidity of each collection. Liquidity = 7 Day Sales / number of NFTs owners * 100%'
                        }
                      />

                      {this.state.loading === true ? (
                        <RingLoader
                          color={'#ff914d'}
                          loading={this.state.loadingCollection}
                          cssOverride={override}
                          size={50}
                        />
                      ) : (
                        <p className="text h3 mb-0">
                          {this.state.liquidity7d}%
                        </p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div
                    key={1}
                    className="d-flex key-feature align-items-center p-3 rounded shadow mt-4"
                  >
                    {/* <img
                  src={work1}
                  className="avatar avatar-ex-sm"
                  alt=""
                /> */}
                    {/* The liquidity rate measures the relative liquidity of each collection. 
                Liquidity = Sales / The number of NFTs * 100% */}
                    <div className="flex-1 content ms-3">
                      <BasicPopperToolTip
                        title="Liquidity (30D)"
                        text={
                          'The liquidity rate measures the relative liquidity of each collection. Liquidity = 30 Day Sales / number of NFTs owners * 100%'
                        }
                      />
                      {this.state.loading === true ? (
                        <RingLoader
                          color={'#ff914d'}
                          loading={this.state.loadingCollection}
                          cssOverride={override}
                          size={50}
                        />
                      ) : (
                        <p className="text h3 mb-0">
                          {this.state.liquidity30d}%
                        </p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div
                    key={1}
                    className="d-flex key-feature align-items-center p-3 rounded shadow mt-4"
                  >
                    {/* <img
                  src={work1}
                  className="avatar avatar-ex-sm"
                  alt=""
                /> */}
                    <div className="flex-1 content ms-3">
                      <BasicPopperToolTip
                        title="Avg. Price"
                        text={'Test Tool tip text: Sales (7D)'}
                      />

                      {this.state.loading === true ? (
                        <RingLoader
                          color={'#ff914d'}
                          loading={this.state.loadingCollection}
                          cssOverride={override}
                          size={50}
                        />
                      ) : (
                        <p className="text h3 mb-0">{this.state.avgPrice}</p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div
                    key={1}
                    className="d-flex key-feature align-items-center p-3 rounded shadow mt-4"
                  >
                    {/* <img
                  src={work1}
                  className="avatar avatar-ex-sm"
                  alt=""
                /> */}
                    <div className="flex-1 content ms-3">
                      <BasicPopperToolTip
                        title="Holding Value"
                        text={'Test Tool tip text: Sales (7D)'}
                      />

                      {this.state.loading === true ? (
                        <RingLoader
                          color={'#ff914d'}
                          loading={this.state.loadingCollection}
                          cssOverride={override}
                          size={50}
                        />
                      ) : (
                        <p className="text h3 mb-0">
                          {this.state.holdingValue}
                        </p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div
                    key={1}
                    className="d-flex key-feature align-items-center p-3 rounded shadow mt-4"
                  >
                    <div className="flex-1 content ms-3">
                      <BasicPopperToolTip
                        title="Held"
                        text={
                          "Number of NFT's from this collection held in wallet"
                        }
                      />

                      {this.state.loading === true ? (
                        <RingLoader
                          color={'#ff914d'}
                          loading={this.state.loadingCollection}
                          cssOverride={override}
                          size={50}
                        />
                      ) : (
                        <p className="text h3 mb-0">
                          {numFormatter.format(this.state.held)}
                        </p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div
                    key={1}
                    className="d-flex key-feature align-items-center p-3 rounded shadow mt-4"
                  >
                    <div className="flex-1 content ms-3">
                      <BasicPopperToolTip
                        title="Owners"
                        text={
                          'The number of unique addresses that hold at least one NFT of the collection currently.'
                        }
                      />

                      {this.state.loading === true ? (
                        <RingLoader
                          color={'#ff914d'}
                          loading={this.state.loadingCollection}
                          cssOverride={override}
                          size={50}
                        />
                      ) : (
                        <p className="text h3 mb-0">
                          {numFormatter.format(this.state.owners)}
                        </p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div
                    key={1}
                    className="d-flex key-feature align-items-center p-3 rounded shadow mt-4"
                  >
                    {/* <img
                  src={work1}
                  className="avatar avatar-ex-sm"
                  alt=""
                /> */}
                    <div className="flex-1 content ms-3">
                      <BasicPopperToolTip
                        title="Total Supply"
                        text={"Total NFT's within collection"}
                      />

                      {this.state.loading === true ? (
                        <RingLoader
                          color={'#ff914d'}
                          loading={this.state.loadingCollection}
                          cssOverride={override}
                          size={50}
                        />
                      ) : (
                        <p className="text h3 mb-0">
                          {numFormatter.format(this.state.totalSupply)}
                        </p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md="12">
                  <p className="text mb-0" style={{ marginTop: '25px' }}>
                    {this.state.description}
                  </p>
                </Col>
                {this.state.loading === false ? (
                  <Col md="12">
                    <p className="text mb-0" style={{ marginTop: '25px' }}>
                      Approval the collection to burn an NFT from the
                      collection. Refresh the collection to view updates.
                    </p>
                    <Link
                      to="#"
                      className="btn mouse-down"
                      style={{
                        marginRight: '10px',
                        backgroundColor:
                          this.state.collectionApproved === true
                            ? '#24A159'
                            : '#E76E3C',
                        color: 'white',
                      }}
                      disabled={
                        this.state.collectionApproved === true
                          ? true
                          : (this.state.loading === true) |
                            (this.state.approving === true)
                          ? true
                          : false
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        this.approveForAll();
                      }}
                    >
                      {this.state.collectionApproved === true
                        ? 'Approved '
                        : this.state.loading === true
                        ? 'Loading Collection... '
                        : 'Approve Collection '}
                      <FontAwesomeIcon
                        icon={
                          this.state.collectionApproved === true
                            ? faThumbsUp
                            : this.state.loading === true
                            ? faUsersRectangle
                            : faPersonCirclePlus
                        }
                        size="lg"
                        alt="Collection Approval"
                      />
                    </Link>
                    <Link
                      to="#"
                      className="btn mouse-down"
                      style={{
                        marginRight: '10px',
                        backgroundColor: 'blue',
                        color: 'white',
                      }}
                      disabled={
                        (this.state.loading === true) |
                        (this.state.approving === true)
                          ? true
                          : false
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        this.refresh();
                      }}
                    >
                      {this.state.loading === true
                        ? `Loading Collection... `
                        : `Refresh Collection `}
                      <FontAwesomeIcon
                        size="lg"
                        icon={
                          this.state.loading === false
                            ? faRotate
                            : faUsersRectangle
                        }
                        spinPulse={
                          (this.state.loading === true) |
                          (this.state.approving === true)
                            ? true
                            : false
                        }
                      />
                    </Link>
                    <Link
                      to="/batch"
                      className="btn mouse-down btn-info"
                      style={{
                        backgroundColor: '#939393',
                        color: 'white',
                      }}
                    >
                      View Batch: {this.state.batchSize}{' '}
                      <FontAwesomeIcon
                        size="lg"
                        icon={faBasketShopping}
                      />
                    </Link>
                  </Col>
                ) : (
                  ''
                )}
              </Row>

              {/* <Row
              className="justify-content-center"
              style={{ marginTop: '25px' }}
            >
              <div className="col-12 filters-group-wrap">
                <div className="filters-group">
                  <ul
                    className="container-filter list-inline mb-0 filter-options text-center"
                    id="filter"
                  >
                    <li
                      onClick={() => {
                        this.setCategory('All');
                        Event('Collection', 'FilterBy', 'All');
                      }}
                      className={
                        this.state.displayCategory === 'All'
                          ? 'list-inline-item categories-name border text-dark rounded active'
                          : 'list-inline-item categories-name border text-dark rounded'
                      }
                    >
                      All
                    </li>{' '}
                    <li
                      onClick={() => {
                        this.setCategory('Minted');
                        Event('Collection', 'FilterBy', 'Minted');
                      }}
                      className={
                        this.state.displayCategory === 'Minted'
                          ? 'list-inline-item categories-name border text-dark rounded active'
                          : 'list-inline-item categories-name border text-dark rounded'
                      }
                    >
                      Minted
                    </li>{' '}
                    <li
                      onClick={() => {
                        this.setCategory('Purchased');
                        Event('Collection', 'FilterBy', 'Purchased');
                      }}
                      className={
                        this.state.displayCategory === 'Purchased'
                          ? 'list-inline-item categories-name border text-dark rounded active'
                          : 'list-inline-item categories-name border text-dark rounded'
                      }
                    >
                      Purchased
                    </li>{' '}
                    <li
                      onClick={() => {
                        this.setCategory('Transferred');
                        Event('Collection', 'FilterBy', 'Transferred');
                      }}
                      className={
                        this.state.displayCategory === 'Transferred'
                          ? 'list-inline-item categories-name border text-dark rounded active'
                          : 'list-inline-item categories-name border text-dark rounded'
                      }
                    >
                      Transferred
                    </li>{' '}
                    <li
                      onClick={() => {
                        this.setCategory('Listed');
                        Event('Collection', 'FilterBy', 'Listed');
                      }}
                      className={
                        this.state.displayCategory === 'Listed'
                          ? 'list-inline-item categories-name border text-dark rounded active'
                          : 'list-inline-item categories-name border text-dark rounded'
                      }
                    >
                      Listed
                    </li>{' '}
                    <li
                      onClick={() => {
                        this.setCategory('Staked');
                        Event('Collection', 'FilterBy', 'Staked');
                      }}
                      className={
                        this.state.displayCategory === 'Staked'
                          ? 'list-inline-item categories-name border text-dark rounded active'
                          : 'list-inline-item categories-name border text-dark rounded'
                      }
                    >
                      Staked
                    </li>{' '}
                  </ul>
                </div>
              </div>
            </Row> */}
              {this.state.loading === true ? (
                <Row className="projects-wrapper">
                  <ImageGrid />
                </Row>
              ) : (
                <Row className="projects-wrapper">
                  {this.state.nfts
                    .filter(
                      ({ category }) =>
                        this.state.displayCategory === category ||
                        this.state.displayCategory === 'All',
                    )
                    .map((cases, key) => {
                      let currentCost = 0,
                        diff = 0;
                      if (typeof cases.costETH !== 'undefined') {
                        currentCost = parseFloat(
                          cases.costUSD * this.state.ethPrice.ethusd,
                        );
                        const cleanFloor = Number(this.state.floorPrice.replace("$",""))
                        diff = ((currentCost - cases.valueUSD)) + (cleanFloor - cases.valueUSD);
                      }

                   
                      //console.log(cases.gasData.gasUSD.toFixed(4));

                      const exists = this.state.batch.existsInBatch(
                        this.state.batch.address,
                        cases.contract.address,
                        cases.tokenId,
                      );
                      const title =
                        cases.title === ''
                          ? `Test Net Asset ${BigInt(cases.tokenId).toString()}`
                          : cases.title;
                      return (
                        <Col
                          key={key}
                          lg={4}
                          md={6}
                          xs={12}
                          className="mt-4 pt-2 business"
                        >
                          <FadeIn delay={100}>
                            <Card className="blog border-0 work-container work-classic shadow rounded-md overflow-hidden">
                              <img
                                src={
                                  (typeof cases.media === 'undefined') |
                                  (typeof cases.media[0] === 'undefined')
                                    ? `${process.env.REACT_APP_BASE_CDN_URL}/default-image.jpg`
                                    : cases.media[0].gateway
                                }
                                className="img-fluid rounded work-image"
                                alt={cases.description}
                              />

                              <CardBody>
                                <div className="content">
                                  {exists === true && (
                                    <Link
                                      to="#"
                                      className="badge badge-link bg-success"
                                    >
                                      In Batch
                                    </Link>
                                  )}
                                  {cases.isMarketing && (
                                    <Link
                                      to="#"
                                      className="badge badge-link bg-warning"
                                    >
                                      Marketing
                                    </Link>
                                  )}
                                  {cases.isFinance && (
                                    <Link
                                      to="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        window.open(
                                          `https://opensea.io/assets/${this.state.collection.chain}/${cases.contract.address}/${cases.tokenId}`,
                                        );
                                      }}
                                    >
                                      <img
                                        alt="OpenSea listing"
                                        align="right"
                                        width="25"
                                        height="25"
                                        src="https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png"
                                      />
                                    </Link>
                                  )}
                                  {cases.isHR && (
                                    <Link
                                      to="#"
                                      className="badge badge-link bg-info"
                                    >
                                      HR
                                    </Link>
                                  )}
                                  {/* <Link
                                  to="#"
                                  onClick={ e =>{
                                    e.preventDefault();
                                    window.open(`https://opensea.io/assets/${this.state.collection.chain}/${cases.contract.address}/${cases.tokenId}`);
                                  }}
                                >
                                  <img
                                      alt="OpenSea listing"
                                      align="right"
                                      width="25"
                                      height="25"
                                      src="https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png"
                                    />
                                </Link>
                                &nbsp;&nbsp;&nbsp;
                                <Link
                                  to="#"
                                  onClick={ e =>{
                                    e.preventDefault();
                                    window.open(`https://opensea.io/assets/${this.state.collection.chain}/${cases.contract.address}/${cases.tokenId}`);
                                  }}
                                >
                                  <img
                                      align="right"
                                      width="25"
                                      height="25"
                                      src="https://etherscan.io/images/brandassets/etherscan-logo-circle.png"
                                    />
                                </Link> */}
                                  <h5 className="mt-3">
                                    <Link
                                      to="page-case-detail"
                                      className="text-dark title"
                                    >
                                      {title}
                                    </Link>
                                  </h5>
                                  <Row>
                                    <Col md="6">
                                      <Row>
                                        <Col
                                          md="6"
                                          style={{ fontSize: '16px' }}
                                          className="text-center font-weight-bold"
                                        >
                                          {typeof cases.valueUSD === 'undefined'
                                            ? '$0.00'
                                            : formatter.format(
                                                cases.valueUSD,
                                              )}{' '}
                                        </Col>
                                        <Col
                                          md="6"
                                          style={{ fontSize: '16px' }}
                                          className="text-center"
                                        >
                                          {typeof cases.gasData === 'undefined'
                                            ? '$0.00'
                                            : formatter.format(
                                                cases.gasData.gasUSD,
                                              )}{' '}
                                        </Col>
                                        <Col
                                          md="6"
                                          style={{ fontSize: '16px' }}
                                          className="text-center"
                                        >
                                          Cost
                                        </Col>
                                        <Col
                                          md="6"
                                          style={{ fontSize: '16px' }}
                                          className="text-center"
                                        >
                                          <i className="uil uil-angle-right-b align-middle"></i>
                                          Gas
                                        </Col>
                                      </Row>
                                    </Col>
                                    <Col md="6">
                                      <Row>
                                        <Col md="12" className="text-center h3">
                                          {typeof cases.costETH === 'undefined'
                                            ? '$0.00'
                                            : formatter.format(cases.costETH)}
                                        </Col>
                                        <Col md="12" className="text-center">
                                          Cost Basis
                                        </Col>
                                      </Row>
                                    </Col>
                                  </Row>
                                  <hr />
                                  <Row>
                                    <Col md="12">
                                      <h6>Cost Today</h6>
                                    </Col>
                                    <Col md="3" className="text-center">
                                      {formatter.format(currentCost)}
                                    </Col>
                                    <Col md="3" className="text-center">
                                      {typeof cases.costETH === 'undefined'
                                        ? 0.0
                                        : numFormatter.format(cases.costUSD)}
                                    </Col>
                                    <Col md="6" className="text-center h5">
                                      <span
                                        style={{
                                          color: diff <= 0 ? 'red' : 'green',
                                        }}
                                      >
                                        {formatter.format(diff)}
                                      </span>
                                    </Col>
                                    <Col md="3" className="text-center">
                                      Cost
                                    </Col>
                                    <Col md="3" className="text-center">
                                      ETH
                                    </Col>
                                    <Col
                                      md="6"
                                      className="text-center font-weight-bold"
                                    >
                                      P / L
                                    </Col>
                                  </Row>
                                  <hr />
                                  <Row>
                                    <Col md="12">
                                      <h6>ETH Prices</h6>
                                    </Col>
                                    <Col md="6" className="text-center">
                                      {typeof cases.ethTransPriceUSD ===
                                      'undefined'
                                        ? '$0.00'
                                        : formatter.format(
                                            cases.ethTransPriceUSD,
                                          )}
                                    </Col>
                                    <Col md="6" className="text-center">
                                      {formatter.format(
                                        this.state.ethPrice.ethusd,
                                      )}
                                    </Col>
                                    <Col
                                      md="6"
                                      className="text-center font-weight-bold"
                                    >
                                      2/22/2020
                                    </Col>
                                    <Col
                                      md="6"
                                      className="text-center font-weight-bold"
                                    >
                                      Current
                                    </Col>
                                  </Row>

                                  <hr />

                                  <Row>
                                    <Col
                                      md="12"
                                      className="text font-weight-bold"
                                    >
                                      <ButtonGroup size="sm" role="group">
                                        <Button
                                          aria-label={`Sell ${cases.title} with Burn option`}
                                          style={{
                                            backgroundColor: '#24A159',
                                            marginRight: '10px',
                                          }}
                                          className="btn rounded btn-warning"
                                          disabled={this.state.approving}
                                          onClick={(e) => {
                                            Event(
                                              'Collection NFT',
                                              'Option',
                                              'Sell (Burn)',
                                            );
                                            // this.setState({ transferring: true });
                                            // this.transfer(
                                            //   BigInt(
                                            //     cases.tokenId,
                                            //   ).toString(),
                                            // );
                                            this.setState({
                                              transferring: true,
                                            });
                                            this.checkApprovedForAll(
                                              this.state.ethereumAddress,
                                              cases.contract.address,
                                              this.state.burnanceAddr,
                                            ).then((isApproved) => {
                                              if (isApproved === false) {
                                                this.NotApproved(
                                                  cases.tokenId,
                                                  'burn',
                                                );

                                                this.setState({
                                                  transferring: false,
                                                });
                                              } else {
                                                this.ConfirmBurn(cases.tokenId);
                                                // this.transfer(
                                                //   BigInt(
                                                //     cases.tokenId,
                                                //   ).toString(),
                                                // );
                                              }
                                            });
                                          }}
                                        >
                                          Burn{' '}
                                          <FontAwesomeIcon
                                            icon={faFireBurner}
                                            size="2x"
                                            alt="Sell with Burn option"
                                          />
                                        </Button>
                                        <Button
                                          aria-label={`Sell ${cases.title} with Buy Back guarantee option`}
                                          style={{
                                            backgroundColor: '#24A159',
                                            marginRight: '10px',
                                          }}
                                          className="btn rounded btn-success"
                                          disabled={this.state.approving}
                                          onClick={(e) => {
                                            Event(
                                              'Collection NFT',
                                              'Option',
                                              'Sell (w/Buy Back)',
                                            );

                                            //this.openModal(cases.tokenId);
                                            this.setState({
                                              transferring: true,
                                            });
                                            this.checkApprovedForAll(
                                              this.state.ethereumAddress,
                                              cases.contract.address,
                                              this.state.burnanceAddr,
                                            ).then((isApproved) => {
                                              //console.log(isApproved);
                                              if (isApproved === false) {
                                                this.NotApproved(
                                                  cases.tokenId,
                                                  'guarantee',
                                                );

                                                this.setState({
                                                  transferring: false,
                                                });
                                              } else {
                                                this.setState({
                                                  transferring: false,
                                                });
                                                this.openModal(cases.tokenId);
                                              }
                                            });
                                          }}
                                        >
                                          Buy Back{' '}
                                          <FontAwesomeIcon
                                            icon={faShieldHalved}
                                            size="2x"
                                            alt="Sell with Buy Back guarantee"
                                          />
                                        </Button>
                                        <Button
                                          aria-label={`Add ${cases.title} to basket`}
                                          style={{
                                            backgroundColor: '#24A159',
                                            marginRight: '10px',
                                          }}
                                          className="btn rounded btn-info"
                                          disabled={this.state.approving}
                                          onClick={(e) => {
                                            const exists =
                                              this.state.batch.existsInBatch(
                                                this.state.batch.address,
                                                cases.contract.address,
                                                cases.tokenId,
                                              );
                                            //console.log('Cost',cases.costUSD)
                                            const costUSD =
                                              typeof cases.costUSD !==
                                              'undefined'
                                                ? cases.costUSD
                                                : 0;
                                            // const tokenType =
                                            //   typeof cases.tokenType !==
                                            //   'undefined'
                                            //     ? cases.tokenType
                                            //     : 'ERC721';

                                            const imgSrc =
                                              (typeof cases.media ===
                                                'undefined') |
                                              (typeof cases.media[0] ===
                                                'undefined')
                                                ? `${process.env.REACT_APP_BASE_CDN_URL}/default-image.jpg`
                                                : cases.media[0].gateway;

                                            if (exists === false) {
                                              const add =
                                                this.state.batch.addToBatch(
                                                  this.state.batch.address,
                                                  title,
                                                  cases.contract.address,
                                                  cases.tokenId,
                                                  this.state.collection.tokenType,
                                                  1,
                                                  imgSrc,
                                                  costUSD,
                                                );
                                              if (add === true) {
                                                const batchSize =
                                                  new Batch().length(
                                                    this.state.ethereumAddress,
                                                  );
                                                this.setState({ batchSize });
                                                this.fireMsg(
                                                  'NFT Sell Batch',
                                                  'NFT added to batch.',
                                                  'INFO',
                                                );
                                              } else {
                                                this.fireMsg(
                                                  'NFT Sell Batch',
                                                  'NFT already exists in batch.',
                                                  'INFO',
                                                );
                                              }
                                            } else {
                                              this.fireMsg(
                                                'NFT Sell Batch',
                                                'NFT already exists in batch.',
                                                'INFO',
                                              );
                                            }

                                            Event(
                                              'Collection NFT',
                                              'Option',
                                              'Add to Batch',
                                            );
                                          }}
                                        >
                                          Batch{' '}
                                          <FontAwesomeIcon
                                            icon={faBasketShopping}
                                            color="#E76E3C"
                                            size="2x"
                                            alt={`Add ${cases.title} to basket`}
                                          />
                                        </Button>
                                      </ButtonGroup>

                                      {/* <Link
                                    to="#"
                                    className="text h7 badge badge-link bg-warning"
                                  >
                                    Approve
                                  </Link>
                                  &nbsp;
                                  <Link
                                    to="#"
                                    className="text h7 badge badge-link bg-info"
                                  >
                                    Add to Batch
                                  </Link>
                                  &nbsp;
                                  <Link
                                    to="#"
                                    className="text h7 badge badge-link bg-success"
                                  >
                                    Sell (Burn)
                                  </Link> */}
                                    </Col>
                                  </Row>
                                </div>
                              </CardBody>
                            </Card>
                          </FadeIn>
                        </Col>
                      );
                    })}
                </Row>
              )}
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
          <ModalHeader toggle={this.openModal}>
            Sell with Buy Back Guarantee
          </ModalHeader>
          <ModalBody>
            <div className="rounded shadow-lg p-4 sticky-bar">
              <div className="d-flex mb-4 justify-content-between">
                <h5>
                  {typeof this.state.guaranteeTransferToken !== 'undefined' &&
                  this.state.guaranteeTransferToken.title === ''
                    ? `Test net Asset ${this.state.guaranteeTransferToken.tokenId}`
                    : this.state.guaranteeTransferToken.title}
                </h5>
              </div>
              <div className="table-responsive">
                <Table className="table-end table-padding mb-0">
                  <tbody>
                    <tr>
                      <td className="h6 border-0">Guarantee Fee</td>
                      <td className="text-end fw-bold border-0">
                        {this.state.guaranteeFee} ETH
                      </td>
                    </tr>
                    <tr>
                      <td className="h6 border-0">Guaranteed Months</td>
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
                      <td className="h6">Est. Gas Fee</td>
                      <td className="text-end fw-bold">$ 0.00</td>
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
                      onClick={this.openModal}
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
                          this.state.guaranteeTransferToken.tokenId,
                          this.state.guaranteeMonths,
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

export default withRouter(CollectionView);
