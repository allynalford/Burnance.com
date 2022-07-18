import React, { Component } from "react";
import MostViewedProducts from "./MostViewedProducts";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
} from "reactstrap";
//Import Icons
//Import Images
import imgbg from "../../assets/images/account/bg.png";
import {initGA, PageView} from "../../common/gaUtils";

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethereumAddress: '',
      walletConnected: false,
      ethBalance: '',
    };

    this.accountsChanged.bind(this);
  }

  componentDidMount() {
    document.body.classList = '';
    window.addEventListener('scroll', this.scrollNavigation, true);

    initGA();
    PageView();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.accountsChanged);
      if (window.ethereum._state.isConnected && typeof window.ethereum._state.accounts[0] !== "undefined") {
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });
        //console.log('account', window.ethereum._state.accounts[0])
        //this.getEthBalance(window.ethereum._state.accounts[0]);
      }
    } 
  }

  // Make sure to remove the DOM listener when the component is unmounted.
  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollNavigation, true);
    //window.ethereum.off('disconnect', this.disconnect);
  
  }

 accountsChanged = () => {
  if (window.ethereum._state.isConnected && typeof window.ethereum._state.accounts[0] !== "undefined") {
    this.setState({
      ethereumAddress: window.ethereum._state.accounts[0],
      walletConnected: true,
    });
    //console.log('account', window.ethereum._state.accounts[0])
    //this.getEthBalance(window.ethereum._state.accounts[0]);
  }else if (typeof window.ethereum._state.accounts[0] === "undefined") {
    this.setState({walletConnected: false, ethereumAddress: ""})
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
                      {/* <Col lg="2" md="3" className="text-md-start text-center">
                        <img
                          src={profile}
                          className="avatar avatar-large rounded-circle shadow d-block mx-auto"
                          alt=""
                        />
                      </Col> */}

                      <Col lg="10" md="9">
                        <Row className="align-items-end">
                          <Col
                            md="7"
                            className="text-md-start text-center mt-4 mt-sm-0"
                          >
                            <h3 className="title mb-0">
                              {this.state.ethereumAddress}
                            </h3>
                            {/* <small className="text-muted h6 me-2">
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
                            </ul> */}
                          </Col>
                          <Col md="5" className="text-md-end text-center">
                          {/* <Link
                      to="#"
                      target="_blank"
                      className="btn btn-pills"
                      style={{ backgroundColor: '#ff914d'}}
                      onClick={e => {
                        e.preventDefault();
                        if(this.state.walletConnected === false){
                          this.connectWallet();
                        }else{
                          console.log('Wallet Connected')
                        }
                      }}>{(this.state.walletConnected === true ? "Connected" : "Connect Wallet")}
                    </Link> */}
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
          <MostViewedProducts walletConnected={this.state.walletConnected} ethereumAddress={this.state.ethereumAddress} />

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
