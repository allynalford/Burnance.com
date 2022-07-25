import React, { Component } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
//Fade in effect
import FadeIn from "react-fade-in";

import { getChain } from '../../../common/config';
import ImageGrid from '../../../components/ImageGrid';


//Import Images
import bgImg from "../../../assets/images/2.jpg";
import work1 from "../../../assets/images/work/1.jpg";
import work2 from "../../../assets/images/work/2.jpg";
import work3 from "../../../assets/images/work/3.jpg";
import work4 from "../../../assets/images/work/4.jpg";
import work5 from "../../../assets/images/work/5.jpg";
import work6 from "../../../assets/images/work/6.jpg";
import work7 from "../../../assets/images/work/7.jpg";
import work8 from "../../../assets/images/work/8.jpg";
import work9 from "../../../assets/images/work/9.jpg";

var sessionstorage = require('sessionstorage');
var endpoint = require('../../../common/endpoint');

class Collection extends Component {
  constructor(props, { match }) {
    super(props);
    const address = this.props.match.params.address;
    this.state = {
      collection: { name: '' },
      ethereumAddress: '',
      walletConnected: false,
      loading: false,
      nfts: [],
      works: [
        {
          image: work1,
          title: '200% Extended Facebook Reach',
          isBusiness: true,
          category: 'Business',
        },
        {
          image: work2,
          title: 'SEO Success For Insulation',
          isMarketing: true,
          category: 'Marketing',
        },
        {
          image: work3,
          title: 'Mobile-Friendly Campaigns',
          isFinance: true,
          category: 'Finanace',
        },
        {
          image: work4,
          title: 'HVAC SEO Campaign',
          isHR: true,
          category: 'Human Research',
        },
        {
          image: work5,
          title: 'Social Media & Small Business',
          isBusiness: true,
          category: 'Business',
        },
        {
          image: work6,
          title: 'PPC Success For HVAC Company',
          isMarketing: true,
          category: 'Marketing',
        },
        {
          image: work7,
          title: 'Ecommerce PPC Case Studys',
          isFinance: true,
          category: 'Finanace',
        },
        {
          image: work8,
          title: 'Iphone mockup',
          isHR: true,
          category: 'Human Research',
        },
        {
          image: work9,
          title: 'Iphone mockup',
          isHR: true,
          category: 'Human Research',
        },
      ],
      displayCategory: 'All',
    };
    this.setCategory.bind(this);
    this.getNFTs.bind(this);
    this.accountsChanged.bind(this);
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
        this.getNFTs(
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

  getNFTs = async (ethereumAddress, contractAddress) => {
    //console.log('Loading Page:',pageNumber);
    try {
      this.setState({ loading: true });
      const exists = JSON.parse(
        sessionstorage.getItem(ethereumAddress + '-' + contractAddress),
      );

      //Check if the records exists in storage
      if (typeof exists !== 'undefined' && exists !== null) {
        this.setState({
          collection: exists.collection,
          nfts: exists.nfts,
          loading: false,
        });
      } else {
        //Call the service to get the NFTs
        const Collection = await endpoint._get(
          getChain()['eth'].viewWalletCollectionApiUrl +
            `/ethereum/${ethereumAddress}/${contractAddress}`,
        );
        this.setState({
          collection: Collection.data.collection,
          nfts: Collection.data.nfts,
          loading: false,
        });

        sessionstorage.setItem(
          ethereumAddress + '-' + contractAddress,
          JSON.stringify(Collection.data),
        );
      }
    } catch (e) {
      console.error(e);
    }
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
                          <Link to="/profile">Collection</Link>
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
                    <h2 className="title mb-0">Floor Price</h2>
                    <p className="text-muted mb-0">--</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                      <Link to="#" className="text-primary">
                        how this is calculated
                      </Link>
                    </p>
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
                    <h2 className="title mb-0">Market Cap</h2>
                    <p className="text mb-0">--</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                      <Link to="#" className="text-primary">
                        how this is calculated
                      </Link>
                    </p>
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
                    <h2 className="title mb-0">30 Day Sales</h2>
                    <p className="text-muted mb-0">--</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                      <Link to="#" className="text-primary">
                        how this is calculated
                      </Link>
                    </p>
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
                    <h2 className="title mb-0">7 Day Sales</h2>
                    <p className="text-muted mb-0">--</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                      <Link to="#" className="text-primary">
                        how this is calculated
                      </Link>
                    </p>
                  </div>
                </div>
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
                      onClick={() => this.setCategory('All')}
                      className={
                        this.state.displayCategory === 'All'
                          ? 'list-inline-item categories-name border text-dark rounded active'
                          : 'list-inline-item categories-name border text-dark rounded'
                      }
                    >
                      All
                    </li>{' '}
                    <li
                      onClick={() => this.setCategory('Business')}
                      className={
                        this.state.displayCategory === 'Branding'
                          ? 'list-inline-item categories-name border text-dark rounded active'
                          : 'list-inline-item categories-name border text-dark rounded'
                      }
                    >
                      What Should
                    </li>{' '}
                    <li
                      onClick={() => this.setCategory('Marketing')}
                      className={
                        this.state.displayCategory === 'Designing'
                          ? 'list-inline-item categories-name border text-dark rounded active'
                          : 'list-inline-item categories-name border text-dark rounded'
                      }
                    >
                      These Filters
                    </li>{' '}
                    <li
                      onClick={() => this.setCategory('Finanace')}
                      className={
                        this.state.displayCategory === 'Photography'
                          ? 'list-inline-item categories-name border text-dark rounded active'
                          : 'list-inline-item categories-name border text-dark rounded'
                      }
                    >
                      Be
                    </li>{' '}
                    <li
                      onClick={() => this.setCategory('Human Research')}
                      className={
                        this.state.displayCategory === 'Development'
                          ? 'list-inline-item categories-name border text-dark rounded active'
                          : 'list-inline-item categories-name border text-dark rounded'
                      }
                    >
                      Nick?
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
                  .map((cases, key) => (
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
                            src={cases.media[0].gateway}
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
                                  className="badge badge-link bg-success"
                                >
                                  Finance
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
                              <h5 className="mt-3">
                                <Link
                                  to="page-case-detail"
                                  className="text-dark title"
                                >
                                  {cases.title}
                                </Link>
                              </h5>
                              <p className="text">{cases.description}</p>
                              <p className="text">Purchased On 02/23/21</p>
                              <hr />
                              <Row>
                                <Col md="4">ETH Price: $0.00</Col>
                                <Col md="4">NFT Cost: $0.00</Col>
                                <Col md="4">Gas Fee: $0.00</Col>
                              </Row>
                              <hr />
                              <a
                                href={`https://opensea.io/assets/${this.state.collection.chain}/${cases.contract.address}/${cases.tokenId}`}
                                target="_new"
                                className="text-primary h6"
                              >
                                View on OpenSea{' '}
                                <i className="uil uil-angle-right-b align-middle"></i>
                              </a>
                            </div>
                          </CardBody>
                        </Card>
                      </FadeIn>
                    </Col>
                  ))}
              </Row>
            )}
          </Container>
        </section>
      </React.Fragment>
    );
  }
}

export default withRouter(Collection);
