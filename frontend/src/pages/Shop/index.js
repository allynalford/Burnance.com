import React, { Component } from "react";
import MostViewedProducts from "./MostViewedProducts";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
} from "reactstrap";
//Import Icons
import FeatherIcon from "feather-icons-react";
//Import Images
import imgbg from "../../assets/images/account/bg.png";
import profile from "../../assets/images/client/05.jpg";
import { ethers } from "ethers";

var timer;

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethereumAddress: '',
      walletConnected: false,
      ethBalance: '',
    };

    this.getEthBalance.bind(this);
    this.startTimer.bind(this);
    this.checkConnection.bind(this);
  }

  componentDidMount() {
    document.body.classList = '';
    window.addEventListener('scroll', this.scrollNavigation, true);

    if (window.ethereum) {
      if (window.ethereum._state.isConnected && typeof window.ethereum._state.accounts[0] !== "undefined") {
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });
        this.getEthBalance(window.ethereum._state.accounts[0]);
      }else{
        console.log("Not Connected")
        this.startTimer();
      }
    } else {
      alert('install metamask extension!!');
    }
  }

  // Make sure to remove the DOM listener when the component is unmounted.
  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollNavigation, true);
  }

  startTimer = () => {
    console.log('starting timer');

    timer = setInterval(this.checkConnection, 15000);
  };

  checkConnection = () =>{
    if (window.ethereum) {
      console.log("Running connection Check")
      if (window.ethereum._state.isConnected && typeof window.ethereum._state.accounts[0] !== "undefined") {
        console.log("Connected")
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });
        this.getEthBalance(window.ethereum._state.accounts[0]);
        clearInterval(timer);
        console.log('stopping timer');
      }else{
        console.log("Not connected");
      }
    }
  }


  getEthBalance = (address) => {
    if (window.ethereum) {
      window.ethereum
        .request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        })
        .then((balance) => {
          // Return string value to convert it into int balance
          //console.log(balance)

          // Yarn add ethers for using ethers utils or
          // npm install ethers
          //console.log(ethers.utils.formatEther(balance))
          this.setState({ ethBalance: ethers.utils.formatEther(balance) });
          // Format the string into main latest balance
        });
    }
  };

  scrollNavigation = () => {
    var doc = document.documentElement;
    var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    if (top > 80) {
      document.getElementById('topnav').classList.add('nav-sticky');
    } else {
      document.getElementById('topnav').classList.remove('nav-sticky');
    }
  };

  render() {
    return (
      <React.Fragment>
        {/* import Section 
        <Section />*/}

        {/* import Collection 
        <Collection />*/}
        <section
          className="bg-profile d-table w-100 bg-primary"
          style={{ background: `url(${imgbg}) center center` }}
        >
          <Container>
            <Row>
              <Col lg="12">
                <Card
                  className="public-profile border-0 rounded shadow"
                  style={{ zIndex: '1' }}
                >
                  <CardBody>
                    <Row className="align-items-center">
                      <Col lg="2" md="3" className="text-md-start text-center">
                        <img
                          src={profile}
                          className="avatar avatar-large rounded-circle shadow d-block mx-auto"
                          alt=""
                        />
                      </Col>

                      <Col lg="10" md="9">
                        <Row className="align-items-end">
                          <Col
                            md="7"
                            className="text-md-start text-center mt-4 mt-sm-0"
                          >
                            <h3 className="title mb-0">
                              {this.state.ethereumAddress}
                            </h3>
                            <small className="text-muted h6 me-2">
                              Web Developer
                            </small>
                            <ul className="list-inline mb-0 mt-3">
                              <li className="list-inline-item me-2">
                                <Link
                                  to="#"
                                  className="text-muted"
                                  title="Linkedin"
                                >
                                  <i>
                                    <FeatherIcon
                                      icon="instagram"
                                      className="fea icon-sm me-2"
                                    />
                                  </i>
                                  krista_joseph
                                </Link>
                              </li>
                              <li className="list-inline-item ms-1">
                                <Link
                                  to="#"
                                  className="text-muted"
                                  title="Skype"
                                >
                                  <i>
                                    <FeatherIcon
                                      icon="linkedin"
                                      className="fea icon-sm me-2"
                                    />
                                  </i>
                                  krista_joseph
                                </Link>
                              </li>
                            </ul>
                          </Col>
                          <Col md="5" className="text-md-end text-center">
                            <ul className="list-unstyled social-icon social mb-0 mt-4">
                              <li className="list-inline-item">
                                <Link to="#" className="rounded">
                                  <i className="uil uil-user-plus align-middle"></i>
                                </Link>
                              </li>
                              <li className="list-inline-item">
                                <Link to="#" className="rounded">
                                  <i className="uil uil-comment align-middle"></i>
                                </Link>
                              </li>
                              <li className="list-inline-item">
                                <Link to="#" className="rounded">
                                  <i className="uil uil-bell align-middle"></i>
                                </Link>
                              </li>
                              <li className="list-inline-item">
                                <Link
                                  to="/page-profile-edit"
                                  className="rounded"
                                >
                                  <i className="uil uil-cog align-middle"></i>
                                </Link>
                              </li>
                            </ul>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
        <section className="section">
          <MostViewedProducts ethereumAddress={this.state.ethereumAddress} />

          {/* <TopCategories />

          <PopularProducts /> */}

          {/* <Cta /> */}

          {/* <RecentProducts /> */}
        </section>
      </React.Fragment>
    );
  }
}

export default Index;
