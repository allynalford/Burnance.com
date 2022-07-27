import React, { Component, CSSProperties } from "react";
import { Container, Row, Col, Card, CardBody, Button, ButtonGroup} from "reactstrap";
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, withRouter } from "react-router-dom";
import BasicPopperToolTip from "../../../components/BasicPopperToolTip";
import FadeIn from "react-fade-in";
import { getChain } from '../../../common/config';
import ImageGrid from '../../../components/ImageGrid';
import {initGA, PageView, Event} from '../../../common/gaUtils';
import RingLoader from "react-spinners/RingLoader";

//Import Images
import bgImg from "../../../assets/images/nfts/ac1_unfit_digital_collage_of_locally_owned_nfts_by_annie_bur.jpg";


var sessionstorage = require('sessionstorage');
var endpoint = require('../../../common/endpoint');
// Create our number formatter.
var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

var numFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 })


const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

class Collection extends Component {
  constructor(props, { match }) {
    super(props);
    this.state = {
      collection: { name: '' },
      ethereumAddress: '',
      walletConnected: false,
      collectionApproved: false,
      loading: false,
      loadingCollection: false,
      nfts: [],
      displayCategory: 'All',
      description: "",
      floorPrice: 0,
      avgPrice: 0,
      holdingValue: 0,
      ethPrice: 0,
      marketCap: 0,
      liquidity1d: 0,
      liquidity7d:0,
      liquidity30d: 0,
      thirtyDayVolume: 0,
      totalSupply: 0,
      owners: 0,
      held: 0
    };
    this.setCategory.bind(this);
    this.getNFTs.bind(this);
    this.accountsChanged.bind(this);
    this.getEthPrice.bind(this);
  }

  setCategory(category) {
    this.setState({
      displayCategory: category,
    });
  }

