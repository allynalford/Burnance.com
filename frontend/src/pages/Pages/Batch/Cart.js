import React, { Component } from "react";
import { Container, Row, Col, Table, Input } from "reactstrap";
import { Link } from "react-router-dom";
import PageBreadcrumb from "../../../components/Shared/PageBreadcrumb";
import {initGA, PageView} from '../../../common/gaUtils';
import DataTable from 'react-data-table-component';
import DataTableLoader from '../../../components/DataTable';
const Batch = require('../../../model/Batch');
var USD = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'USD'});

class ShopCart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethereumAddress: '',
      walletConnected: false,
      totalCostBasis: 0,
      totalLosses: 0,
      batch: [],
      pathItems: [
        //id must required
        { id: 1, name: "Burnance", link: "/" },
        { id: 2, name: "Collections", link: "/collections" },
        { id: 3, name: "Batch" },
      ],
    };
    this.addItem.bind(this);
    this.removeItem.bind(this);
    this.removeCartItem.bind(this);
    this.accountsChanged.bind(this);
  }

  removeCartItem = (address, tokenId) => {
    const batchObj = new Batch(this.state.ethereumAddress);
    batchObj.removeFromBatch(batchObj.address, address, tokenId);
    const batch = batchObj.getBatch(batchObj.address);
    this.setState({ batch });
  };

  addItem = (address, tokenId) => {
    const batchObj = new Batch(this.state.ethereumAddress);
    batchObj.increment(batchObj.address, address, tokenId);
    const batch = batchObj.getBatch(batchObj.address);
    this.setState({ batch });
  };

  removeItem = (address, tokenId) => {
    const batchObj = new Batch(this.state.ethereumAddress);

    //Check if the QTY would be zero and remove it
    const qty = batchObj.qty(batchObj.address, address, tokenId);

    if(qty === 1){
      //Remove the item
      batchObj.removeFromBatch(batchObj.address, address, tokenId)
    }else{
      //Decrement if the qty isn't already 1
      batchObj.decrement(batchObj.address, address, tokenId);
    }
    //Grab the updated batch
    const batch = batchObj.getBatch(batchObj.address);
    //Update the UI
    this.setState({ batch });
  };


  componentDidMount() {


    try{
      document.body.classList = '';
      document.getElementById('top-menu').classList.add('nav-light');
      window.addEventListener('scroll', this.scrollNavigation, true);
    }catch(e){
      console.warn(e.message);
    }

    initGA();
    PageView();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.accountsChanged);
      if (
        window.ethereum._state.isConnected &&
        typeof window.ethereum._state.accounts[0] !== 'undefined'
      ) {

        const batchObj = new Batch(window.ethereum._state.accounts[0]);

        const batch = batchObj.getBatch(batchObj.address);
        console.log(batch)
     
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
          batch
        });
       
      }
    }
  }

  accountsChanged = () => {
    if (
      window.ethereum._state.isConnected &&
      typeof window.ethereum._state.accounts[0] !== 'undefined'
    ) {

      if (this.state.ethereumAddress === "") {

        const batchObj = new Batch(window.ethereum._state.accounts[0]);

        const batch = batchObj.getBatch(batchObj.address);
        console.log(batch);
     
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
          batch
        });
      }
    } else if (typeof window.ethereum._state.accounts[0] === 'undefined') {
      this.setState({ batch: [], walletConnected: false, ethereumAddress: '' });
    }
  };

  // Make sure to remove the DOM listener when the component is unmounted.
  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollNavigation, true);
  }

  scrollNavigation = () => {
    var doc = document.documentElement;
    var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    if (top > 80) {
      document.getElementById("topnav").classList.add("nav-sticky");
    } else {
      document.getElementById("topnav").classList.remove("nav-sticky");
    }
  };

  render() {

    const customStyles = {
      headRow: {
        style: {
          border: 'none',

        },
      },
      headCells: {
        style: {
          color: '#202124',
          fontWeight: 'bold',
          fontSize: '16px'
        },
      },
      rows: {
        highlightOnHoverStyle: {
          backgroundColor: 'rgb(230, 244, 244)',
          borderBottomColor: '#FFFFFF',
          borderRadius: '25px',
          outline: '1px solid #FFFFFF',
        },
      },
      pagination: {
        style: {
          border: 'none',
        },
      },
    };

    return (
      <React.Fragment>
        {/* breadcrumb */}
        <PageBreadcrumb
          title="NFT Sell Batch"
          pathItems={this.state.pathItems}
        />
        <div className="position-relative">
          <div className="shape overflow-hidden text-white">
            <svg
              viewBox="0 0 2880 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        </div>

        <section className="section">
          <Container>
            <Row>
              <Col xs={12}>
              <DataTable
                    title={'Sell Batch'}
                    customStyles={customStyles}
                    highlightOnHover
                    pointerOnHover
                    progressPending={this.state.loading}
                    progressComponent={<DataTableLoader width={'100%'} />}
                    onSelectedRowsChange={this.handleRowSelect}
                    columns={[
                      {
                        cell: (row) => (
                          <Link
                              to="#"
                              onClick={() => this.removeCartItem(row.address, row.tokenId)}
                              className="text-danger"
                              alt={`Remove ${row.title} from batch`}
                            >
                              X
                          </Link>
                        ),
                        width: '56px', // custom width for icon button
                        style: {
                          borderBottom: '1px solid #FFFFFF',
                          marginBottom: '-1px',
                        },
                      },
                      {
                        name: 'Asset',
                        selector: (row) =>  row.name,
                        format: row => (<div>
                          <img
                          src={row.imgSrc}
                          className="img-fluid avatar avatar-small rounded shadow"
                          style={{ height: "auto", marginRight: '15px', marginBottom: '5px', marginTop: '5px' }}
                          alt={`${row.title} ${row.tokenType} token`}
                        />&nbsp;{row.name}
                        </div>),
                        sortable: true,
                        grow: 3,
                        style: {
                          color: '#202124',
                          fontSize: '16px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: 'Cost Basis',
                        selector: (row) => row.AmountInvested,
                        sortable: true,
                        format: (row) => USD.format(row.AmountInvested),
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: 'Token Type',
                        selector: (row) => row.AmountInvested,
                        sortable: true,
                        format: (row) => row.tokenType,
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: 'Quantity',
                        selector: (row) => (<div className="text-center qty-icons">
                        <Input
                          type="button"
                          value="-"
                          aria-label="reduce quantity"
                          onClick={() => this.removeItem(row.address, row.tokenId)}
                          className="minus btn btn-icon btn-soft-primary"
                          disabled={(row.tokenType === "ERC721" ? true : false)}
                          readOnly
                        />{" "}
                        <Input
                          type="text"
                          step="1"
                          min="1"
                          name="quantity"
                          value={row.qty}
                          title="Qty"
                          disabled={(row.tokenType === "ERC721" ? true : false)}
                          readOnly
                          className="btn btn-icon btn-soft-primary qty-btn quantity"
                        />{" "}
                        <Input
                          type="button"
                          value="+"
                          aria-label="Increase quantity"
                          onClick={() => this.addItem(row.address, row.tokenId)}
                          disabled={(row.tokenType === "ERC721" ? true : false)}
                          readOnly
                          className="plus btn btn-icon btn-soft-primary"
                        />
                      </div>),
                        sortable: true,
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      }
                    ]}
                    data={this.state.batch}
                    pagination
                  />
                {/* <div className="table-responsive bg-white shadow">
                  <Table className="table-center table-padding mb-0">
                    <thead>
                      <tr>
                        <th className="py-3 border-bottom" style={{ minWidth: "20px" }}>Remove</th>
                        <th className="py-3 border-bottom" style={{ minWidth: "300px" }}>
                          Asset
                        </th>
                        <th
                          className="text-center py-3 border-bottom"
                          style={{ minWidth: "160px" }}
                        >
                          Cost Basis
                        </th>
                        <th
                          className="text-center py-3 border-bottom"
                          style={{ minWidth: "160px" }}
                        >
                          Qty
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {this.state.batch.map((item, key) => (
                        <tr key={key} className="shop-list">
                          <td className="h6">
                            <Link
                              to="#"
                              onClick={() => this.removeCartItem(item.address, item.tokenId)}
                              className="text-danger"
                            >
                              X
                            </Link>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={item.imgSrc}
                                className="img-fluid avatar avatar-small rounded shadow"
                                style={{ height: "auto" }}
                                alt=""
                              />
                              <h6 className="mb-0 ms-3">{item.name}</h6>
                            </div>
                          </td>
                          <td className="text-center">{USD.format(item.costUSD)}</td>
                          <td className="text-center qty-icons">
                            <Input
                              type="button"
                              value="-"
                              aria-label="reduce quantity"
                              onClick={() => this.removeItem(item.address, item.tokenId)}
                              className="minus btn btn-icon btn-soft-primary"
                              disabled={(item.tokenType === "ERC721" ? true : false)}
                              readOnly
                            />{" "}
                            <Input
                              type="text"
                              step="1"
                              min="1"
                              name="quantity"
                              value={item.qty}
                              title="Qty"
                              disabled={(item.tokenType === "ERC721" ? true : false)}
                              readOnly
                              className="btn btn-icon btn-soft-primary qty-btn quantity"
                            />{" "}
                            <Input
                              type="button"
                              value="+"
                              aria-label="Increase quantity"
                              onClick={() => this.addItem(item.address, item.tokenId)}
                              disabled={(item.tokenType === "ERC721" ? true : false)}
                              readOnly
                              className="plus btn btn-icon btn-soft-primary"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div> */}
              </Col>
            </Row>
            <Row>
              <Col lg={8} md={6} className="mt-4 pt-2">
                <Link to="/collections" className="btn btn-primary">
                  Add More
                </Link>
              </Col>
              <Col lg={4} md={6} className="ms-auto mt-4 pt-2">
                <div className="table-responsive bg-white rounded shadow">
                  <Table className="table-center table-padding mb-0">
                    <tbody>
                      <tr>
                        <td className="h6">Cost Basis Total</td>
                        <td className="text-center fw-bold">{USD.format(this.state.totalCostBasis)}</td>
                      </tr>
                      <tr className="bg-light">
                        <td className="h6">Total Losses</td>
                        <td className="text-center fw-bold">{USD.format(this.state.totalLosses)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
                <div className="mt-4 pt-2 text-end">
                  <Link to="shop-checkouts" className="btn btn-primary">
                    Proceed to Sell
                  </Link>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </React.Fragment>
    );
  }
}

export default ShopCart;
