import React, { Component } from "react";
import { Container, Row, Col } from "reactstrap";
import {getChain} from "../../common/config";
import Asset from "./Assset";
import ReactPaginate from 'react-paginate';
var _ = require('lodash');
var endpoint = require('../../common/endpoint');
const Swal = require('sweetalert2');

class MostViewedProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethereumAddress: '',
      walletConnected: false,
      nfts: [],
      pageNumber: 1,
      pageSize: 6,
      totalPages: 0,
      batch: []
    };
    this.getNFTs.bind(this);
    this.accountsChanged.bind(this);
    this.AddToBatch.bind(this);
    this.fireMsg.bind(this);
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

accountsChanged = () => {
   if (window.ethereum._state.isConnected && typeof window.ethereum._state.accounts[0] !== "undefined") {

    this.setState({
      ethereumAddress: window.ethereum._state.accounts[0],
      walletConnected: true,
    });

    //Get the NFTs
    this.getNFTs(window.ethereum._state.accounts[0], 1);

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
    } 

  }


 

  //Add try/catch to this function
  getNFTs = async (ethereumAddress, pageNumber) => {
    //console.log('Loading Page:',pageNumber);
    try {
      //Call the service to get the NFTs
      const ERC721s = await endpoint._post(getChain()['eth'].getWalletNFTsApiUrl, { address: ethereumAddress, chain: 'ethereum', pageNumber });
      //console.log('ERC721s', ERC721s);
      let nfts = ERC721s.data.ERC721s.assets;
      //Set the NFTs value
      this.setState({ nfts, pageNumber: ERC721s.data.ERC721s.pageNumber, pageSize: 6, totalPages: ERC721s.data.ERC721s.totalPages });
    } catch (e) {
      console.error(e);
    }
  };

  ChangePage = (event) => {
    const pageNumber = event.selected + 1;
    this.getNFTs(this.state.ethereumAddress, pageNumber);
  };

  AddToBatch = (contractAddress, tokenId, name) =>{
    var nft = _.find(this.state.batch, {contractAddress, tokenId});
    
    if(typeof nft === "undefined"){
      this.state.batch.push({contractAddress, tokenId});
      this.fireMsg("Added to Batch", `${name} Added to Batch`, "INFO");
    }else{
      this.fireMsg("NFT Exists", `${name} exists in Batch`, "WARN");
    }
  }

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
                <Asset AddToBatch={this.AddToBatch} ethereumAddress={this.state.ethereumAddress} nft={nft} />
              </Col>
            ))}
          </Row>
        </Container>
      </React.Fragment>
    );
  }
}

export default MostViewedProducts;
