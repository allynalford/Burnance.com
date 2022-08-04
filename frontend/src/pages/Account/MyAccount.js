import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Form,
  Label,
} from "reactstrap";
import { Link } from "react-router-dom";
import classnames from "classnames";
import {initGA, PageView} from '../../common/gaUtils';
//Import Icons
import FeatherIcon from "feather-icons-react";

//Import Slick Slider CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

//Import components
import PageBreadcrumb from "../../components/Shared/PageBreadcrumb";

//Import Images
//import client from "../../assets/images/default-image.jpg";
import { getChain } from "../../common/config";
import dateFormat from "dateformat";
import moment from "moment";
import DataTableLoader from '../../components/DataTable';
import DataTable from 'react-data-table-component';
import Web3 from 'web3';
import Burnance from '../../abis/Burnance.v2.1.json'
const endpoint = require('../../common/endpoint');
const Swal = require('sweetalert2');
var storage = require('lscache');
class MyAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "3",
      pathItems: [
        //id must required
        { id: 1, name: "Burnance", link: "/" },
        { id: 2, name: "Collections", link: "/collections" },
        { id: 3, name: "My Account", link: "/account" },
      ],
      burnanceAddr: "",
      burnance: "",
      ethereumAddress: '',
      walletConnected: false,
      account: '',
      guarantees: [],
      transferring: false,
      loading: false,
    };
    this.toggleTab = this.toggleTab.bind(this);
    this.getPromissoryList.bind(this);
    this.accountsChanged.bind(this);
    this.recordTx.bind(this);
    this.buyBack.bind(this);
    this.waitForReceipt.bind(this);
    this.loadBlockchainData.bind(this);
    this.loadWeb3.bind(this);
    this.fireMsg.bind(this);
  }
  toggleTab(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  }

  fireMsg(title, text, icon) {
    icon = icon.toLowerCase();
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'Ok',
      confirmButtonAriaLabel: 'Ok',
      focusConfirm: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
      timer: 5000,
      timerProgressBar: true,
    });
  }

  async init() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

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

    this.init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.accountsChanged);
      if (
        window.ethereum._state.isConnected &&
        typeof window.ethereum._state.accounts[0] !== 'undefined'
      ) {
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });

        this.getPromissoryList(window.ethereum._state.accounts[0]);
      }
    }
  }

  // Make sure to remove the DOM listener when the component is unmounted.
  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollNavigation, true);
  };

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      //await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!',
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const contractAddr = await Burnance.networks[networkId].address;
    const burnance = new web3.eth.Contract(Burnance.abi, contractAddr);
    this.setState({ burnance });
    //this.getPromissoryList()
    this.setState({ loading: false, burnanceAddr: contractAddr });
  }

  accountsChanged = () => {
    if (
      window.ethereum._state.isConnected &&
      typeof window.ethereum._state.accounts[0] !== 'undefined'
    ) {

      if (this.state.ethereumAddress === "") {

        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });

        this.getPromissoryList(window.ethereum._state.accounts[0]);
       }
    } else if (typeof window.ethereum._state.accounts[0] === 'undefined') {
      this.setState({ guarantees: [], walletConnected: false, ethereumAddress: '' });
    }
  };

  scrollNavigation = () => {
    var doc = document.documentElement;
    var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    if (top > 80) {
      document.getElementById("topnav").classList.add("nav-sticky");
    } else {
      document.getElementById("topnav").classList.remove("nav-sticky");
    }
  };

  recordTx = async (tokenId, transactionHash) => {
    const _ = require('lodash');
    const nft = _.find(this.state.nfts, { tokenId: tokenId });
    console.log({ tokenId, nft, transactionHash });
  };

  buyBack = async (id) => {
    //e.preventDefault();
    const thisss = this;
    this.setState({
      transferring: true,
      approving: true,
      contentLoading: true,
    });

    let buyBackPrice = await this.state.burnance.methods.buyBackPrice().call();

    //console.log(buyBackPrice);

    this.state.burnance.methods
      .buyBack(id)
      .send({ from: this.state.ethereumAddress, value: Number(buyBackPrice) })
      .on('transactionHash', (transactionHash) => {
        //console.log('Transfer transactionHash', transactionHash);
        thisss.waitForReceipt(transactionHash, function (response) {
          if (response.status) {
            thisss.fireMsg(
              'NFT Buyback',
              'NFT buy back was successful',
              'INFO',
            );

            
            thisss.recordTx(id, transactionHash).then(function (result) {
                
              //Reload the list
              thisss.getPromissoryList(thisss.state.ethereumAddress);

              //Clear out the cache
              storage.flush();

         
              }).catch((err) => console.log(err));

            thisss.setState({
              transferring: false,
              loading: false,
            });

          } else {
            //alert(response.msg);
            thisss.fireMsg('NFT Buyback', response.msg, 'WARN');
            thisss.setState({ transferring: false, loading: false });
          }
        });
      })
      .on('error', function (error, receipt) {
        const title = error.message.split(':')[0];
        const msg = error.message.split(':')[1];
        thisss.fireMsg(title, msg, 'WARN');
        thisss.setState({ transferring: false, loading: false  });
        console.warn(error.message);
        console.error(error);
      });
  };

  async waitForReceipt(hash, cb) {
    const web3 = window.web3;
    const thiss = this;
    web3.eth.getTransactionReceipt(hash, function (err, receipt) {
      if (err) {
        console.log(err);
      }

      if (receipt !== null) {
        if (cb) {
          if (receipt.status === '0x0') {
            cb({
              status: false,
              msg: 'The contract execution was not successful, check your transaction !',
            });
          } else {
            cb({ status: true, msg: 'Execution worked fine!' });
          }
        }
      } else {
        window.setTimeout(function () {
          thiss.waitForReceipt(hash, cb);
        }, 1000);
      }
    });
  }

