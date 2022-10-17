/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
import React, { Component } from "react";
import {
  Container,
  Row,
  Col
} from "reactstrap";
//import { Link } from "react-router-dom";
import logodark from "../../assets/images/takinshots/1.png";
import {initGA, PageView, Event} from "../../common/gaUtils";
import { getUser } from "../../common/config";
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
                    <Col lg={8} md={4} xs={12}>
                      <div className="title-heading">
                        <h1 className="heading mb-3">
                          Screw a fancy website, we will worry about that later.
                        </h1>
                        <p className="para-desc text">
                          NFTs, Crypto, Stocks, and MORE
                        </p>
                      </div>
                    </Col>

                    <Col
                      lg={4}
                      md={8}
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
                  <h2 className="title">About the project</h2>
                  <Row>
                    <Col md="8">
                      <p className="text mb-4">
                        First I am a straight up dude (Nick Alberino-FL)! I own
                        a few successful companies, I work my ass off and trade
                        daily, lately pretty much all day. I trade with the best
                        of the best and do pretty damn well with it, proof in my
                        posts. Also, you bet your a$$ I built this site myself,
                        as you can tell I am far from a developer, but have my
                        kickass team who is great- we will use them later. I’m
                        also fully doxxed, you can see on my social medias
                        (IG:@nickalbs twitter:@nickalbs1)- you want to know more
                        just DM me!
                      </p>
                      <h3 className="title">The How:</h3>
                  <p className="text mb-4">
                    So, I’ve been thinking about dropping a project, running
                    "the how's," "the what's" and "the why's" all through my
                    head. I thought of many ideas and I landed on the direction
                    I wanted to go. I never thought I would get this immersed
                    into the web3/trading space, but here I am. This space has
                    opened so many opportunities/networking, and even made some
                    great friends on this chaotic journey. Thinking it all
                    through, we all know the most valuable projects are the true
                    organic ones.&nbsp;
                    <b>
                      I felt it definitely would be cool to drop an organic
                      project, with no expectations, but already packed with
                      UTILITY from day 1!
                    </b>
                  </p>
                    </Col>
                    <Col md="4">
                      <div className="position-relative">
                        <img
                          alt="Taking Shots"
                          style={{ textAlign: 'left' }}
                          className="rounded img-fluid mx-auto d-block"
                          src="https://img1.wsimg.com/isteam/ip/56c0d919-6409-4efe-9e9f-832f964fd2f9/blob.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:1280"
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col md={this.state.attributes.length === 0 ? '12' : '5'}>
                <div className="section-title">

                  <p className="text mb-4">
                    So, like I said I trade with the best of the best covering
                    all assets (NFT/Crypto/Stocks). Trading comes first for me!
                    I thought about starting an alpha group, but to be honest, I
                    do not want the liability and pressure to keep everyone
                    happy. That being said, I will always share all my insight
                    and “whys” of my trades and set ups, answer all questions
                    and educate anyone who needs. What I enjoy more is a vibing
                    community{' '}
                    <span
                      style={{
                        textDecoration: 'underline',
                        fontWeight: 'bold',
                      }}
                    >
                      building true value.
                    </span>{' '}
                    To me true value is organic growth. And the MAIN reason I
                    don't want to run an alpha group is simple, there is no
                    need, I ride with my two main alpha groups <a href="https://twitter.com/BeastNFTs" target="_new">@BeastNFTs</a> and
                    &nbsp;<a href="https://twitter.com/CyberTurtlesNFT" target="_new">@CyberTurtlesNFT</a>, which, if your serious about trading and
                    learning- those are the alpha groups to be in{' '}
                    <span
                      style={{
                        textDecoration: 'underline',
                        fontWeight: 'bold',
                      }}
                    >
                      FOR SURE!
                    </span>
                  </p>
                </div>
              </Col>
              <Col md={this.state.attributes.length === 0 ? '12' : '5'}>
                <div className="section-title">
                  <h3 className="title">THE WHY:</h3>
                  <p className="text mb-4">
                    What I do love doing is entertaining while trading and
                    showing the true sweat and pain that goes into it, some of
                    you may have witnessed it yourself already. Which is where I
                    came up with my idea for my community called Takin Shots. My
                    whole life, and when you think about most people's lives,
                    they are built on Takin Shots. The community will be more
                    built through social media and youtube channel and of course
                    discord. The community will be highly entertained on all my
                    degenerate activities, behind the scenes of some badass
                    stuff, and probably gain tons of knowledge especially with
                    growing and scaling real life business. I’m absolutely sure
                    there will be much education throughout, like I said I run a
                    few successful companies, and do pretty decent at trading.
                  </p>
                </div>
              </Col>
              <Col md={this.state.attributes.length === 0 ? '12' : '5'}>
                <div className="section-title">
                  <h3 className="title">THE WHAT:</h3>
                  <p className="text mb-4">
                    <b>
                      About the Takin Shots Pass: Real simple this is going to
                      be community and TRUE givebacks
                    </b>
                    , you can ask, I literally give back randomly when I hit
                    trades even sport bets currently without even being a
                    community owner. NO LIE-just ask! I’m not asking for any
                    money, I have my own. I’m just looking to build something
                    legit, real, and the value will come on its own for me in
                    the end, hopefully! All my action will be announced so we
                    can <b>enjoy action together, ride together</b> and
                    <b>
                      <u>WIN</u> together!
                    </b>
                  </p>
                  <p className="text mb-4">
                    (Exact details on how giveaway amount will be decided is
                    unsure, but it will be exciting, and be anywhere from 1-5%
                    of the profits, ie: I hit a trade for $2,000 @ 3% $60 cash
                    will be given to a random holder- in form of cash or crypto.
                    (at the time of writing this I did $13k in profits for the
                    week- proof on my twitter @nickalbs1 and instagram
                    @takinshots)
                  </p>
                </div>
              </Col>
              <Col md={this.state.attributes.length === 0 ? '12' : '5'}>
                <div className="section-title">
                  <h2 className="title">About the mint:</h2>
                  <p className="text mb-4">
                    Passes will be pfp style, I have some drafts to share soon!
                  </p>
                  <p className="text mb-4">
                    <b>Takin Shots OG Pass:</b> (FREE MINT) 111 passes{' '}
                  </p>
                  <p className="text mb-4">
                    <b>Shot Passes</b> (222 more passes- mint,date, price- and
                    IF we drop- tba)
                  </p>
                  <p className="text mb-4">
                    <u>How passes will work:</u>
                  </p>
                  <p className="text mb-4">
                    <b>111 OG Passes:</b>
                  </p>
                  <ul className="text mb-4">
                    <li>5x entries in giveaways</li>
                    <li>Exclusive giveaways</li>
                  </ul>
                  <p className="text mb-4">222 Shot Passes:</p>
                  <ul className="text mb-4">
                    <li>1x entry in giveaways </li>
                  </ul>
                </div>
              </Col>
              <Col md={this.state.attributes.length === 0 ? '12' : '5'}>
                <div className="section-title">
                  <h3 className="title">
                    Royalties will be used to help manage community and
                    marketing, again DON’T WANT YOUR MONEY!{' '}
                  </h3>
                  <p className="text mb-4">
                    I am sure with my activity in the space there will also be
                    many more perks down the road, plus collabs and much more.
                    Mint date to be announced soon, along with the website.
                  </p>
                  <p className="text mb-4" style={{ fontWeight: 'bold' }}>
                    Now, you may ask, why the f*** would anyone do this
                  </p>
                  <ol className="text mb-4">
                    <li>I honestly don’t know</li>
                    <li>
                      to provide something unique, different and TRULY risk free
                      to the NFT space that has a chance at organic true value
                      growth{' '}
                    </li>
                    <li>
                      Since I have become so hooked on the space figured it
                      would be awesome to build a true community.{' '}
                    </li>
                  </ol>
                  <p className="text mb-4">
                    I have absolutely no idea where this will go, but I do know
                    this, we will be having a blast in this group and in real
                    life.
                  </p>
                  <p className="text mb-4">
                    This is all about Takin’ Shots and Givin’ Back!
                  </p>
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
