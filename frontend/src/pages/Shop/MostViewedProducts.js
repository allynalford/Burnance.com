import React, { Component } from 'react';
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
import { getChain } from '../../common/config';
import { Chart } from 'react-google-charts';
import './tableCss.css';
import { Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
var sessionstorage = require('sessionstorage');
var _ = require('lodash');
var endpoint = require('../../common/endpoint');
const Swal = require('sweetalert2');

var _collections = [],
  _openModal;

class MostViewedProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethereumAddress: '',
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
    };
    this.getNFTs.bind(this);
    this.accountsChanged.bind(this);
    this.AddToBatch.bind(this);
    this.fireMsg.bind(this);
    this.openModal.bind(this);

    _openModal = this.openModal;
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
      this.setState({
        ethereumAddress: window.ethereum._state.accounts[0],
        walletConnected: true,
      });

      //Get the NFTs
      this.getNFTs(window.ethereum._state.accounts[0], 1);
    } else if (typeof window.ethereum._state.accounts[0] === 'undefined') {
      this.setState({ nfts: [], walletConnected: false, ethereumAddress: '' });
    }
  };

  componentDidMount() {
    document.body.classList = '';
    window.addEventListener('scroll', this.scrollNavigation, true);

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
        //console.log('account', window.ethereum._state.accounts[0])
        this.getNFTs(window.ethereum._state.accounts[0], 1);
      }
    }
  }

  //Add try/catch to this function
  getNFTs = async (ethereumAddress, pageNumber) => {
    //console.log('Loading Page:',pageNumber);
    try {
      let Collections = JSON.parse(sessionstorage.getItem(ethereumAddress));
      if ((typeof Collections === 'undefined') | (Collections === null)) {
        Collections = await endpoint._get(
          getChain()['eth'].getWalletCollectionsApiUrl +
            `/ethereum/${ethereumAddress}`,
        );
        Collections = Collections.data;
        sessionstorage.setItem(ethereumAddress, JSON.stringify(Collections));
      }

      let collections = [
        [
          'Collection',
          'Held',
          'Floor',
          'Avg Price',
          'Market Cap',
          '30 Day Sales',
          '30 Day Change',
          'View',
        ],
      ];

      for (const collection of Collections.collections) {
        collections.push([
          collection.name,
          collection.count,
          'Premium',
          'Premium',
          'Premium',
          'Premium',
          'Premium',
          '<input id="button" type="submit" name="button" value="NFTs"/>',
        ]);
        _collections.push({
          name: collection.name,
          contractAddress: collection.contractAddress,
        });
      }

      this.setState({ collections, loading: false });
    } catch (e) {
      console.error(e);
      this.setState({ loading: false });
    }
  };

  ChangePage = (event) => {
    const newOffset =
      (event.selected * this.state.itemsPerPage) % this.state.nfts.length;

    const endOffset = newOffset + this.state.itemsPerPage;

    console.log(`Loading items from ${this.state.itemOffset} to ${endOffset}`);

    this.setState({
      currentItems: this.state.nfts.slice(newOffset, endOffset),
      pageCount: Math.ceil(this.state.nfts.length / this.state.itemsPerPage),
    });
  };

  AddToBatch = (contractAddress, tokenId, name) => {
    var nft = _.find(this.state.batch, { contractAddress, tokenId });

    if (typeof nft === 'undefined') {
      this.state.batch.push({ contractAddress, tokenId });
      this.fireMsg('Added to Batch', `${name} Added to Batch`, 'INFO');
    } else {
      this.fireMsg('NFT Exists', `${name} exists in Batch`, 'WARN');
    }
  };

  openModal = (currentCollection) => {
    this.setState({ currentCollection });

    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  render() {
    const chartEvents = [
      {
        eventName: 'select',
        callback({ chartWrapper }) {
          //console.log("Selected ", chartWrapper.getChart().getSelection());
          const item = chartWrapper.getChart().getSelection()[0];

          //console.log(_nfts);
          _openModal(_collections[item.row]);
        },
      },
      {
        eventName: 'ready',
        callback({ chartWrapper }) {
          // console.log("ready ", chartWrapper.getChart());
        },
      },
      {
        eventName: 'error',
        callback({ chartWrapper }) {
          console.log('error ', chartWrapper.getChart());
        },
      },
    ];

    var cssClassNames = {
      headerRow: 'cssHeaderRow',
      tableRow: 'cssTableRow',
      oddTableRow: 'cssOddTableRow',
      selectedTableRow: 'cssSelectedTableRow',
      hoverTableRow: 'cssHoverTableRow',
      headerCell: 'cssHeaderCell',
      tableCell: 'cssTableCell',
      rowNumberCell: 'cssRowNumberCell',
    };

    return (
      <React.Fragment>
        <Modal
          isOpen={this.state.isOpen}
          role="dialog"
          autoFocus={true}
          centered={true}
          style={{ maxWidth: '800px', width: '800px' }}
        >
          <ModalHeader toggle={this.openModal}>
            {this.state.currentCollection.name}
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
                <a href="">
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
                <a href="">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
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
                <a href="">
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
              color="primary"
              to={`/collection/${this.state.currentCollection.contractAddress}`}
            >
              View NFTs
            </Link>
            <Button color="secondary" onClick={this.openModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
        <Container>
          <Row>
            <Col xs={12}>
              <h2 className="mb-0">
                Your Collections {this.state.collections.length}
              </h2>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              {this.state.loading === true ? (
                <DataTable width={'100%'} />
              ) : (
                <div className="table-responsive bg-white shadow rounded">
                  <Chart
                    chartType="Table"
                    width="100%"
                    data={this.state.collections}
                    options={{
                      allowHtml: true,
                      showRowNumber: false,
                      width: '100%',
                      height: '100%',
                      pageSize: 25,
                      cssClassNames: cssClassNames,
                    }}
                    formatters={[
                      {
                        type: 'ArrowFormat',
                        column: 7,
                      },
                      {
                        type: 'NumberFormat',
                        column: 6,
                        options: {
                          prefix: '$',
                          negativeColor: 'red',
                          negativeParens: true,
                        },
                      },
                      {
                        type: 'NumberFormat',
                        column: 2,
                        options: {
                          prefix: '$',
                          negativeColor: 'red',
                          negativeParens: true,
                        },
                      },
                      {
                        type: 'NumberFormat',
                        column: 3,
                        options: {
                          prefix: '$',
                          negativeColor: 'red',
                          negativeParens: true,
                        },
                      },
                      {
                        type: 'NumberFormat',
                        column: 4,
                        options: {
                          prefix: '$',
                          negativeColor: 'red',
                          negativeParens: true,
                        },
                      },
                      {
                        type: 'NumberFormat',
                        column: 5,
                        options: {
                          fractionDigits: 6,
                        },
                      },
                    ]}
                    chartEvents={chartEvents}
                  />
                </div>
              )}
            </Col>
          </Row>
          {/* <Row>
              {this.state.nfts.map((nft, key) => (
                <Col key={key} lg={3} md={6} xs={12} className="mt-4 pt-2">
                  <Asset AddToBatch={this.AddToBatch} ethereumAddress={this.state.ethereumAddress} nft={nft} />
                </Col>
              ))}
            </Row> */}
        </Container>
      </React.Fragment>
    );
  }
}

export default MostViewedProducts;
