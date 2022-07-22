import React, { Component } from 'react';
import {
  Card,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { getChain } from '../../common/config';
import localStorage from 'localStorage'
var endpoint = require('../../common/endpoint');

var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

class Asset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: `${process.env.REACT_APP_BASE_CDN_URL}/loading.jpg`,
      name: '',
      isOpen: false,
      txUrl: '',
      ethPrice: 0,
      nftETH: 0,
      nftUSD: 0,
      total: 0,
      diff: 0,
      nftCurrentUSD: 0,
      ethCurrentPrice: 0
    };
    this.getNFT.bind(this);
    this.openModal.bind(this);
    this.checkNFTImage.bind(this);
    this.testImage.bind(this);
    this.getNFTTX.bind(this);
    this.getETHprice.bind(this);
  }

  componentDidMount() {
    //Check if the NFT has an image
    if ((this.props.nft.imageUrl === '') | (this.props.nft.imageUrl === null)) {
      // //Since we don't. Call our service to get it
      this.setState({
        imageUrl: `${process.env.REACT_APP_BASE_CDN_URL}/default-image.jpg`,
      });
    } else {
      this.setState({ imageUrl: this.props.nft.imageUrl });
    }

    //Run the image check to see if we have it available

    this.checkNFTImage(
      'ethereum',
      this.props.nft.collectionAddress,
      this.props.nft.collectionTokenId,
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.nft !== this.props.nft) {
      this.checkNFTImage(
        'ethereum',
        this.props.nft.collectionAddress,
        this.props.nft.collectionTokenId,
        '',
        300,
      );
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (nextState.imageUrl !== this.state.imageUrl) {
  //     return true;
  //   } else if (nextProps.nft !== this.props.nft) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  testImage(url, timeoutT) {
    return new Promise(function (resolve, reject) {
      var timeout = timeoutT || 5000;
      var timer,
        img = new Image();
      img.onerror = img.onabort = function () {
        clearTimeout(timer);
        reject('error');
      };
      img.onload = function () {
        clearTimeout(timer);
        resolve('success');
      };
      timer = setTimeout(function () {
        // reset .src to invalid URL so it stops previous
        // loading, but doesn't trigger new load
        img.src = '//!!!!/test.jpg';
        reject('timeout');
      }, timeout);
      img.src = url;
    });
  }

  checkNFTImage = async (chain, contractAddress, tokenId) => {
    //Check if the NFT exists in the CDN
    try {
      //Test if we have it in PNG
      let imageCheck = await this.testImage(
        `${process.env.REACT_APP_BASE_NFT_CDN_URL}/${chain}/${contractAddress}/${tokenId}.png`,
      );

      //If so set it
      if (imageCheck === 'success') {
        this.setState({
          imageUrl: `${process.env.REACT_APP_BASE_NFT_CDN_URL}/${chain}/${contractAddress}/${tokenId}.png`,
        });
      } else {
        //Check if we have it in JPG
        imageCheck = await this.testImage(
          `${process.env.REACT_APP_BASE_NFT_CDN_URL}/${chain}/${contractAddress}/${tokenId}.jpg`,
        );

        //If so set it
        if (imageCheck === 'success') {
          this.setState({
            imageUrl: `${process.env.REACT_APP_BASE_NFT_CDN_URL}/${chain}/${contractAddress}/${tokenId}.png`,
          });
        }
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  getNFT = async (chain, contractAddress, tokenId, imageUrl, Expires) => {
    //console.log('Calling for: ', { chain, contractAddress, tokenId, imageUrl });
    //Call the service to get the NFTs
    try {

      //Call the data load
      this.getNFTTX(this.props.ethereumAddress,contractAddress, tokenId );

      //Check if the image is already set
      const expectedPngImage = `${process.env.REACT_APP_BASE_NFT_CDN_URL}/${chain}/${contractAddress}/${tokenId}.png`;
      const expectedJpgImage = `${process.env.REACT_APP_BASE_NFT_CDN_URL}/${chain}/${contractAddress}/${tokenId}.jpg`;



      if(this.state.imageUrl !== expectedPngImage && this.state.imageUrl !== expectedJpgImage){

        //console.log('Calling getNFT for: ', { chain, contractAddress, tokenId, imageUrl });

        const nftMetaData = await endpoint._post(
          getChain()['eth'].getNFTImageApiUrl,
          { chain, contractAddress, tokenId, imageUrl, Expires },
        );
  
        this.getNFTTX(this.props.ethereumAddress,contractAddress, tokenId )
  
        //If we found the NFT use the image URL
        if (typeof nftMetaData.data !== 'undefined') {
          this.setState({ imageUrl: nftMetaData.data.imageUrl });
          console.log('Image URL set to:',  nftMetaData.data.imageUrl);
        } else {
          this.setState({
            imageUrl: `${process.env.REACT_APP_BASE_CDN_URL}/default-image.jpg`,
          });
          //setTimeout(this.getNFT(chain, contractAddress, tokenId, imageUrl, 300), 70000);
        }
      }




    } catch (e) {
      console.error(e);
      this.setState({
        imageUrl: `${process.env.REACT_APP_BASE_CDN_URL}/default-image.jpg`,
      });
      setTimeout(
        this.getNFT(chain, contractAddress, tokenId, imageUrl, 300),
        15000,
      );
    }
  };

  getNFTTX = async (ethereumAddress, contractAddress, tokenId) => {
    
    //Call the service to get the NFTs
    try {

      

      let NFT = JSON.parse(localStorage.getItem(ethereumAddress+contractAddress+tokenId));


      if(typeof NFT !== "undefined" && NFT !== null){
        //console.log('Using storage for: ', { ethereumAddress, contractAddress, tokenId });

        //NFT = JSON.parse(NFT);
  
        this.setState({txUrl: NFT.etherScanTxUrl, ethPrice: NFT.ethTransPriceUSD, nftETH: NFT.valueETH, nftUSD: NFT.valueUSD});
        
      }else{
        //console.log('Calling getNFTTX for: ', { ethereumAddress, contractAddress, tokenId });
        const nftTX = await endpoint._post(
          getChain()['eth'].getTokenNftTxApiUrl,
          { address: ethereumAddress, contractaddress: contractAddress, tokenId},
        );
        NFT = nftTX.data;
        this.setState({txUrl: NFT.etherScanTxUrl, ethPrice: NFT.ethTransPriceUSD, nftETH: NFT.valueETH, nftUSD: NFT.valueUSD});
        localStorage.setItem(ethereumAddress+contractAddress+tokenId, JSON.stringify(NFT));
      }

      this.getETHprice(NFT.valueETH, NFT.valueUSD);

    } catch (e) {
      console.error(e);
 
    }
  };

  getETHprice = async (valueETH, valueUSD) => {
    
    //Call the service to get the NFTs
    try {

      let ethPrice = localStorage.getItem('ethCurrentPrice');


      if(typeof ethPrice !== "undefined" && ethPrice !== null){

        const currentCost = parseFloat(valueETH * ethPrice);
        const diff = (currentCost - valueUSD);

        this.setState({ethCurrentPrice: ethPrice, nftCurrentUSD: currentCost, diff});

      }else{
        //console.log('Calling getNFTTX for: ', { ethereumAddress, contractAddress, tokenId });
        const resp = await endpoint._get(getChain()['eth'].getEthPriceApiUrl);

        console.log(resp);

        if (typeof resp.data !== 'undefined') {
          const currentCost = parseFloat(valueETH * resp.data.result.ethusd);
          this.setState({ ethCurrentPrice: resp.data.result.ethusd, nftCurrentUSD: currentCost });
          localStorage.setItem('ethCurrentPrice', resp.data.result.ethusd);
        }
      }

    } catch (e) {
      console.error(e);
 
    }
  };

  openModal = () => {
    if (this.state.isOpen === false) {
      if (
        (this.props.nft.imageUrl === '') |
        (this.props.nft.imageUrl === null)
      ) {
        this.getNFT(
          'ethereum',
          this.props.nft.collectionAddress,
          this.props.nft.collectionTokenId,
          '',
          300,
        );
      } else {
        this.getNFT(
          'ethereum',
          this.props.nft.collectionAddress,
          this.props.nft.collectionTokenId,
          this.props.nft.imageUrl,
          300,
        );
      }
    }

    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  render() {
    return (
      <React.Fragment>
        <Card className="shop-list border-0 position-relative">
          {/* <ul className="label list-unstyled mb-0">
                    {this.props.nft.isNew && (
                      <li>
                        <Link
                          to="#"
                          className="badge badge-link rounded-pill bg-primary"
                        >
                          New
                        </Link>
                      </li>
                    )}
                    {this.props.nft.isFeatured && (
                      <li><Link to="#" className="badge badge-link rounded-pill bg-success">Featured</Link></li>
                    )}
                    {this.props.nft.isSale && (
                      <li><Link to="#" className="badge badge-link rounded-pill bg-warning">Sale</Link></li>
                    )}
                  </ul> */}
          <ul className="shop-image position-relative overflow-hidden rounded shadow">
            <a
              target={'_new'}
              href={`https://opensea.io/assets/ethereum/${this.props.nft.collectionAddress}/${this.props.nft.collectionTokenId}`}
            >
              <img
                src={this.state.imageUrl}
                className="img-fluid"
                alt={this.props.nft.name}
              />
            </a>
            <a
              target={'_new'}
              href={`https://opensea.io/assets/ethereum/${this.props.nft.collectionAddress}/${this.props.nft.collectionTokenId}`}
              className="overlay-work"
            >
              <img
                src={this.state.imageUrl}
                className="img-fluid"
                alt={this.props.nft.name}
              />
            </a>
          </ul>
          <CardBody className="content pt-4 p-2">
            <a
              target={'_new'}
              href={`https://opensea.io/assets/ethereum/${this.props.nft.collectionAddress}/${this.props.nft.collectionTokenId}`}
              className="text-dark product-name h6"
            >
              {this.props.nft.name}
            </a>
            <div className="d-flex justify-content-between mt-1">
              <Button
                onClick={(e) => {
                  this.openModal();
                }}
              >
                Add NFT
              </Button>
            </div>
          </CardBody>
        </Card>
        <Modal
          isOpen={this.state.isOpen}
          role="dialog"
          autoFocus={true}
          centered={true}
          style={{ maxWidth: '800px', width: '800px' }}
        >
          <ModalHeader toggle={this.openModal}>
          <h1><a
              target={'_new'}
              href={`https://opensea.io/assets/ethereum/${this.props.nft.collectionAddress}/${this.props.nft.collectionTokenId}`}
              className="text-dark product-name h6"
            >
              {this.props.nft.name}
            </a></h1>
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col md={6}>
              <img
              src={this.state.imageUrl}
              alt={this.props.nft.name}
              height={'300px'}
            />
              </Col>
              <Col md={6}>
                <h2>            <a
              target={'_new'}
              href={`https://opensea.io/assets/ethereum/${this.props.nft.collectionAddress}/${this.props.nft.collectionTokenId}`}
              className="text-dark product-name h6"
            >
              {this.props.nft.name}
            </a></h2>
            <p>{this.props.nft.description}</p>
            <h3>Base Cost</h3>
              <Row>
               <Col md="3">
                  ETH Price
                </Col>
                <Col md="3">
                  ETH
                </Col>
                <Col md="3">
                 USD
                </Col>
                <Col md="3">
                 Total
                </Col>
              </Row>
              <Row>
              <Col md="3">
                  {formatter.format(this.state.ethPrice)}
                </Col>
                <Col md="3">
                {this.state.nftETH.toFixed(4)}
                </Col>
                <Col md="3">
                 {formatter.format(this.state.nftUSD.toFixed(2))}
                </Col>
                <Col md="3">
                $0.00
                </Col>
              </Row>
              <hr style={{marginTop: '10px'}}/>
              <h3>Current Cost</h3>
              <Row>
               <Col md="3">
                  ETH Price
                </Col>
                <Col md="3">
                  ETH
                </Col>
                <Col md="3">
                  USD
                </Col>
                <Col md="3">
                 +/-
                </Col>
              </Row>
              <Row>
              <Col md="3">
                {formatter.format(this.state.ethCurrentPrice)}
                </Col>
                <Col md="3">
                {this.state.nftETH.toFixed(4)}
                </Col>
                <Col md="3">
                {formatter.format(this.state.nftCurrentUSD)}
                </Col>
                <Col md="3" style={{color: (this.state.diff < 0 ? "#8B0000" : "#1D781D" )}}>
                {formatter.format(this.state.diff)}
                </Col>
              </Row>


            </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
          <Button 
            disabled={(this.state.txUrl === "" ? true : false)}
            color="secondary" 
            onClick={e=>{
              e.preventDefault();
             this.props.AddToBatch(this.props.nft.collectionAddress,this.props.nft.collectionTokenId, this.props.nft.name);
            }}>
              Add to Batch
            </Button>
            <Button 
            disabled={(this.state.txUrl === "" ? true : false)}
            color="secondary" 
            onClick={e=>{
              e.preventDefault();
              window.open(this.state.txUrl, "_blank")
            }}>
              View Tx on EtherScan
            </Button>
            <Button color="secondary" onClick={this.openModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </React.Fragment>
    );
  }
}

export default Asset;