  componentDidMount() {
    document.body.classList = '';
    document.getElementById('top-menu').classList.add('nav-light');
    window.addEventListener('scroll', this.scrollNavigation, true);

    initGA();
    PageView();

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
        this.getEthPrice(
          window.ethereum._state.accounts[0],
          this.props.match.params.address,
        );
      }
    }
  }
  // Make sure to remove the DOM listener when the component is unmounted.
  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollNavigation, true);
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
      this.setState({
        ethereumAddress: window.ethereum._state.accounts[0],
        walletConnected: true,
      });
    } else if (typeof window.ethereum._state.accounts[0] === 'undefined') {
      this.setState({ nfts: [], walletConnected: false, ethereumAddress: '' });
    }
  };

  getNFTs = async (ethereumAddress, contractAddress, ethusd) => {
    //console.log('Loading Page:',pageNumber);
    try {
      this.setState({ loading: true, loadingCollection: true });
      const exists = JSON.parse(
        sessionstorage.getItem(ethereumAddress + '-' + contractAddress),
      );

      const existsNFTS = JSON.parse(
        sessionstorage.getItem(ethereumAddress + '-' + contractAddress + '-nfts'),
      );

      console.log('Exists in Cache', exists);


      //Check if the records exists in storage
      if (typeof exists !== 'undefined' && exists !== null) {

        const collection = exists.collection;
        const floorPrice = (typeof collection.statistics !== "undefined" ? formatter.format(parseFloat(Number(collection.statistics.floor_price) * Number(ethusd))) : formatter.format(0.00));
        const marketCap = (typeof collection.statistics !== "undefined" ? formatter.format(parseFloat(Number(collection.statistics.market_cap) * Number(ethusd))) : formatter.format(0.00));
        const avgPrice = (typeof collection.statistics !== "undefined" ? formatter.format(parseFloat(Number(collection.statistics.average_price) * Number(ethusd))) : formatter.format(0.00))
        const holdingValue = (typeof collection.statistics !== "undefined" ? formatter.format(parseFloat(Number((existsNFTS.nfts.length * collection.statistics.average_price)) * Number(ethusd))) : formatter.format(0.00))
        const thirtyDayVolume = (typeof collection.statistics !== "undefined" ? formatter.format(parseFloat(Number(collection.statistics.thirty_day_volume) * Number(ethusd))) : formatter.format(0.00));
        
        console.log('Setting State');
        this.setState({
          collection: exists.collection,
          nfts: existsNFTS.nfts,
          loadingCollection: false,
          loading: false,
          description: existsNFTS.nfts[0].description,
          floorPrice,
          marketCap,
          avgPrice,
          holdingValue,
          thirtyDayVolume,
          totalSupply: (typeof collection.statistics !== "undefined" ? collection.statistics.total_supply : '-'),
          owners: (typeof collection.statistics !== "undefined" ? collection.statistics.num_owners : '-'),
          held: existsNFTS.nfts.length,
          liquidity1d: (typeof collection.statistics !== "undefined" ? ((collection.statistics.one_day_sales / (collection.statistics.total_supply - collection.statistics.num_owners)) * 100).toFixed(2) : 0.0),
          liquidity7d:(typeof collection.statistics !== "undefined" ? ((collection.statistics.seven_day_sales / (collection.statistics.total_supply - collection.statistics.num_owners)) * 100).toFixed(2) : 0.0),
          liquidity30d:(typeof collection.statistics !== "undefined" ? ((collection.statistics.thirty_day_sales / (collection.statistics.total_supply - collection.statistics.num_owners)) * 100).toFixed(2) : 0.0),
        });
      } else {
        
        //Call the service to get the NFTs
        let Collection;

        try{
          Collection = await endpoint._get(
            getChain()['eth'].viewWalletCollectionApiUrl +
              `/ethereum/${ethereumAddress}/${contractAddress}`,
          );
        }catch(e){
          console.warn(e);
          Collection = await endpoint._get(
            getChain()['eth'].viewWalletCollectionApiUrl +
              `/ethereum/${ethereumAddress}/${contractAddress}`,
          );
        }

        console.log('Called Service', Collection);
       
        const collection = Collection.data.collection;
        const floorPrice = (typeof collection.statistics !== "undefined" ? formatter.format(parseFloat(Number(collection.statistics.floor_price) * Number(ethusd))) : formatter.format(0.00));
        const marketCap = (typeof collection.statistics !== "undefined" ? formatter.format(parseFloat(Number(collection.statistics.market_cap) * Number(ethusd))) : formatter.format(0.00));
        const avgPrice = (typeof collection.statistics !== "undefined" ? formatter.format(parseFloat(Number(collection.statistics.average_price) * Number(ethusd))) : formatter.format(0.00))
        const thirtyDayVolume = (typeof collection.statistics !== "undefined" ? formatter.format(parseFloat(Number(collection.statistics.thirty_day_volume) * Number(ethusd))) : formatter.format(0.00));
          

        this.setState({
          collection: Collection.data.collection,
          loadingCollection: false,
          floorPrice,
          avgPrice,
          marketCap,
          thirtyDayVolume,
          totalSupply: (typeof collection.statistics !== "undefined" ? collection.statistics.total_supply : '-'),
          owners: (typeof collection.statistics !== "undefined" ? collection.statistics.num_owners : '-'),
          liquidity1d: (typeof collection.statistics !== "undefined" ? ((collection.statistics.one_day_sales / (collection.statistics.total_supply - collection.statistics.num_owners)) * 100).toFixed(2) : 0.0),
          liquidity7d:(typeof collection.statistics !== "undefined" ? ((collection.statistics.seven_day_sales / (collection.statistics.total_supply - collection.statistics.num_owners)) * 100).toFixed(2) : 0.0),
          liquidity30d:(typeof collection.statistics !== "undefined" ? ((collection.statistics.thirty_day_sales / (collection.statistics.total_supply - collection.statistics.num_owners)) * 100).toFixed(2) : 0.0),
        });

        sessionstorage.setItem(
          ethereumAddress + '-' + contractAddress,
          JSON.stringify(Collection.data),
        );


        let NFTS;
        try{
          NFTS = await endpoint._get(
            getChain()['eth'].viewWalletCollectionNftsApiUrl +
              `/ethereum/${ethereumAddress}/${contractAddress}`,
          );
        }catch(e){
          console.warn(e);
          NFTS = await endpoint._get(
            getChain()['eth'].viewWalletCollectionNftsApiUrl +
              `/ethereum/${ethereumAddress}/${contractAddress}`,
          );
        }


        console.log('Called NFT Service', NFTS);

        const holdingValue = (typeof collection.statistics !== "undefined" ? formatter.format(parseFloat(Number((NFTS.data.nfts.length * collection.statistics.average_price)) * Number(ethusd))) : formatter.format(0.00))


        this.setState({
          nfts: NFTS.data.nfts,
          loading: false,
          holdingValue,
          description: NFTS.data.nfts[0].description,
          held: NFTS.data.nfts.length,
           });

           sessionstorage.setItem(
            ethereumAddress + '-' + contractAddress + '-nfts',
            JSON.stringify(NFTS.data),
          );

      }
    } catch (e) {
      console.error(e);
    }
  };

  getEthPrice = async (ethereumAddress, contractAddress) => {

    let ethPrice = JSON.parse(sessionstorage.getItem("ethPrice"));

    if ((typeof ethPrice === 'undefined') | (ethPrice === null)) {
      ethPrice = await endpoint._get(getChain()['eth'].getEthPriceApiUrl);
      ethPrice = ethPrice.data.result;
      sessionstorage.setItem("ethPrice", JSON.stringify(ethPrice));
    };

    console.log('EthPrice: Running getNFTs', ethPrice)
    this.getNFTs(ethereumAddress, contractAddress, ethPrice.ethusd);

    this.setState({ethPrice});
  };
  render() {
    return (
      <React.Fragment>
        {/* breadcrumb */}
        <section
          className="bg-half d-table w-100"
          style={{ background: `url(${bgImg}) center center` }}
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
                          <Link to="/collections">Collection</Link>
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
                        color={"#ff914d"}
                        loading={this.state.loading}
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
                        color={"#ff914d"}
                        loading={this.state.loading}
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
                        color={"#ff914d"}
                        loading={this.state.loading}
                        cssOverride={override}
                        size={50}
                      />
                    ) : (
                      <p className="text h3 mb-0">{this.state.thirtyDayVolume}</p>
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
                        color={"#ff914d"}
                        loading={this.state.loading}
                        cssOverride={override}
                        size={50}
                      />
                    ) : (
                      <p className="text h3 mb-0">{this.state.liquidity1d}%</p>
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
                        color={"#ff914d"}
                        loading={this.state.loading}
                        cssOverride={override}
                        size={50}
                      />
                    ) : (
                      <p className="text h3 mb-0">{this.state.liquidity7d}%</p>
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
                        color={"#ff914d"}
                        loading={this.state.loading}
                        cssOverride={override}
                        size={50}
                      />
                    ) : (
                      <p className="text h3 mb-0">{this.state.liquidity30d}%</p>
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
                        color={"#ff914d"}
                        loading={this.state.loading}
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
                        color={"#ff914d"}
                        loading={this.state.loading}
                        cssOverride={override}
                        size={50}
                      />
                    ) : (
                      <p className="text h3 mb-0">{this.state.holdingValue}</p>
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
                        color={"#ff914d"}
                        loading={this.state.loading}
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
                        color={"#ff914d"}
                        loading={this.state.loading}
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
                        color={"#ff914d"}
                        loading={this.state.loading}
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
              <Col md="12">
                <p className="text mb-0" style={{ marginTop: '25px' }}>
                  Approval the collection to burn an NFT from the collection
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
                  disabled={this.state.loading}
                  onClick={(e) => {
                    e.preventDefault();
                    console.info('Approve Collection');
                  }}
                >
                  {this.state.collectionApproved === true
                    ? 'Approved'
                    : 'Approve Collection'}
                </Link>
              </Col>
            </Row>

            <Row
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
            </Row>
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
                    
                    const currentCost = parseFloat(cases.costETH * this.state.ethPrice.ethusd)
                    const diff = (currentCost - cases.costUSD);
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
                              typeof cases.media === 'undefined'
                                ? `${process.env.REACT_APP_BASE_CDN_URL}/default-image.jpg`
                                : cases.media[0].gateway
                            }
                            className="img-fluid rounded work-image"
                            alt={cases.description}
                          />

                          <CardBody>
                            <div className="content">
                              {cases.isBusiness && (
                                <Link
                                  to="#"
                                  className="badge badge-link bg-primary"
                                >
                                  Business
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
                                  {cases.title}
                                </Link>
                              </h5>
                              <Row>
                                <Col md="6">
                                  <Row>
                                    <Col md="6" style={{ fontSize: '16px' }} className="text-center font-weight-bold">
                                    {formatter.format(cases.valueUSD)}{' '}
                                    </Col>
                                    <Col md="6" style={{ fontSize: '16px' }} className="text-center">
                                    {formatter.format(cases.gasUSD)}{' '}
                                    </Col>
                                    <Col md="6" style={{ fontSize: '16px' }} className="text-center">
                                      Cost
                                    </Col>
                                    <Col md="6" style={{ fontSize: '16px' }} className="text-center">
                                      <i className="uil uil-angle-right-b align-middle"></i>
                                      Gas
                                    </Col>
                                  </Row>
                                </Col>
                                <Col md="6">
                                  <Row>
                                    <Col md="12" className="text-center h3">
                                    {formatter.format(cases.costUSD)}
                                    </Col>
                                    <Col md="12" className="text-center">Cost Basis</Col>
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
                                      {numFormatter.format(cases.costETH)}
                                </Col>
                                <Col md="6" className="text-center h3">
                                <span
                                        style={{
                                          color: (diff <= 0 ? 'red' : 'green'),
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
                                <Col md="6" className="text-center font-weight-bold">
                                    P / L
                                </Col>
                              </Row>
                              <hr />
                              <Row>
                                <Col md="12">
                                  <h6>ETH Prices</h6>
                                </Col>
                                <Col md="6" className="text-center">{formatter.format(cases.ethTransPriceUSD)}</Col>
                                <Col md="6" className="text-center">{formatter.format(this.state.ethPrice.ethusd)}</Col>
                                <Col md="6" className="text-center font-weight-bold">2/22/2020</Col>
                                <Col md="6" className="text-center font-weight-bold">Current</Col>
                              </Row>

                              <hr />

                              <Row>
                                <Col md="12">
                                  <ButtonGroup size="sm" role="group">
                                    <Button className="btn btn-mini btn-warning rounded">
                                      Approve
                                    </Button>
                                    <DropdownButton
                                      as={ButtonGroup}
                                      title="Options"
                                      id="bg-nested-dropdown"
                                    >
                                      <Dropdown.Item
                                        className="btn-success"
                                        eventKey="1"
                                        onClick={(e) => {
                                          console.log(
                                            'Burn',
                                            cases.contract.address,
                                          );
                                          Event(
                                            'Collection NFT',
                                            'Option',
                                            'Sell (Burn)',
                                          );
                                        }}
                                      >
                                        Sell (Burn)
                                      </Dropdown.Item>
                                      <Dropdown.Item
                                        className="btn-success"
                                        eventKey="1"
                                        onClick={(e) => {
                                          console.log(
                                            'Buy Back',
                                            cases.contract.address,
                                          );
                                          Event(
                                            'Collection NFT',
                                            'Option',
                                            'Sell (w/Buy Back)',
                                          );
                                        }}
                                      >
                                        Sell (w/Buy Back)
                                      </Dropdown.Item>
                                      <Dropdown.Item
                                        defaultValue={'Add'}
                                        className="btn-info"
                                        eventKey="2"
                                        onClick={(e) => {
                                          console.log(
                                            'Add',
                                            cases.contract.address,
                                          );
                                          Event(
                                            'Collection NFT',
                                            'Option',
                                            'Add to Batch',
                                          );
                                        }}
                                      >
                                        Add to Batch
                                      </Dropdown.Item>
                                    </DropdownButton>
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
                  )})}
              </Row>
            )}
          </Container>
        </section>
      </React.Fragment>
    );
  }
}

export default withRouter(Collection);
