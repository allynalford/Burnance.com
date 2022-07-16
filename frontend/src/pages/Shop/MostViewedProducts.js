import React, { Component } from "react";
import { Container, Row, Col } from "reactstrap";
import {getChain} from "../../common/config";
import Asset from "./Assset";
import ReactPaginate from 'react-paginate';
var endpoint = require('../../common/endpoint');


class MostViewedProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethereumAddress: '',
      walletConnected: false,
      nfts: [],
      pageNumber: 0,
      pageSize: 20,
      totalPages: 0,
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
        this.getNFTs(window.ethereum._state.accounts[0], 1);
      }
    } else {
      alert('install metamask extension!!');
    }

  }


 

  //Add try/catch to this function
  getNFTs = async (ethereumAddress, pageNumber) => {
    console.log('Loading Page:', pageNumber)
      //Call the service to get the NFTs
      const ERC721s = await endpoint._post(getChain()['eth'].getWalletNFTsApiUrl, {address: ethereumAddress, chain: 'ethereum', pageNumber});
      //console.log('ERC721s', ERC721s);
      let nfts = ERC721s.data.ERC721s.assets;
      //Set the NFTs value
      this.setState({nfts, pageNumber: ERC721s.data.ERC721s.pageNumber, pageSize: 20, totalPages: ERC721s.data.ERC721s.totalPages});
  };

  ChangePage = (event) => {
    const pageNumber = event.selected + 1;
    this.getNFTs(this.state.ethereumAddress, pageNumber);
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
          {(this.state.walletConnected ? <Col xs={12}>
          <div className="mt-4 pt-2">
          <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={this.ChangePage}
              pageRangeDisplayed={5}
              pageCount={this.state.totalPages}
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              containerClassName="pagination"
              activeClassName="active"
            />
                </div>
           
          </Col> : "")}
          <Row>
            {this.state.nfts.map((nft, key) => (
              <Col key={key} lg={3} md={6} xs={12} className="mt-4 pt-2">
                <Asset nft={nft} />
              </Col>
            ))}
          </Row>
        </Container>
      </React.Fragment>
    );
  }
}

export default MostViewedProducts;
