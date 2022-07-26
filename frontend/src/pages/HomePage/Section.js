/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Alert,
  FormGroup,
  Label
} from "reactstrap";
import { Link } from "react-router-dom";
import logodark from "../../assets/images/burnance_logo.png";
import {initGA, PageView, Event} from "../../common/gaUtils";
import { getUser } from "../../common/config";
import { AvForm, AvField } from 'availity-reactstrap-validation';
const endpoint = require('../../common/endpoint');
const Swal = require('sweetalert2');

class Section extends Component {
  constructor(props) {
    super(props);

    this.validDomains = ['opensea.io', 'rarible.com', 'looksrare.org'];
    this.validPathStarts = ['assets', 'token', 'collections'];

    this.state = {
      isOpen: false,
      isOpenCopy: false,
      nftAltText: "",
      nftImg: logodark,
      assetUrl: "",
      message: "",
      loading: false,
      attributes: [],
      openSeaUrl: "https://www.sandbox.game/en/model-viewer/e98b590e-a130-437d-9a14-6d9fd7bd3411/",
      emailaddress: ""
    };
    this.openModal = this.openModal.bind(this);
    this.getNFT = this.addToWaitList.bind(this);
    this.fireMsg = this.fireMsg.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.scrollNavigation, true);
    initGA();
    PageView();
}

  openModal() {
    window.open(this.state.openSeaUrl, "_new");
  }


  fireMsg(title, text, icon){
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'Ok',
      confirmButtonAriaLabel:'Ok',
      focusConfirm: true,
    })
  }

  async addToWaitList(e) {

    if(this.state.emailaddress === ""){
      this.fireMsg("Email Missing", `Please enter your email address`, "ERROR");
      return
    }

    this.setState({loading: true})
 
    Event("WAITLIST", "Wait List SignUp", "Waitlist Addition")

    //Make the call
    const resp = await endpoint._post(getUser().addWaitlistApiUrl, {emailaddress: this.state.emailaddress, chain: "ethereum"});

    if(typeof resp.data !== "undefined" && resp.data.success === true){
      this.setState({loading: false, emailaddress: ''});
      this.fireMsg("Your on the list", `Your email address ${this.state.emailaddress} has been added. Thank you for signing up to be notified about our launch...`, "INFO")
    }
  }

  Loader = () => {
    return (
      <div id="preloader">
        <div id="status">
          <div className="spinner">
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <React.Fragment>
        <section className="section pt-5 pb-0 mt-4">
          <Container fluid className="mt-md-1 px-0 px-md-3">
            <div className="rounded bg-light py-5 px-3 px-sm-0">
              <Row>
                <Container>
                  <Row className="align-items-center">
                    <Col lg={8} md={6} xs={12}>
                      <div className="title-heading">
                        {/* <Alert
                          style={{backgroundColor: "#D43900"}}
                          className="alert-pills shadow"
                          role="alert"
                        >
                          <span className="content">
                            BETA
                          </span>
                        </Alert> */}

                        <h1 className="heading mb-3">
                          <span className="text" style={{ color: '#1F3A93' }}>
                            Liquidity{' '}
                          </span>
                          for your{' '}
                          <span className="text" style={{ color: '#1E824C' }}>
                            Worthless NFT's
                          </span>
                        </h1>
                        <p className="para-desc text">
                          Burn your Sh!t NFTs and get PAID in (ETH) Ethereum.
                        </p>
                        {/* <div className="subcribe-form mt-4 pt-2">
                          <Alert
                            isOpen={this.state.isOpen}
                            toggle={() => this.setState({ isOpen: false })}
                            color="warning"
                          >
                            {this.state.message}
                          </Alert>
                          <AvForm
                            onSubmit={this.addToWaitList}
                            className="ms-0"
                          >
                            <FormGroup>
                              <Row>
                                <Col md="12">
                                  <Label className="form-label" for="email">
                                    Enter your E-Mail address to be notified.
                                  </Label>
                                </Col>
                                <Col md="12">
                                  <AvField
                                    type="email"
                                    aria-label="Enter your Email address"
                                    name="email"
                                    id="email"
                                    placeholder="Enter Email"
                                    required
                                    value={this.state.emailaddress}
                                    onChange={(e) =>
                                      this.setState({
                                        emailaddress: e.target.value,
                                      })
                                    }
                                    errorMessage="E-Mail is not valid!"
                                    validate={{
                                      required: {
                                        value: true,
                                        errorMessage: 'Please enter your email',
                                      },
                                      email: true,
                                      maxLength: { value: 180 },
                                    }}
                                  />
                                </Col>
                                <Col
                                  md="12"
                                  style={{
                                    marginBottom: '35px',
                                    marginTop: '5px',
                                  }}
                                >
                                  <Link
                                    to="#"
                                    className="btn mouse-down"
                                    style={{
                                      marginRight: '10px',
                                      backgroundColor: '#ff914d',
                                      color: 'white',
                                    }}
                                    disabled={this.state.loading}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      this.getNFT();
                                    }}
                                  >
                                    {this.state.loading === true
                                      ? 'Adding to list'
                                      : 'Get Ready to Burn'}
                                  </Link>
                                </Col>
                              </Row>
                            </FormGroup>
                          </AvForm>
                        </div> */}
                      </div>
                    </Col>

                    <Col
                      lg={4}
                      md={6}
                      xs={12}
                      className="mt-4 pt-2 mt-sm-0 pt-sm-0"
                    >
                      <div className="position-relative">
                        <img
                          src={this.state.nftImg}
                          className="rounded img-fluid mx-auto d-block"
                          alt={this.state.nftAltText}
                        />
                        {this.state.loading === true ? (
                          <div className="play-icon">{this.Loader()}</div>
                        ) : null}
                      </div>
                    </Col>
                  </Row>
                </Container>
              </Row>
            </div>
          </Container>
          <Container style={{ marginTop: '50px' }}>
            <Row className="align-items-center">
              <Col md={this.state.attributes.length === 0 ? '12' : '5'}>
                <div className="section-title">
                  <h2 className="title">What is Burnance</h2>
                  <p className="text mb-4">
                    Why did burnance start? CAUSE WE GOT TIRED OF CARRYING BAGS
                    in our hidden wallets! Also, liquidity issues become a
                    challenge when it comes time to tax season. Burnance
                    provides all the tools necessary to properly track and
                    realize losses on your Sh!t NFTs and soon crypto tokens. You
                    can read more about tax harvesting under our FAQs
                  </p>
                  <p className="text mb-4">
                    What burnance provides is a platform to burn your bags and
                    claim losses for your investing activities. But burnance
                    provides more than that offering deep data analytics on your
                    investment portfolios with real life tracking of purchases
                    and sales.
                  </p>
                  <p className="text mb-4">
                  The best offering yet is the Burnance BuyBack Guarantee (BBG) 
                  </p>
                </div>
              </Col>
              <Col md={this.state.attributes.length === 0 ? '12' : '5'}>
                <div className="section-title">
                  <h2 className="title">Membership</h2>
                  <p className="text mb-4">
                    Burnance Membership will provide:
                  </p>
                  <ul className="text mb-4">
                   <li>Instant liquidity on dead projects.</li>
                   <li>Analyze portfolio liquidity</li>
                   <li>Easily identify which NFT to harvest.</li>
                   <li>Ability to track tax harvest</li>
                   <li>Access to Burnance Guaranteed Buyback Program</li>
                  </ul>
                 
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </React.Fragment>
    );
  }
}

export default Section;
