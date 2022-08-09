import React, { Component, CSSProperties } from 'react';
import {
  Container,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from 'reactstrap';
import {Helmet} from "react-helmet";
import { getChain } from '../../common/config';
import Icon from '@material-ui/icons/Apps';
import { Link } from 'react-router-dom';
import DataTableLoader from '../../components/DataTable';
import bgImg from "../../assets/images/nfts/ac1_unfit_digital_collage_of_locally_owned_nfts_by_annie_bur.jpg";
import BasicPopperToolTip from "../../components/BasicPopperToolTip";
import RingLoader from "react-spinners/RingLoader";
import DataTable from 'react-data-table-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsersRectangle } from '@fortawesome/free-solid-svg-icons';
var sessionstorage = require('sessionstorage');
var _ = require('lodash');
var endpoint = require('../../common/endpoint');
const Swal = require('sweetalert2');
const exportUtils = require('../../common/exportUtils');
const CollectionsCache = require('../../model/Collections');
// Create our number formatter.
var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});
var numFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 6 })
var _collections = [];

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  
class MostViewedProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethereumAddress: '',
      wallet: {},
      walletConnected: false,
      loading: true,
      nfts: [],
      collections: [],
      pageNumber: 1,
      pageSize: 6,
      totalPages: 0,
      batch: [],
      currentItems: 0,
      currentCollection: {},
      pageCount: 0,
      itemOffset: 0,
      itemsPerPage: 15,
      EstHoldingValue: 0,
      Liquidity7D: 0, 
      ethPrice: 0,
      realizedPNL: 0,
      PNL: 0
    };
    this.getNFTs.bind(this);
    this.accountsChanged.bind(this);
    this.AddToBatch.bind(this);
    this.fireMsg.bind(this);
    this.openModal.bind(this);
    this.getEthPrice.bind(this);
    this.getWallet.bind(this);
    this.refresh.bind(this);
    this.downloadCSV.bind(this);
    this.handleRowSelect.bind(this);
  };



  handleRowSelect = ({ selectedRows }) => {
    // You can set state or dispatch with something like Redux so we can use the retrieved data
    console.log('Selected Rows: ', selectedRows);
  };

  downloadCSV = (array) => {
    	const link = document.createElement('a');
    	let csv = exportUtils.convertArrayOfObjectsToCSV(array);
    	if (csv == null) return;
    
    	const filename = 'export.csv';
    
    	if (!csv.match(/^data:text\/csv/i)) {
    		csv = `data:text/csv;charset=utf-8,${csv}`;
    	}
    
    	link.setAttribute('href', encodeURI(csv));
    	link.setAttribute('download', filename);
    	link.click();
    }

    
  fireMsg(title, text, icon) {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'Ok',
      confirmButtonAriaLabel: 'Ok',
      focusConfirm: true,
    });
  }

  accountsChanged = () => {
    if (
      window.ethereum._state.isConnected &&
      typeof window.ethereum._state.accounts[0] !== 'undefined'
    ) {

      if(this.state.ethereumAddress === ""){
        console.log("Account Changed Execution")
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });
  
        this.getWallet('ethereum', window.ethereum._state.accounts[0]);
  
        //Get the NFTs
        this.getNFTs(window.ethereum._state.accounts[0], 1);

        
      }


    } else if (typeof window.ethereum._state.accounts[0] === 'undefined') {
      this.setState({ nfts: [], walletConnected: false, ethereumAddress: '' });
    }
  };

  componentDidMount() {
    document.body.classList = '';
    window.addEventListener('scroll', this.scrollNavigation, true);

    document.title = "Burnance NFT Collection Liquidity";

    if (window.ethereum) {

      window.ethereum.on('accountsChanged', this.accountsChanged);

      if (
        window.ethereum._state.isConnected &&
        typeof window.ethereum._state.accounts[0] !== 'undefined'
      ) {
        if(this.state.ethereumAddress === ""){

          this.setState({
            ethereumAddress: window.ethereum._state.accounts[0],
            walletConnected: true,
          });
    
          this.getWallet('ethereum', window.ethereum._state.accounts[0]);
    
          //Get the NFTs
          this.getNFTs(window.ethereum._state.accounts[0], 1);
  
          
        }

        //Get the price
        this.getEthPrice(window.ethereum._state.accounts[0]);

        //console.log('account', window.ethereum._state.accounts[0])
        //this.getNFTs(window.ethereum._state.accounts[0], 1);
      }
    }
  }


  getWallet = async (chain, address) => {
    try {
      const walletResp = await endpoint._get(getChain()['eth'].getWalletApiUrl + `/${chain}/${address}`);
      this.setState({ wallet: walletResp.data.wallet });
    } catch (e) {
      console.error(e);
    }
  };

  //Add try/catch to this function
  getNFTs = async (ethereumAddress, ethusd) => {
    //console.log('Loading Page:',pageNumber);
    try {

      this.setState({ loading: true});

      let _CollectionsCache = new CollectionsCache(ethereumAddress);
      
      let Collections = _CollectionsCache.get(ethereumAddress);

      let EstHoldingValue = 0, SevenDaySales = 0, NumOwners = 0, totalSupply = 0;

      if ((typeof Collections === 'undefined') | (Collections === null)) {
        Collections = await endpoint._get(
          getChain()['eth'].getWalletCollectionsApiUrl +
            `/ethereum/${ethereumAddress}`,
        );

        console.log('Collections',Collections);
        

        //Loop the collections and add a id column
        let id = 1, collections = [];
        for(const collection of Collections.data.collections){

         if(typeof collection.primary_asset_contracts[0] !== "undefined"){

          collection.id = id;
          collection.address = collection.primary_asset_contracts[0].address;
          collection.FloorPrice = collection.stats.floor_price;
          collections.push(collection);
          SevenDaySales = SevenDaySales + collection.stats.seven_day_sales;
          NumOwners = NumOwners + collection.stats.num_owners;
          totalSupply = totalSupply + collection.stats.total_supply;

          EstHoldingValue = EstHoldingValue + (Number(collection.stats.floor_price) * Number(collection.owned_asset_count));


         }else{
          Collections.data.collections.splice(id - 1, 1);
         }
        
          id++;
        }
        Collections = collections;
        _CollectionsCache.set(ethereumAddress, Collections);
      }


     
      
      
      
      //console.log(collections)
      //Liquidity = Sales / The number of NFTs * 100%
      const Liquidity7D = (SevenDaySales / (totalSupply - NumOwners)) * 100;
      this.setState({
        collections: Collections,
        loading: false,
        EstHoldingValue: EstHoldingValue.toFixed(4),
        Liquidity7D: Liquidity7D.toFixed(2),
      });
    } catch (e) {
      console.error(e);
      this.setState({ loading: false });
    }
  };

  getEthPrice = async () => {

    let ethPrice = JSON.parse(sessionstorage.getItem("ethPrice"));

    if ((typeof ethPrice === 'undefined') | (ethPrice === null)) {
      ethPrice = await endpoint._get(getChain()['eth'].getEthPriceApiUrl);
      ethPrice = ethPrice.data.result;
      sessionstorage.setItem("ethPrice", JSON.stringify(ethPrice));
    };

    this.getNFTs(window.ethereum._state.accounts[0], ethPrice.ethusd);

    this.setState({ethPrice});
  };

  refresh = async () =>{
    sessionstorage.removeItem(this.state.ethereumAddress);
    this.getEthPrice();
  }

  AddToBatch = (contractAddress, tokenId, name) => {
    var nft = _.find(this.state.batch, { contractAddress, tokenId });

    if (typeof nft === 'undefined') {
      this.state.batch.push({ contractAddress, tokenId });
      this.fireMsg('Added to Batch', `${name} Added to Batch`, 'INFO');
    } else {
      this.fireMsg('NFT Exists', `${name} exists in Batch`, 'WARN');
    }
  };

  openModal = (name) => {

    if(typeof name !== 'undefined'){
      const collection = _.find(_collections, ['name', name]);
      //this.setState({ currentCollection:  });
      window.location.href = `/collection/${collection.contractAddress}`;
    };

    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
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
        <Helmet>
          <title>NFT Collection | Burnance NFT Liquidity</title>
          <meta property="og:title" content="Burnance NFT Liquidity Provider" />
          <meta name="keywords" content="NFT, NFT Liquidity, Liquidity,Ethereum, ETH, ERC-721, ERC-20, ERC-1155, burner, burn, burn rewards" />
          <meta name="description" content="Burn your Sh!t NFTs and get paid in (ETH) Ethereum" />
          <meta property="og:description" content="Burn your Sh!t NFTs and get paid in (ETH) Ethereum" />
          <meta name="twitter:title" content="Burnance | NFT Collection Liquidity Provider" />
        </Helmet>
        <Modal
          isOpen={this.state.isOpen}
          role="dialog"
          autoFocus={true}
          centered={true}
          style={{ maxWidth: '500px', width: '500px' }}
        >
          <ModalHeader toggle={this.openModal}>
            {typeof this.state.currentCollection !== 'undefined'
              ? this.state.currentCollection.name
              : ''}
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col md="12">
                <ul>
                  <li>NFT Held: </li>
                </ul>
              </Col>
            </Row>
            <Row>
              <Col md="1">
                <a href="/">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 32 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                  >
                    <g clip-path="url(#opensea_svg__clip0)" fill="currentColor">
                      <path d="M2.62 15.84l.108-.17L9.23 5.498a.222.222 0 01.39.028c1.087 2.435 2.024 5.463 1.585 7.348-.187.776-.7 1.827-1.279 2.798a5.1 5.1 0 01-.244.413.22.22 0 01-.185.098H2.81a.222.222 0 01-.19-.342z"></path>
                      <path d="M31.608 17.73v1.61a.231.231 0 01-.139.212c-.503.215-2.227 1.006-2.943 2.003-1.83 2.545-3.226 6.185-6.35 6.185H9.146c-4.618 0-8.36-3.755-8.36-8.389v-.149c0-.123.1-.223.223-.223h7.264c.144 0 .249.133.236.275a2.48 2.48 0 00.26 1.394 2.556 2.556 0 002.29 1.423h3.597v-2.807H11.1a.229.229 0 01-.185-.36c.038-.059.082-.12.128-.19.337-.477.817-1.22 1.295-2.065.326-.57.642-1.179.896-1.79.052-.11.093-.224.134-.334.07-.195.141-.378.192-.56.052-.154.093-.316.134-.467.12-.52.172-1.069.172-1.64 0-.223-.01-.456-.03-.68a8.803 8.803 0 00-.073-.732 7.57 7.57 0 00-.1-.652c-.051-.326-.123-.65-.205-.976l-.029-.124c-.061-.223-.113-.436-.184-.66a24.885 24.885 0 00-.684-2.024c-.09-.254-.192-.498-.295-.742-.152-.367-.306-.701-.447-1.017a14.072 14.072 0 01-.195-.409 14.61 14.61 0 00-.213-.446c-.052-.11-.11-.214-.152-.316l-.44-.812a.143.143 0 01.163-.208l2.748.745h.008l.01.002.362.1.398.114.147.04V1.429A1.42 1.42 0 0116.068 0c.39 0 .745.16 1 .419.254.26.413.614.413 1.01v2.424l.293.082a.235.235 0 01.067.033c.072.054.174.134.305.232.103.082.213.182.347.285.265.213.58.488.927.804.093.08.183.161.265.244.447.416.948.904 1.425 1.443.134.152.265.306.398.468.134.164.275.326.399.488.161.215.336.439.488.673.072.11.154.223.223.333.195.296.367.601.532.907.07.141.141.295.203.447.182.408.326.825.418 1.24.028.09.05.188.06.275v.021c.03.123.04.254.05.388a4.147 4.147 0 01-.223 1.818c-.061.175-.123.357-.203.53a7.169 7.169 0 01-.552 1.047c-.07.124-.151.255-.234.378-.09.131-.182.254-.264.375a7.852 7.852 0 01-.357.46c-.11.151-.224.303-.347.436-.172.203-.336.396-.509.58-.102.122-.213.245-.326.355-.11.124-.223.234-.326.337a12.94 12.94 0 01-.437.416l-.282.26a.23.23 0 01-.152.056h-2.188v2.807h2.753c.617 0 1.202-.218 1.675-.619.162-.141.868-.752 1.703-1.674a.213.213 0 01.105-.065l7.606-2.198a.224.224 0 01.285.215z"></path>
                    </g>
                    <defs>
                      <clipPath id="opensea_svg__clip0">
                        <path
                          fill="currentColor"
                          transform="translate(.786)"
                          d="M0 0h31v28H0z"
                        ></path>
                      </clipPath>
                    </defs>
                  </svg>
                </a>
              </Col>
              <Col md="1">
                <a href="/">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                  >
                    <g
                      clip-path="url(#etherscan_svg__clip0_1129_1376)"
                      fill="currentColor"
                    >
                      <path d="M6.651 15.236a1.357 1.357 0 011.362-1.357l2.26.007a1.358 1.358 0 011.357 1.359v8.544c.255-.075.581-.156.939-.24a1.13 1.13 0 00.872-1.101V11.849a1.358 1.358 0 011.358-1.359h2.263a1.358 1.358 0 011.358 1.359v9.837s.567-.23 1.119-.463a1.133 1.133 0 00.692-1.043V8.452a1.36 1.36 0 011.358-1.358h2.263a1.358 1.358 0 011.358 1.358v9.657c1.962-1.422 3.951-3.133 5.53-5.19a2.28 2.28 0 00.346-2.13A15.974 15.974 0 0016.202.001C7.33-.118 0 7.126 0 16.001a15.954 15.954 0 002.124 8.004 2.023 2.023 0 001.928 1c.429-.039.962-.092 1.595-.166a1.13 1.13 0 001.004-1.123v-8.48"></path>
                      <path
                        d="M6.602 28.939a15.988 15.988 0 0023.042-4.577A16 16 0 0032 16c0-.368-.017-.732-.041-1.095-5.843 8.718-16.632 12.793-25.357 14.034"
                        fill-opacity="0.4"
                      ></path>
                    </g>
                    <defs>
                      <clipPath id="etherscan_svg__clip0_1129_1376">
                        <path fill="currentColor" d="M0 0h32v32H0z"></path>
                      </clipPath>
                    </defs>
                  </svg>
                </a>
              </Col>
              <Col md="1">
                <a href="/">
                  <svg
                    width="25"
                    height="25"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    class="w-6 h-6"
                  >
                    <path d="M66.55 18.35h-32.7L10.38 41.69l39.69 40 39.55-39.87zM50.07 58C35.68 58 23.3 42 23.3 42s11.15-16.79 26.77-16.79 26.67 16.73 26.67 16.73S64.45 58 50.07 58z"></path>
                    <path d="M50 54.39a12.77 12.77 0 1112.79-12.77A12.79 12.79 0 0150 54.39zm0-18.11a5.34 5.34 0 105.34 5.34A5.35 5.35 0 0050 36.28z"></path>
                  </svg>
                </a>
              </Col>
              <Col md="9"></Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Link
              className="btn mouse-down"
              to={`/collection/${
                typeof this.state.currentCollection !== 'undefined'
                  ? this.state.currentCollection.contractAddress
                  : ''
              }`}
            >
              View NFTs
            </Link>
            <Button color="secondary" onClick={this.openModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
        <section
          className="bg-half d-table w-100"
          style={{ background: `url(${bgImg}) center center` }}
        >
          <div className="bg-overlay"></div>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-12 text-center">
                <div className="page-next-level">
                  <h1 className="title text-white title-dark">
                    Wallet NFT Collections
                  </h1>
                  <div className="page-next">
                    <nav aria-label="breadcrumb" className="d-inline-block">
                      <ul className="breadcrumb bg-white rounded shadow mb-0">
                        <li className="breadcrumb-item">
                          <Link to="/">Burnance</Link>
                        </li>
                        <li className="breadcrumb-item">
                          <Link to="/collections">Collections</Link>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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
            {this.state.walletConnected === false ? (
              ''
            ) : (
              <Row>
                <Col xs={12} style={{ marginTop: '25px' }}>
                  <Button
                    name="refresh"
                    className="btn btn-info rounded"
                    style={{ marginBottom: '15px' }}
                    onClick={(e) => {
                      e.preventDefault();
                      this.refresh();
                    }}
                  >
                    {this.state.loading === true
                      ? 'Loading Collections...'
                      : 'Refresh Collections'}{" "}
                      <FontAwesomeIcon icon={faUsersRectangle} color="#E76E3C" spinPulse={this.state.loading} />
                  </Button>
                </Col>
              </Row>
            )}

            <Row>
              {this.state.walletConnected === false ? (
                <Col md="12">
                  <div className="row justify-content-center">
                    <div className="col-lg-12 text-center">
                      <h3 className="mb-0" style={{ marginTop: '45px' }}>
                        Connect your Wallet
                      </h3>
                    </div>
                  </div>
                </Col>
              ) : (
                <Col md="12">
                  <DataTable
                    title={
                      (this.state.collections.length === 0
                        ? '-'
                        : this.state.collections.length) +
                      ' Collection(s) in your Portfolio'
                    }
                    customStyles={customStyles}
                    highlightOnHover
                    pointerOnHover
                    progressPending={this.state.loading}
                    progressComponent={<DataTableLoader width={'100%'} />}
                    onSelectedRowsChange={this.handleRowSelect}
                    columns={[
                      {
                        cell: (row) => (
                          <Link to={`/collection/${row.address}`}>
                            {(row.image_url !== null ? <img src={row.image_url} width="50px" height={'50px'} alt={'t'} /> : <Icon style={{ fill: '#43a047' }} />)}
                          </Link>
                        ),
                        width: '56px', // custom width for icon button
                        style: {
                          borderBottom: '1px solid #FFFFFF',
                          marginBottom: '5px',
                          border: '2px'
                        },
                      },
                      {
                        name: 'Collection',
                        selector: (row) => (
                          <Link to={`/collection/${row.address}`}>
                            {row.name}
                          </Link>
                        ),
                        sortable: true,
                        grow: 2,
                        style: {
                          color: '#202124',
                          fontSize: '16px',
                          fontWeight: 600,
                        },
                      },
                      // {
                      //   name: 'Type',
                      //   selector: (row) => row.primary_asset_contracts[0].schema_name,
                      //   sortable: true,
                      // },
                      {
                        name: 'Held',
                        selector: (row) => row.owned_asset_count,
                        sortable: true,
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: '7D Vol',
                        selector: (row) => row.stats.seven_day_volume,
                        sortable: true,
                        format: (row) => numFormatter.format(row.stats.seven_day_volume),
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: '30D Vol',
                        selector: (row) => row.stats.thirty_day_volume,
                        sortable: true,
                        format: (row) => numFormatter.format(row.stats.thirty_day_volume),
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: '30 Sales',
                        selector: (row) => row.stats.thirty_day_sales,
                        sortable: true,
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      },
                      {
                        name: 'Floor Price',
                        selector: (row) => (row.stats.floor_price === null ? 0 : row.stats.floor_price),
                        sortable: true,
                        format: (row) => (row.stats.floor_price === null ? 0 : row.stats.floor_price) + ' ETH',
                        grow: 2,
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      },
                      // {
                      //   name: 'Cost Basis',
                      //   selector: (row) => row.AmountInvested,
                      //   sortable: true,
                      //   format: (row) => formatter.format(row.AmountInvested),
                      //   grow: 2,
                      //   style: {
                      //     fontSize: '14px',
                      //     fontWeight: 600,
                      //   },
                      // },
                      // {
                      //   name: 'PnL',
                      //   selector: (row) => row.pnl,
                      //   sortable: true,
                      //   format: (row) => formatter.format(row.pnl),
                      //   style: {
                      //     fontSize: '14px',
                      //     fontWeight: 600,
                      //   },
                      //   when: (row) => row.pnl < 0,
                      // },
                      {
                        name: 'Liquidity (1D)',
                        selector: (row) => row.Liquidity7D,
                        sortable: true,
                        format: (row) => `${(row.Liquidity7D === null ? 0 : row.Liquidity7D.toFixed(2))}%`,
                        style: {
                          fontSize: '14px',
                          fontWeight: 600,
                        },
                      },
                    ]}
                    data={this.state.collections}
                    pagination
                  />
                </Col>
              )}
            </Row>
            {/* <Row>
              {this.state.nfts.map((nft, key) => (
                <Col key={key} lg={3} md={6} xs={12} className="mt-4 pt-2">
                  <Asset AddToBatch={this.AddToBatch} ethereumAddress={this.state.ethereumAddress} nft={nft} />
                </Col>
              ))}
            </Row> */}
          </Container>
        </section>
      </React.Fragment>
    );
  }
}

export default MostViewedProducts;
