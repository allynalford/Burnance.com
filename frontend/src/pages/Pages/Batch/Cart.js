import React, { Component } from "react";
import { Container, Row, Col, Table, Input, Button } from "reactstrap";
import { Link } from "react-router-dom";
import PageBreadcrumb from "../../../components/Shared/PageBreadcrumb";
import {initGA, PageView} from '../../../common/gaUtils';
import DataTable from 'react-data-table-component';
import DataTableLoader from '../../../components/DataTable';
import Web3 from 'web3';
import Burnance from '../../../abis/Burnance.json';
const Batch = require('../../../model/Batch');
const Swal = require('sweetalert2');
var storage = require('lscache');
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
    this.waitForReceipt.bind(this);
    this.loadBlockchainData.bind(this);
    this.loadWeb3.bind(this);
    this.fireMsg.bind(this);
    this.transfer.bind(this);
    this.recordTx.bind(this);
  };

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  fireMsg(title, text, icon){
    icon = icon.toLowerCase();
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'Ok',
      confirmButtonAriaLabel:'Ok',
      focusConfirm: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      timer: 5000,
      timerProgressBar: true,
    })
  };

  
  async loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.request({method: 'eth_requestAccounts'});
        //await window.ethereum.enable()
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
    } else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
}

async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const contractAddr = await Burnance.networks[networkId].address;
    const burnance = new web3.eth.Contract(Burnance.abi, contractAddr)   
    //console.log(contractAddr)
    this.setState({ burnance })
    //this.getPromissoryList()
    this.setState({ loading:false, burnanceAddr:contractAddr });

};

recordTx = async(batch, transactionHash) =>{
  console.log({transactionHash, batch});

  storage.flush();

  //Loop the batch and record each NFT
     //Record the batch transaction
     //Record the batch item
    //remove batch item from the database wallet nft table
}

transfer = async() => {
  //e.preventDefault();
  const thisss = this;
  this.setState({ transferring: true });

  //Init the object
  const batchObj = new Batch(this.state.ethereumAddress);

  //Grab the batch
  const batch = batchObj.getBatch(batchObj.address);

  //const tokenId = e.target.tokenId.value
  let addresses = [], tokenIds = [], counts = [];

  //Loop the batch
  for(const token of batch){
    addresses.push(token.address);
    tokenIds.push(token.tokenId);
    counts.push(token.qty);
  };

  this.state.burnance.methods.batchTransfer(addresses, tokenIds, counts).send({ from: this.state.ethereumAddress }).on('transactionHash', (transactionHash) => {
    console.log('Transfer transactionHash',transactionHash)  
    thisss.waitForReceipt(transactionHash, function (response) {
          if(response.status){ 
              thisss.fireMsg("NFT Transfer", "NFT transfer was successful", "INFO");
              
              const batchObj = new Batch(thisss.state.ethereumAddress);
              batchObj.delete(batchObj.address);

             
            thisss.recordTx(batch, transactionHash).then(function (result) { // (**)

              thisss.setState({ transferring: true, batch: [] });

            }).catch(err => {
              console.error(err)
              thisss.setState({ transferring: true, batch: [] });
            })

            }else{
              //alert(response.msg);
              thisss.fireMsg("NFT Transfer",response.msg, "warn");
              thisss.setState({ transferring: false});
          }
      });
  }).on('error', function(error, receipt) {
      const title = error.message.split(':')[0];
      const msg = error.message.split(':')[1]; 
      thisss.fireMsg(title, msg, "warn");
      thisss.setState({ transferring: false});
  });
}

async waitForReceipt(hash, cb) {
  const web3 = window.web3;
  const thiss = this;
  web3.eth.getTransactionReceipt(hash, function (err, receipt) {
      if (err) {
        console.log(err);
      }  
  
      if (receipt !== null) {
        if (cb) {
            if(receipt.status === '0x0') {
                cb({status:false, msg: "The contract execution was not successful, check your transaction !"});
            } else {
                cb({status:true, msg:"Execution worked fine!"});
            }
        }
      } else {
        window.setTimeout(function () {
          thiss.waitForReceipt(hash, cb);
        }, 1000);
      }
  });
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
              </Col>
            </Row>
            <Row>
              <Col lg={8} md={6} className="mt-4 pt-2">
                <Link to="/collections" className="btn btn-primary" >
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
                  <Button disabled={this.state.transferring} 
                    to="shop-checkouts" 
                    className="btn btn-primary"
                    onClick={ e =>{
                      e.preventDefault();
                      this.transfer();
                    }}>
                    Proceed to Sell
                  </Button>
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
