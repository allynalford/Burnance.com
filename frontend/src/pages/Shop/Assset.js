import React, { Component } from "react";
import { Card, CardBody, Button } from "reactstrap";
import { Link } from "react-router-dom";
import {getChain} from "../../common/config";
var endpoint = require('../../common/endpoint');

class Asset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: `${process.env.REACT_APP_BASE_CDN_URL}/loading.jpg`,
      name: ""
    };
    this.getNFT.bind(this);
  }

  componentDidMount() {

      //Check if the NFT has an image
    if(this.props.nft.imageUrl === "" | this.props.nft.imageUrl === null){
      //Since we don't. Call our service to get it
      this.setState({imageUrl: `${process.env.REACT_APP_BASE_CDN_URL}/loading.jpg`});
      //setTimeout(this.getNFT('ethereum', this.props.nft.collectionAddress, this.props.nft.collectionTokenId, "", 300), 5500);
      this.getNFT('ethereum', this.props.nft.collectionAddress, this.props.nft.collectionTokenId, "", 300)
    }else{
      console.log('ELSE');
      this.setState({imageUrl: this.props.nft.imageUrl});
      //setTimeout(this.getNFT('ethereum', this.props.nft.collectionAddress, this.props.nft.collectionTokenId, this.props.nft.imageUrl, 300), 5500);
      this.getNFT('ethereum', this.props.nft.collectionAddress, this.props.nft.collectionTokenId, this.props.nft.imageUrl, 300)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.nft !== this.props.nft) {
      this.getNFT('ethereum', this.props.nft.collectionAddress, this.props.nft.collectionTokenId, "", 300);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.imageUrl !== this.state.imageUrl) {
      return true
    } else if (nextProps.nft !== this.props.nft) {
      return true
    } else {
      return false;
    }
  }

  getNFT = async (chain, contractAddress, tokenId, imageUrl, Expires) => {
    //console.log('Calling for: ', {chain, contractAddress, tokenId, imageUrl})
    //Call the service to get the NFTs
    try{
      const nftMetaData = await endpoint._post(getChain()['eth'].getNFTImageApiUrl, {chain, contractAddress, tokenId, imageUrl, Expires});
   
      if (imageUrl === "") {
        //If we found the NFT use the image URL
        if (typeof nftMetaData.data !== "undefined") {
          this.setState({ imageUrl: nftMetaData.data.imageUrl });
          //console.log('Image URL set to:',  nftMetaData.data.imageUrl);
        } else {
          this.setState({ imageUrl: `${process.env.REACT_APP_BASE_CDN_URL}/default-image.jpg` });
          //setTimeout(this.getNFT(chain, contractAddress, tokenId, imageUrl, 300), 70000);
        }
      }
   

    }catch(e){
      console.error(e);
      this.setState({imageUrl: `${process.env.REACT_APP_BASE_CDN_URL}/default-image.jpg`});
      setTimeout(this.getNFT(chain, contractAddress, tokenId, imageUrl, 300), 15000);
    }
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
                    <a target={"_new"} href={`https://opensea.io/assets/ethereum/${this.props.nft.collectionAddress}/${this.props.nft.collectionTokenId}`}>
                      <img
                        src={this.state.imageUrl}
                        className="img-fluid"
                        alt={this.props.nft.name}
                      />
                    </a>
                    <a target={"_new"} href={`https://opensea.io/assets/ethereum/${this.props.nft.collectionAddress}/${this.props.nft.collectionTokenId}`} className="overlay-work">
                      <img
                        src={this.state.imageUrl}
                        className="img-fluid"
                        alt={this.props.nft.name}
                      />
                    </a>
                    {/* <ul className="list-unstyled shop-icons">
                      <li>
                        <Link
                          to="#"
                          className="btn btn-icon btn-pills btn-soft-danger"
                        >
                          <i>
                            <FeatherIcon icon="heart" className="icons" />
                          </i>
                        </Link>
                      </li>
                      <li className="mt-2">
                        <Link
                          to="shop-product-detail"
                          className="btn btn-icon btn-pills btn-soft-primary"
                        >
                          <i>
                            <FeatherIcon icon="eye" className="icons" />
                          </i>
                        </Link>
                      </li>
                      <li className="mt-2">
                        <Link
                          to="shop-cart"
                          className="btn btn-icon btn-pills btn-soft-warning"
                        >
                          <i>
                            <FeatherIcon
                              icon="shopping-cart"
                              className="icons"
                            />
                          </i>
                        </Link>
                      </li>
                    </ul> */}
                  </ul>
                  <CardBody className="content pt-4 p-2">
                    <Link
                      to="shop-product-detail"
                      className="text-dark product-name h6"
                    >
                      {this.props.nft.name}
                    </Link>
                    <div className="d-flex justify-content-between mt-1">
                      <h6 className="text-muted small fst-italic mb-0 mt-1">
                        ${this.props.nft.price}{" "}
                        {this.props.nft.oldPrice ? (
                          <del className="text-danger ms-2">
                            ${this.props.nft.oldPrice}
                          </del>
                        ) : null}
                        {/* {this.props.nft.description ? (
                          <span className="text-success ms-1">
                            {this.props.nft.description}
                          </span>
                        ) : null} */}
                      </h6>
                    </div>
                    <Button>Burn NFT</Button>
                  </CardBody>
                </Card>
      </React.Fragment>
    );
  }
}

export default Asset;
