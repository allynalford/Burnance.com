import React, { Component } from "react";
import { Container, Row, Col } from "reactstrap";
import {getChain} from "../../common/config";
import Asset from "./Assset";
var endpoint = require('../../common/endpoint');


class MostViewedProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethereumAddress: '',
      walletConnected: false,
      nfts: []
    };
    this.getNFTs.bind(this);
    this.accountsChanged.bind(this);
  }



accountsChanged = () => {
   if (window.ethereum._state.isConnected && typeof window.ethereum._state.accounts[0] !== "undefined") {

    this.setState({
      ethereumAddress: window.ethereum._state.accounts[0],
      walletConnected: true,
    });

    //Get the NFTs
    this.getNFTs(window.ethereum._state.accounts[0]);

  }else if (typeof window.ethereum._state.accounts[0] === "undefined") {
    this.setState({nfts: [], walletConnected: false, ethereumAddress: ""})
  }
};

  componentDidMount() {
    document.body.classList = '';
    window.addEventListener('scroll', this.scrollNavigation, true);


    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.accountsChanged);
      if (window.ethereum._state.isConnected && typeof window.ethereum._state.accounts[0] !== "undefined") {
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });
        //console.log('account', window.ethereum._state.accounts[0])
        this.getNFTs(window.ethereum._state.accounts[0]);
      }
    } else {
      alert('install metamask extension!!');
    }

  }


  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.walletConnected === nextState.walletConnected) {
        return true
    }
    else {
        return false
    }
  }

  //Add try/catch to this function
  getNFTs = async (ethereumAddress) => {
      //Call the service to get the NFTs
      const ERC721s = await endpoint._post(getChain()['eth'].getWalletNFTsApiUrl, {address: ethereumAddress, chain: 'ethereum', pageNumber: 1});
      //console.log('ERC721s', ERC721s);
      let nfts = ERC721s.data.ERC721s.assets;
      //Set the NFTs value
      this.setState({nfts});
  };



  render() {
    return (
      <React.Fragment>
        <Container>
          <Row>
            <Col xs={12}>
              <h5 className="mb-0">Your NFT's</h5>
            </Col>
          </Row>
          <Row>
            {this.state.nfts.map((nft, key) => (
              <Col key={key} lg={3} md={6} xs={12} className="mt-4 pt-2">
                <Asset nft={nft}/>
              </Col>
            ))}
          </Row>
        </Container>
      </React.Fragment>
    );
  }
}

export default MostViewedProducts;
