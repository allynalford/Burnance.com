// React Basic and Bootstrap
import React, { Component } from 'react';
import { Container, Row, Col, Table, FormGroup, Input, Label, Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { Link } from "react-router-dom";
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
      placeHolderText: '',
      coins: [],
    };
    this.openModal.bind(this);
    this.accountsChanged.bind(this);
    this.getCoinMetaData.bind(this);
    this.getCoins.bind(this);
    this.addCoin.bind(this);
    this.deleteCoin.bind(this);
    this.refreshWallet.bind(this);
    this.fireMsg.bind(this);
    this.loadWeb3.bind(this);
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
              {(this.state.walletConnected === true ?  <Row>
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
                          cryptoFormatter.format(row.balance).replace('$', ''),
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
                        name: 'Volume 24h',
                        selector: (row) => row.volume_24h,
                        sortable: true,
                        format: (row) => formatter.format(row.volume_24h),
                        style: {
                          fontSize: '14px',
                        },
                      },
                      {
                        cell: (row) => (
                          <Link
                            to={`#`}
                            aria-label={`Sell ${row.symbol} with Burn option`}
                            style={{
                              backgroundColor: '#24A159',
                            }}
                            className="btn rounded btn-warning btn-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              this.requestBurn('Burn Coins')
                            }}
                          >
                            Burn{' '}
                            <FontAwesomeIcon
                              icon={faFireBurner}
                              alt="Sell with Burn option"
                            />
                          </Link>
                        ),
                        width: '110px',
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
                              this.requestBurn('Buy Back Burn')
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
              </Row> : null)}
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
      </React.Fragment>
    );
  }
}
export default ERC20Coins;
