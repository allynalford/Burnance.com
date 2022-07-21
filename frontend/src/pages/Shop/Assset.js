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
var endpoint = require('../../common/endpoint');

class Asset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: `${process.env.REACT_APP_BASE_CDN_URL}/loading.jpg`,
      name: '',
      isOpen: false,
    };
    this.getNFT.bind(this);
    this.openModal.bind(this);
    this.checkNFTImage.bind(this);
    this.testImage.bind(this);
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
      console.log(e);
    }
  };

  getNFT = async (chain, contractAddress, tokenId, imageUrl, Expires) => {
    console.log('Calling for: ', { chain, contractAddress, tokenId, imageUrl });
    //Call the service to get the NFTs
    try {
      const nftMetaData = await endpoint._post(
        getChain()['eth'].getNFTImageApiUrl,
        { chain, contractAddress, tokenId, imageUrl, Expires },
      );

      //If we found the NFT use the image URL
      if (typeof nftMetaData.data !== 'undefined') {
        this.setState({ imageUrl: nftMetaData.data.imageUrl });
        //console.log('Image URL set to:',  nftMetaData.data.imageUrl);
      } else {
        this.setState({
          imageUrl: `${process.env.REACT_APP_BASE_CDN_URL}/default-image.jpg`,
        });
        //setTimeout(this.getNFT(chain, contractAddress, tokenId, imageUrl, 300), 70000);
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
                  console.log(e);
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
            Tell us about your Dataset
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col md={6}>
              <img
              src={this.state.imageUrl}
              alt="Provide a database schema along with a query"
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
            <h3>Cost Basis</h3>
              <Row>
               <Col md="3">
                  ETH Price
                </Col>
                <Col md="3">
                  NFT Fee
                </Col>
                <Col md="3">
                 Gas Fee
                </Col>
                <Col md="3">
                 Total
                </Col>
              </Row>
              <Row>
              <Col md="3">
                  $0.00
                </Col>
                <Col md="3">
                  $0.00
                </Col>
                <Col md="3">
                 $0.00
                </Col>
                <Col md="3">
                $0.00
                </Col>
              </Row>
              <hr style={{marginTop: '10px'}}/>
              <h3>Profit and Lost</h3>
              <Row>
               <Col md="3">
                  ETH Price
                </Col>
                <Col md="3">
                  NFT Fee
                </Col>
                <Col md="3">
                 Gas Fee
                </Col>
                <Col md="3">
                 Total
                </Col>
              </Row>
              <Row>
              <Col md="3">
                  $0.00
                </Col>
                <Col md="3">
                  $0.00
                </Col>
                <Col md="3">
                 $0.00
                </Col>
                <Col md="3">
                $0.00
                </Col>
              </Row>


            </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
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
