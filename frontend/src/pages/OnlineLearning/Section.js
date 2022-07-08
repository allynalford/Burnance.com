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
  Form,
  Input,
  Label
} from "reactstrap";
import { Link } from "react-router-dom";
import copy from 'copy-to-clipboard';
import hero from "../../assets/images/nfts/Doggy-0745.png";
import {Event} from "../../common/gaUtils";
const endpoint = require('../../common/endpoint');
const parse = require('url-parse')
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
      nftImg: hero,
      assetUrl: "",
      message: "",
      loading: false,
      attributes: [],
      openSeaUrl: "https://www.sandbox.game/en/model-viewer/e98b590e-a130-437d-9a14-6d9fd7bd3411/"
    };
    this.openModal = this.openModal.bind(this);
    this.getNFT = this.getNFT.bind(this);
    this.copyTo = this.copyTo.bind(this);
    this.fireMsg = this.fireMsg.bind(this);
  }

  openModal() {
    window.open(this.state.openSeaUrl, "_new");
  }

  copyTo(e) {
    e.preventDefault();
    copy(this.state.nftAltText);
    this.setState({isOpenCopy: true});
    setTimeout(this.setState({isOpenCopy: false}), 50000);
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

  async getNFT() {
  
    this.setState({ loading: true, isOpen: false });

    try {
      const url = parse(this.state.assetUrl, true);
      let contractAddress, tokenId, marketUrl, marketPlace;
      Event("AltTextRequest", "Request", "NFT Alt Text", url);

      if (typeof url !== "undefined") {

  


        //Check if the domain is in the valid list
        if (this.validDomains.includes(url.host) !== true) {
          //Throw error response
          this.setState({ message: "We currently only support OpenSea, Rarible and Looks Rare urls", isOpen: true, loading: false });
          Event("AltTextRequest", "Request Error", "Failed", "We currently only support OpenSea, Rarible and Looks Rare urls");
          return false;
        }

        //https://opensea.io/assets/0x2106c00ac7da0a3430ae667879139e832307aeaa/7257
        //https://rarible.com/token/0x2106C00Ac7dA0A3430aE667879139E832307AeAa:7257?tab=details
        //https://looksrare.org/collections/0x2106C00Ac7dA0A3430aE667879139E832307AeAa/7257
        const pathnameList = url.pathname.split('/');

        if(url.host === this.validDomains[0]){

          contractAddress = pathnameList[2];
          tokenId = pathnameList[3];
          marketUrl = `https://${this.validDomains[0]}/${this.validPathStarts[0]}/${contractAddress}/${tokenId}`;
          marketPlace = url.host;
          if (url.pathname.startsWith("/" + this.validPathStarts[0]) === false) {
            //Throw error response
            this.setState({ message: "Invalid Opensea Assets URL", isOpen: true, loading: false });
            Event("AltTextRequest", "Request Error", "Failed", "Invalid Asset URL");
            return false;
          }


        }else if(url.host === this.validDomains[1]){
          const contractAddressToken = pathnameList[2].split(":");
          contractAddress = contractAddressToken[0];
          tokenId = contractAddressToken[1];
          marketUrl = `https://${this.validDomains[1]}/${this.validPathStarts[1]}:${contractAddress}/${tokenId}?tab=details`;
          marketPlace = url.host;
          if (url.pathname.startsWith("/" + this.validPathStarts[1]) === false) {
            //Throw error response
            this.setState({ message: "Invalid Rarible token URL", isOpen: true, loading: false });
            Event("AltTextRequest", "Request Error", "Failed", "Invalid Asset URL");
            return false;
          }

        }else{
          contractAddress = pathnameList[2];
          tokenId = pathnameList[3];
          marketUrl = `https://${this.validDomains[2]}/${this.validPathStarts[2]}/${contractAddress}/${tokenId}`;
          marketPlace = url.host;
          if (url.pathname.startsWith("/" + this.validPathStarts[2]) === false) {
            //Throw error response
            this.setState({ message: "Invalid Looksrare collections URL", isOpen: true, loading: false });
            Event("AltTextRequest", "Request Error", "Failed", "Invalid Asset URL");
            return false;
          }
        }


        if (typeof contractAddress === "undefined") {
          //Throw error response
          this.setState({ message: "Invalid Asset URL", isOpen: true, loading: false });
          Event("AltTextRequest", "Request Error", "Failed", "Invalid Asset URL");
          return false;
        }

        if (typeof tokenId === "undefined") {
          //Throw error response
          this.setState({ message: "Invalid Asset URL: No Token ID", isOpen: true, loading: false });
          Event("AltTextRequest", "Request Error", "Failed", "Invalid Asset URL: No Token ID");
          return false;
        }

        if (contractAddress.length !== 42) {
          //Throw error response
          this.setState({ message: "Invalid Asset URL: Invalid contract address", isOpen: true, loading: false });
          Event("AltTextRequest", "Request Error", "Failed", "Invalid Asset URL: Invalid contract address");
          return false;
        }



        const resp = await endpoint._post(`${process.env.REACT_APP_BASE_API_URL}/nft/view/alttext`,
          { domain: url.host, chain: "Ethereum", contractAddress, tokenId });

          if(resp.data.success === false){
            this.setState({ message: resp.data.message, isOpen: true, loading: false });
            //this.fireMsg("Trouble", resp.data.message, 'error');
            Event("AltTextRequest", "Request Error", "Failed", resp.data.message);
            return false;
          }else{
            Event("AltTextRequest", "Request", "Success", url);
            this.setState({
              nftImg: resp.data.altText.image,
              nftAltText: resp.data.altText.text,
              attributes: resp.data.metadata.attributes,
              openSeaUrl: marketUrl,
              marketPlace,
              loading: false
            });
          }
      }else{
        this.setState({ message: "Invalid Asset URL", isOpen: true, loading: false });
        Event("AltTextRequest", "Request Error", "Failed", "Invalid Asset URL");
      }
    } catch (e) {
      console.error(e);
      this.setState({ loading: false });
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
                        <Alert
                          style={{backgroundColor: "#D43900"}}
                          className="alert-pills shadow"
                          role="alert"
                        >
                          <span className="content">
                            BETA
                          </span>
                        </Alert>

                        <h1 className="heading mb-3"><span className="text" style={{color: "#1F3A93"}}>NFT</span> Burn for <span className="text" style={{color: '#1E824C'}}>Rewards</span></h1>
                        <p className="para-desc text">
                        Burn your Sh!t NFTs and get rewarded with (BRC) Burn Coin.
                        </p>
                        <p className="para-desc text">
                         The burn address is: <b>0x000000000000000000000000000000000000dEaD</b>
                        </p>
                        <div className="subcribe-form mt-4 pt-2">
                        <Alert
                          isOpen={this.state.isOpen}
                          toggle={() => this.setState({ isOpen: false })}
                          color="warning"
                        >
                         {this.state.message}
                        </Alert>
                          <Form className="ms-0">
                            <FormGroup>
                              <Row>
                                <Col md="12">
                                <Label className="form-label" for="assetUrl">
                                  Enter the NFT url from OpenSea, Rarible or Looksrare
                                </Label>
                                </Col>
                                <Col md="12">
                                  <Input
                                  size={1024}
                                  type="text"
                                  id="assetUrl"
                                  name="assetUrl"
                                  aria-label="NFT Marketplace URL"
                                  placeholder="https://opensea.io/assets/{address}/{tokenId}"
                                  value={this.state.assetUrl}
                                  disabled={this.state.loading}
                                  onChange={e => {
                                    this.setState({ assetUrl: e.target.value })
                                  }}
                                /></Col>
                                <Col md="12" style={{ marginBottom: '35px', marginTop: '5px' }}>
                                  <Link
                                    to="#"
                                    className="btn mouse-down"
                                    style={{ marginRight: '10px', backgroundColor: '#CF000F', color: 'white' }}
                                    disabled={this.state.loading}
                                    onClick={e => {
                                      e.preventDefault();
                                      this.getNFT();
                                    }}>
                                    Burn NFT
                                  </Link></Col>
                              </Row>
                            </FormGroup>
                          </Form>
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
                        {(this.state.loading === true ? <div className="play-icon">
                          {this.Loader()}
                        </div> : null)}
                        
                      </div>
                    </Col>
                  </Row>
                </Container>
              </Row>
            </div>
          </Container>
          <Container style={{marginTop: "50px"}}>
            <Row className="align-items-center">
              <Col md={(this.state.attributes.length === 0 ? "12" : "5" )}>
                <div className="section-title">
                  <h2 className="title">NFT Rewards for Burn</h2>
                  <p className="text-primary mb-4">
                    {(this.state.attributes.length === 0 ? "Your burn reward amount will appear Below" : "View NFT Burn Rewards Below")}
                    
                  </p>
                  <Alert
                    isOpen={this.state.isOpenCopy}
                    toggle={() => this.setState({ isOpenCopy: false })}
                    color="success"
                  >
                    {"Alternative Text Copied to Clipboard"}
                  </Alert>
                  <p className="text mb-0">
                    {this.state.nftAltText}
                  </p>
                  {(this.state.attributes.length === 0 ? null : <div className="mt-4">
                    <a href={"#waitlist"} 
                      style={{marginRight: '10px', backgroundColor: '#D43900', color: 'white'}}
                      className="btn mouse-down">
                      Use the API
                    </a>
                    <a href={this.state.assetUrl} target="_new" className="btn btn-primary mouse-down">
                       View on {this.state.marketPlace}
                    </a>
                    <Link style={{marginLeft: '10px', backgroundColor: '#1E824C', color: 'white'}} to={"#"} onClick={this.copyTo} className="btn mouse-down">
                       Copy
                    </Link>
                  </div>)}
                </div>
              </Col>
              {(this.state.attributes.length === 0 ? null : <Col md="7" className="mt-4 mt-sm-0 pt-2 pt-sm-0">
                <div className="ms-md-4">
                  <Row>
                  {this.state.attributes.map(trait => {
                    return (
                    <Col md="4">
                      <p className="title text"><b>{trait.trait_type}</b> : {trait.value}</p>
                    </Col>
                    )
                  })}
                  </Row>
                </div>
              </Col> )} 
            </Row>
          </Container>
        </section>
      </React.Fragment>
    );
  }
}

export default Section;
