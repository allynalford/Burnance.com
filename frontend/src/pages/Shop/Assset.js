import React, { Component } from "react";
import { Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import ethers from "ethers"
import { NftProvider, useNft } from "use-nft"

class Asset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    };
  }



  render() {
    return (
      <React.Fragment>
                <Card className="shop-list border-0 position-relative">
                  <ul className="label list-unstyled mb-0">
                    {product.isNew && (
                      <li>
                        <Link
                          to="#"
                          className="badge badge-link rounded-pill bg-primary"
                        >
                          New
                        </Link>
                      </li>
                    )}
                    {product.isFeatured && (
                      <li><Link to="#" className="badge badge-link rounded-pill bg-success">Featured</Link></li>
                    )}
                    {product.isSale && (
                      <li><Link to="#" className="badge badge-link rounded-pill bg-warning">Sale</Link></li>
                    )}
                  </ul>
                  <ul className="shop-image position-relative overflow-hidden rounded shadow">
                    <Link to="shop-product-detail">
                      <img
                        src={product.image}
                        className="img-fluid"
                        alt="shop"
                      />
                    </Link>
                    <Link to="shop-product-detail" className="overlay-work">
                      <img
                        src={product.imgOverlay}
                        className="img-fluid"
                        alt="shop"
                      />
                    </Link>
                    <ul className="list-unstyled shop-icons">
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
                    </ul>
                  </ul>
                  <CardBody className="content pt-4 p-2">
                    <Link
                      to="shop-product-detail"
                      className="text-dark product-name h6"
                    >
                      {product.name}
                    </Link>
                    <div className="d-flex justify-content-between mt-1">
                      <h6 className="text-muted small fst-italic mb-0 mt-1">
                        ${product.price}{" "}
                        {product.oldPrice ? (
                          <del className="text-danger ms-2">
                            ${product.oldPrice}
                          </del>
                        ) : null}
                        {product.desc ? (
                          <span className="text-success ms-1">
                            {product.desc}
                          </span>
                        ) : null}
                      </h6>
                      <ul className="list-unstyled text-warning mb-0">
                        <li className="list-inline-item">
                          <i className="mdi mdi-star me-1"></i>
                        </li>
                        <li className="list-inline-item">
                          <i className="mdi mdi-star me-1"></i>
                        </li>
                        <li className="list-inline-item">
                          <i className="mdi mdi-star me-1"></i>
                        </li>
                        <li className="list-inline-item">
                          <i className="mdi mdi-star me-1"></i>
                        </li>
                        <li className="list-inline-item">
                          <i className="mdi mdi-star"></i>
                        </li>
                      </ul>
                    </div>
                  </CardBody>
                </Card>
      </React.Fragment>
    );
  }
}

export default Asset;