getPromissoryList = async(address) => {
  this.setState({ loading:true });
  const guarantees = await endpoint._get(getChain()['eth'].viewWalletGuarenteeSellTxApiUrl + `/ethereum/${address}`)
  this.setState({ guarantees: guarantees.data.transactions, loading:false });
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
          title="Account"
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
              <Col md={3} className="mt-4 pt-2">
                <div className="d-flex align-items-center">
                  {/* <img
                    src={client}
                    className="avatar avatar-md-md rounded-circle"
                    alt=""
                  /> */}
                  {/* <div className="ms-3">
                    <h6 className="text mb-0">Address</h6>
                    <p className="mb-0" style={{fontSize: '10px'}}></p>
                  </div> */}
                </div>

                <ul
                  className="nav nav-pills nav-justified flex-column bg-white rounded mt-4 shadow p-3 mb-0"
                  id="pills-tab"
                  role="tablist"
                >
                  {/* <NavItem>
                    <NavLink
                      to="#"
                      className={classnames(
                        { active: this.state.activeTab === "1" },
                        "rounded"
                      )}
                      onClick={() => {
                        this.toggleTab("1");
                      }}
                    >
                      <div className="text-start py-1 px-3">
                        <h6 className="mb-0">
                          <i className="uil uil-dashboard h5 align-middle me-2 mb-0"></i>{" "}
                          Dashboard
                        </h6>
                      </div>
                    </NavLink>
                  </NavItem> */}

                  <NavItem className="mt-2">
                    <NavLink
                      className={classnames(
                        { active: this.state.activeTab === "2" },
                        "rounded"
                      )}
                      onClick={() => {
                        this.toggleTab("2");
                      }}
                      to="#"
                    >
                      <div className="text-start py-1 px-3">
                        <h6 className="mb-0">
                          <i className="uil uil-list-ul h5 align-middle me-2 mb-0"></i>{" "}
                          Sells
                        </h6>
                      </div>
                    </NavLink>
                  </NavItem>
                  <NavItem className="mt-2">
                    <NavLink
                      className={classnames(
                        { active: this.state.activeTab === "3" },
                        "rounded"
                      )}
                      onClick={() => {
                        this.toggleTab("3");
                      }}
                      to="#"
                    >
                      <div className="text-start py-1 px-3">
                        <h6 className="mb-0">
                          <i className="uil uil-list-ul h5 align-middle me-2 mb-0"></i>{" "}
                          Guarantee Sells
                        </h6>
                      </div>
                    </NavLink>
                  </NavItem>
                  <NavItem className="mt-2">
                    <NavLink
                      className={classnames(
                        { active: this.state.activeTab === "4" },
                        "rounded"
                      )}
                      onClick={() => {
                        this.toggleTab("4");
                      }}
                      to="#"
                    >
                      <div className="text-start py-1 px-3">
                        <h6 className="mb-0">
                          <i className="uil uil-arrow-circle-down h5 align-middle me-2 mb-0"></i>{" "}
                          P &amp; L
                        </h6>
                      </div>
                    </NavLink>
                  </NavItem>

                  {/* <NavItem className="mt-2">
                    <NavLink
                      className={classnames(
                        { active: this.state.activeTab === "4" },
                        "rounded"
                      )}
                      onClick={() => {
                        this.toggleTab("4");
                      }}
                      to="#"
                    >
                      <div className="text-start py-1 px-3">
                        <h6 className="mb-0">
                          <i className="uil uil-map-marker h5 align-middle me-2 mb-0"></i>{" "}
                          Addresses
                        </h6>
                      </div>
                    </NavLink>
                  </NavItem> */}

                  <NavItem className="mt-2">
                    <NavLink
                      className={classnames(
                        { active: this.state.activeTab === "5" },
                        "rounded"
                      )}
                      onClick={() => {
                        this.toggleTab("5");
                      }}
                      to="#"
                    >
                      <div className="text-start py-1 px-3">
                        <h6 className="mb-0">
                          <i className="uil uil-user h5 align-middle me-2 mb-0"></i>{" "}
                          Account Details
                        </h6>
                      </div>
                    </NavLink>
                  </NavItem>

                  {/* <NavItem className="mt-2">
                    <Link className="nav-link rounded" to="/auth-login">
                      <div className="text-start py-1 px-3">
                        <h6 className="mb-0">
                          <i className="uil uil-sign-out-alt h5 align-middle me-2 mb-0"></i>{" "}
                          Disconnect Wallet
                        </h6>
                      </div>
                    </Link>
                  </NavItem> */}
                </ul>
              </Col>

              <Col md={9} xs={12} className="mt-4 pt-2">
                <TabContent activeTab={this.state.activeTab}>
                  <TabPane
                    className="fade bg-white show shadow rounded p-4"
                    tabId="1"
                  >
                    <h6 className="text-muted">
                      Hello 
                      {/* <span className="text-dark">cally_joseph</span> (not{" "}
                      <span className="text-dark">cally_joseph</span>?{" "}
                      <Link to="#" className="text-danger">
                        Log out
                      </Link> )*/}
                      
                    </h6>

                    <h6 className="text-muted mb-0">
                      From your account dashboard you can view your{" "}
                      <Link to="#" className="text-danger">
                        Sells
                      </Link>
                      , manage your{" "}
                      <Link to="#" className="text-danger">
                        Account details
                      </Link>
                      , and{" "}
                      <Link to="#" className="text-danger">
                        view Profit &amp; Loss Statement
                      </Link>
                      .
                    </h6>
                  </TabPane>

                  <TabPane
                    className="show fade bg-white shadow rounded p-4"
                    tabId="2"
                  >
                    <div className="table-responsive bg-white shadow rounded">
                      <Table className="mb-0 table-center table-nowrap">
                        <thead>
                          <tr>
                            <th scope="col" className="border-bottom">Order no.</th>
                            <th scope="col" className="border-bottom">Date</th>
                            <th scope="col" className="border-bottom">Status</th>
                            <th scope="col" className="border-bottom">Total</th>
                            <th scope="col" className="border-bottom">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row">7107</th>
                            <td>1st November 2020</td>
                            <td className="text-success">Delivered</td>
                            <td>
                              $ 320{" "}
                              <span className="text-muted">for 2items</span>
                            </td>
                            <td>
                              <Link to="#" className="text-primary">
                                View <i className="uil uil-arrow-right"></i>
                              </Link>
                            </td>
                          </tr>

                          <tr>
                            <th scope="row">8007</th>
                            <td>4th November 2020</td>
                            <td className="text-muted">Processing</td>
                            <td>
                              $ 800{" "}
                              <span className="text-muted">for 1item</span>
                            </td>
                            <td>
                              <Link to="#" className="text-primary">
                                View <i className="uil uil-arrow-right"></i>
                              </Link>
                            </td>
                          </tr>

                          <tr>
                            <th scope="row">8008</th>
                            <td>4th November 2020</td>
                            <td className="text-danger">Canceled</td>
                            <td>
                              $ 800{" "}
                              <span className="text-muted">for 1item</span>
                            </td>
                            <td>
                              <Link to="#" className="text-primary">
                                View <i className="uil uil-arrow-right"></i>
                              </Link>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </TabPane>
                  <TabPane
                    className="show fade bg-white shadow rounded p-4"
                    tabId="3"
                  >
                    <DataTable
                    title={'Guarantee(s): ' + this.state.ethereumAddress}
                    customStyles={customStyles}
                    highlightOnHover
                    pointerOnHover
                    progressPending={this.state.loading}
                    progressComponent={<DataTableLoader width={'100%'} />}
                    columns={[
                      {
                        name: 'BuyBack',
                        selector: (row) => new Date(row.expireTime * 1000),
                        format: (row) => (
                          moment(new Date(row.expireTime * 1000)).isAfter(Date.now()) === true ? <Link 
                          onClick={ e =>{
                            this.buyBack(row.id);
                          }}
                          to={`#`}>
                          Buy
                        </Link> : <span style={{color: '#8B0000'}}>Expired</span>
                        ),
                        sortable: true,
                        style: {
                          color: '#202124',
                          fontSize: '16px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: 'Asset',
                        selector: (row) => row.title,
                        sortable: true,
                        grow: 3,
                        style: {
                          color: '#202124',
                          fontSize: '16px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: 'Cost',
                        selector: (row) => row.transferValueETH,
                        sortable: true,
                        format: (row) => row.transferValueETH + ' ETH',
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: 'Fee',
                        selector: (row) => row.transferGasETH,
                        sortable: true,
                        format: (row) => row.transferGasETH + ' wei',
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: 'Exp Date',
                        selector: (row) => row.expireTime,
                        sortable: true,
                        grow: 3,
                        format: (row) => dateFormat(new Date(row.expireTime * 1000), "mm/dd/yyyy h:MM TT Z"),
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      },
                    ]}
                    data={this.state.guarantees}
                    pagination
                  />
                    {/* <div className="table-responsive bg-white shadow rounded">
                      <Table className="mb-0 table-center table-nowrap">
                        <thead>
                          <tr>
                            <th scope="col" className="border-bottom">Buy Back</th>
                            <th scope="col" className="border-bottom">Asset</th>
                            <th scope="col" className="border-bottom">Tx. Cost</th>
                            <th scope="col" className="border-bottom">Tx. Fee</th>
                            <th scope="col" className="border-bottom">Exp. Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.guarantees.map((tx) => {
                            return (<tr>
                              <th scope="row"><a target={"_new"} href={`${process.env.REACT_APP_ETHERSCAN_BASE_URL}/tx/${tx.transactionHash}`}>Buy</a></th>
                              <td className="text-success">{tx.title}</td>
                              <td>{tx.transferValueETH}</td>
                              <td>{tx.transferGasETH}</td>
                              <td>{dateFormat(new Date(tx.expireTime * 1000), "mm/dd/yyyy h:MM TT Z")}</td>
                            </tr>)
                          }
                          )}
                        </tbody>
                      </Table>
                    </div> */}
                  </TabPane>
                  <TabPane
                    className="show fade bg-white shadow rounded p-4"
                    tabId="4"
                  >
                    <div className="table-responsive bg-white shadow rounded">
                    <div className="table-responsive bg-white shadow rounded">
                      <Table className="mb-0 table-center table-nowrap">
                        <thead>
                          <tr>
                            <th scope="col" className="border-bottom">Order no.</th>
                            <th scope="col" className="border-bottom">Date</th>
                            <th scope="col" className="border-bottom">Status</th>
                            <th scope="col" className="border-bottom">Total</th>
                            <th scope="col" className="border-bottom">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row">7107</th>
                            <td>1st November 2020</td>
                            <td className="text-success">Delivered</td>
                            <td>
                              $ 320{" "}
                              <span className="text-muted">for 2items</span>
                            </td>
                            <td>
                              <Link to="#" className="text-primary">
                                View <i className="uil uil-arrow-right"></i>
                              </Link>
                            </td>
                          </tr>

                          <tr>
                            <th scope="row">8007</th>
                            <td>4th November 2020</td>
                            <td className="text-muted">Processing</td>
                            <td>
                              $ 800{" "}
                              <span className="text-muted">for 1item</span>
                            </td>
                            <td>
                              <Link to="#" className="text-primary">
                                View <i className="uil uil-arrow-right"></i>
                              </Link>
                            </td>
                          </tr>

                          <tr>
                            <th scope="row">8008</th>
                            <td>4th November 2020</td>
                            <td className="text-danger">Canceled</td>
                            <td>
                              $ 800{" "}
                              <span className="text-muted">for 1item</span>
                            </td>
                            <td>
                              <Link to="#" className="text-primary">
                                View <i className="uil uil-arrow-right"></i>
                              </Link>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                    </div>
                  </TabPane>

                  <TabPane
                    className="show fade bg-white shadow rounded p-4"
                    tabId="4"
                  >
                    <h6 className="text-muted mb-0">
                      The following addresses will be used on the checkout page
                      by default.
                    </h6>

                    <Row>
                      <Col lg={6} className="mt-4 pt-2">
                        <div className="d-flex align-items-center mb-4 justify-content-between">
                          <h5 className="mb-0">Billing Address:</h5>
                          <Link to="#" className="text-primary h5 mb-0">
                            <i className="uil uil-edit align-middle"></i>
                          </Link>
                        </div>
                        <div className="pt-4 border-top">
                          <p className="h6">Cally Joseph</p>
                          <p className="h6 text-muted">
                            C/54 Northwest Freeway,{" "}
                          </p>
                          <p className="h6 text-muted">Suite 558,</p>
                          <p className="h6 text-muted">Houston, USA 485</p>
                          <p className="h6 text-muted mb-0">+123 897 5468</p>
                        </div>
                      </Col>

                      <Col lg={6} className="mt-4 pt-2">
                        <div className="d-flex align-items-center mb-4 justify-content-between">
                          <h5 className="mb-0">Shipping Address:</h5>
                          <Link to="#" className="text-primary h5 mb-0">
                            <i className="uil uil-edit align-middle"></i>
                          </Link>
                        </div>
                        <div className="pt-4 border-top">
                          <p className="h6">Cally Joseph</p>
                          <p className="h6 text-muted">
                            C/54 Northwest Freeway,{" "}
                          </p>
                          <p className="h6 text-muted">Suite 558,</p>
                          <p className="h6 text-muted">Houston, USA 485</p>
                          <p className="h6 text-muted mb-0">+123 897 5468</p>
                        </div>
                      </Col>
                    </Row>
                  </TabPane>

                  <TabPane
                    className="show fade bg-white shadow rounded p-4"
                    tabId="5"
                  >
                    <Form>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">Your Email</Label>
                            <div className="form-icon position-relative">
                              <FeatherIcon
                                icon="mail"
                                className="fea icon-sm icons"
                              />
                              <input
                                name="email"
                                id="email"
                                type="email"
                                className="form-control ps-5"
                                defaultValue="callyjoseph@gmail.com"
                              />
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">Display Name</Label>
                            <div className="form-icon position-relative">
                              <FeatherIcon
                                icon="user-check"
                                className="fea icon-sm icons"
                              />
                              <input
                                name="name"
                                id="display-name"
                                type="text"
                                className="form-control ps-5"
                                defaultValue="cally_joseph"
                              />
                            </div>
                          </div>
                        </Col>

                        <div className="col-lg-12 mt-2 mb-0">
                          <button className="btn btn-primary">
                            Save Changes
                          </button>
                        </div>
                      </Row>
                    </Form>
                  </TabPane>
                </TabContent>
              </Col>
            </Row>
          </Container>
        </section>
      </React.Fragment>
    );
  }
}

export default MyAccount;
