// React Basic and Bootstrap
import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Table, FormGroup, Input, Label, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Link } from "react-router-dom";
import LoadingOverlay from 'react-loading-overlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Web3 from 'web3';
import { getChain } from '../../common/config';
import { initGA, PageView, Event } from '../../common/gaUtils';
import DataTable from 'react-data-table-component';
import DataTableLoader from '../../components/DataTable';
import Icon from '@material-ui/icons/Apps';
//Import components
import PageBreadcrumb from "../../components/Shared/PageBreadcrumb";

//Import Icons

// import images
import team1 from '../../assets/images/client/01.jpg';
import team2 from '../../assets/images/client/02.jpg';
import team3 from '../../assets/images/client/03.jpg';
import team4 from '../../assets/images/client/04.jpg';
import team5 from '../../assets/images/client/05.jpg';
import team6 from '../../assets/images/client/06.jpg';
import team7 from '../../assets/images/client/07.jpg';
import team8 from '../../assets/images/client/08.jpg';
const Swal = require('sweetalert2');
var endpoint = require('../../common/endpoint');
var formatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'USD'});
var numFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 });
class ERC20Coins extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pathItems : [
                //id must required
                { id : 1, name : "Burnance", link : "/" },
                { id : 2, name : "Coins", link : "/coins" }

            ],
            coinApproved: false,
            contentLoading: false,
            loading: false,
            isOpen: false,
            ethereumAddress: '',
            account: '',
            batch: '',
            wallet: {},
            walletConnected: false,
            burnanceAddr: '',
            burnance: '',
            guaranteeFee: 0,
            guaranteeMonths: 1,
        }
        this.openModal.bind(this);
        this.accountsChanged.bind(this);
    };
    
    componentDidMount() {
        try {
    
          //Template stuff
          document.body.classList = '';
          document.getElementById('top-menu').classList.add('nav-light');
          window.addEventListener('scroll', this.scrollNavigation, true);
    
          //Start GA
          initGA();
          PageView();
    
          //Kick off Web3
          //this.init();
    
        } catch (e) {
          console.warn(e.message);
        }
    
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
     
    
            this.getWallet('ethereum', window.ethereum._state.accounts[0]);
          }
        }
      }

     // Make sure to remove the DOM listener when the component is unmounted.
     componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollNavigation, true);
     };


    scrollNavigation = () => {
        var doc = document.documentElement;
        var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
        if (top > 80) {
            document.getElementById('topnav').classList.add('nav-sticky');
        }
        else {
            document.getElementById('topnav').classList.remove('nav-sticky');
        }
    };

    getWallet = async (chain, address) => {
        const walletResp = await endpoint._get(
          getChain()['eth'].getWalletApiUrl + `/${chain}/${address}`,
        );
    
        this.setState({ wallet: walletResp.data });
      };

    openModal = async () => {
      
        this.setState((prevState) => ({
          isOpen: !prevState.isOpen,
        }));
      };

      accountsChanged = () => {
        if (
          window.ethereum._state.isConnected &&
          typeof window.ethereum._state.accounts[0] !== 'undefined'
        ) {
          if (this.state.ethereumAddress === '') {
           
            this.setState({
              ethereumAddress: window.ethereum._state.accounts[0],
              walletConnected: true
            });
    
            this.getWallet('ethereum', window.ethereum._state.accounts[0]);
          }
        } else if (typeof window.ethereum._state.accounts[0] === 'undefined') {
          this.setState({ walletConnected: false, ethereumAddress: '' });
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
                    title="Team Members"
                    pathItems = {this.state.pathItems}
                />
                <div className="position-relative">
                    <div className="shape overflow-hidden text-white">
                        <svg viewBox="0 0 2880 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z" fill="currentColor"></path>
                        </svg>
                    </div>
                </div>
                <LoadingOverlay
          active={this.state.contentLoading}
          spinner
          text="Processing transaction......"
        >
                <section className="section">
                    <Container>
                        <Row>
                        <Col md="12">
                  <DataTable
                    title={'Wallet Assets'}
                    customStyles={customStyles}
                    highlightOnHover
                    pointerOnHover
                    progressPending={this.state.loading}
                    progressComponent={<DataTableLoader width={'100%'} />}
                    columns={[
                      {
                        cell: (row) => (
                          <Link to={`#`}>
                            <Icon style={{ fill: '#43a047' }} />
                          </Link>
                        ),
                        width: '56px', // custom width for icon button
                        style: {
                          borderBottom: '1px solid #FFFFFF',
                          marginBottom: '-1px',
                        },
                      },
                      {
                        name: 'Token',
                        selector: (row) => (
                          <Link to={`#`}>
                            {row.name}
                          </Link>
                        ),
                        sortable: true,
                        width: '20%',
                        grow: 2,
                        style: {
                          color: '#202124',
                          fontSize: '16px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: 'Held',
                        selector: (row) => row.count,
                        sortable: true,
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      }
                    ]}
                    data={this.state.coins}
                    pagination
                  />
                </Col>
                            <Col xs={12} className="text-center">
                                <div className="section-title mb-4 pb-2">
                                    <p className="text-center">Don't see your token? </p>
                                    <p className="text-center"><Link to="#" onClick={ e =>{
                                        e.preventDefault();
                                        this.openModal();
                                    }}>Import tokens</Link></p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>
                </LoadingOverlay>
                <Modal
          isOpen={this.state.isOpen}
          role="dialog"
          autoFocus={true}
          centered={true}
          style={{ maxWidth: '500px', width: '500px' }}
        >
          <ModalHeader toggle={this.openModal}>
          Import Tokens
          </ModalHeader>
          <ModalBody>
          <div className="rounded shadow-lg p-4 sticky-bar">
                  <div className="d-flex mb-4 justify-content-between">
                    <h5>Custom Token</h5>
                  </div>
                  <div className="table-responsive">
                    <Table className="table-end table-padding mb-0">
                      <tbody>
                        <tr>
                          <td className="h6 border-0">
                          <FormGroup className="position-relative">
                                <Label className="form-label" for="tokenContractAddress">
                                  Token Contract Address{" "}
                                  <span className="text-danger">*</span>
                                </Label>
                                <Input
                                  name="tokenContractAddress"
                                  id="tokenContractAddress"
                                  type="text"
                                  width="100%"
                                  className="form-control"
                                  placeholder="0x00000....."
                                  disabled={this.state.loading}
                                />
                              </FormGroup>
                          </td>
                        </tr>
                        <tr>
                          <td className="h6 border-0">
                          <FormGroup className="position-relative">
                                <Label className="form-label" for="tokenSymbol">
                                    Token Symbol{" "}
                                </Label>
                                <Input
                                  name="tokenSymbol"
                                  id="tokenSymbol"
                                  type="text"
                                  width="100%"
                                  className="form-control"
                                  disabled={this.state.loading}
                                />
                              </FormGroup>
                          </td>
                        </tr>
                        <tr>
                          <td className="h6 border-0">
                          <FormGroup className="position-relative">
                                <Label className="form-label" for="tokenDecimal">
                                  Token Decimal{" "}
                                </Label>
                                <Input
                                  name="tokenDecimal"
                                  id="tokenDecimal"
                                  type="number"
                                  width="100%"
                                  className="form-control"
                                  placeholder="0"
                                  disabled={this.state.loading}
                                />
                              </FormGroup>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                    <div className="mt-4 pt-2">
                      <div className="d-grid">
                        <Link
                          to="#"
                          className="btn btn-primary"
                        >
                          Add Custom Token
                      </Link>
                      </div>
                    </div>
                  </div>
                </div>
          </ModalBody>
        </Modal>
            </React.Fragment>
        );
    }
}
export default ERC20Coins;
