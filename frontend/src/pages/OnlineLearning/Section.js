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
                        <div className="subcribe-form mt-4 pt-2">
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
                        </div>
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
                  <h2 className="title">NFT Rewards for Burn</h2>
                  <p className="text mb-4">
                    The Worst Thing About Having Useless Crypto Assets: The Tax
                    Man Cometh We've all been there. You invest in what you
                    think is the next big thing, only to watch it flounder and
                    become completely worthless. And if your investment is in a
                    cryptocurrency, the situation is even worse. Not only are
                    you out the money you invested, but you may also be on the
                    hook for taxes on the "gains" you never realized.
                  </p>
                  <p className="text mb-4">
                    But there is a silver lining. If you can find a liquidity
                    provider that is willing to purchase your worthless crypto
                    assets, you can trigger a tax event that will allow you to
                    deduct your losses. This can be a huge relief, especially if
                    you've lost a significant amount of money on your
                    investment.
                  </p>
                  <p className="text mb-4">
                    Of course, finding a liquidity provider can be difficult.
                    They are not always easy to find, and even when you do find
                    one, they may not be willing to purchase your assets. But it
                    is worth looking into, as it can be a lifesaver come tax
                    time.
                  </p>
                  <Alert
                    isOpen={this.state.isOpenCopy}
                    toggle={() => this.setState({ isOpenCopy: false })}
                    color="success"
                  >
                    {'Alternative Text Copied to Clipboard'}
                  </Alert>
                </div>
              </Col>
              {this.state.attributes.length === 0 ? null : (
                <Col md="7" className="mt-4 mt-sm-0 pt-2 pt-sm-0">
                  <div className="ms-md-4">
                    <Row>
                      {this.state.attributes.map((trait) => {
                        return (
                          <Col md="4">
                            <p className="title text">
                              <b>{trait.trait_type}</b> : {trait.value}
                            </p>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                </Col>
              )}
            </Row>
          </Container>
        </section>
      </React.Fragment>
    );
  }
}

export default Section;
