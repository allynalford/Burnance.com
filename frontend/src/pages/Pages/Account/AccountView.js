import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Table, Card, CardBody, Input } from "reactstrap";
import logodark from "../../../assets/images/burnance_logo.png";
//Import Icons
import dateFormat from "dateformat";
import { Chart } from "react-google-charts";

var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});


export const data = [
  ["Department", "Revenues Change"],
  ["Shoes", { v: 12, f: "12.0%" }],
  ["Sports", { v: -7.3, f: "-7.3%" }],
  ["Toys", { v: 0, f: "0%" }],
  ["Electronics", { v: -2.1, f: "-2.1%" }],
  ["Food", { v: 22, f: "22.0%" }],
];

export const options = {
  allowHtml: true,
  showRowNumber: true,
};

export const formatters = [
  {
    type: "ArrowFormat",
    column: 7,
  },
];

var _nfts = [];

class PageInvoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        { id: 1, name: "One Day Bae #7925", qty: 2, floor: 0.1, usd: 10.15, eth: 0.25548, gas: 0.25348, ethPrice:  1573.00},
        { id: 2, name: "Loopy Donuts #7257", qty: 1, floor: 0.1, usd: 10.15, eth: 0.25548, gas: 0.25348, ethPrice:  2412.23},
        { id: 3, name: "Jailed Baby Ape Club #5940", qty: 3, floor: 0.1, usd: 10.15, eth: 0.25548, gas: 0.25348, ethPrice:  2570.15},
      ],
      ethereumAddress: '',
      walletConnected: false,
      nfts : [
        ["Item", "Date", "Floor", "Gas", "USD", "ETH", "ETH Price", "Change", "Burn"],
        ["One Day Bae #7925", "2/28/08", 0.1, 10.15, 0.25548, 0.25348, 1573.00, { v: 12, f: "12.0%" }, `<Input type="checkbox" id={1} name="check1"></Input>`],
        ["Loopy Donuts #7257", "2/28/08", 0.1, 10.15, 0.25548, 0.25348, 2412.23,{ v: -7.3, f: "-7.3%" }, `<Input type="checkbox" id={1} name="check1" ></Input>`],
        ["Jailed Baby Ape Club #5940","2/28/08", 0.1, 10.15, 0.25548, 0.25348, 2570.15, { v: 0, f: "0%" }, `<Input type="checkbox" id={1} name="check1"></Input>`],
        ["The Donut Shop #3090", "2/28/08", 0.1, 10.15, 0.25548, 0.25348, 1573.00,{ v: -2.1, f: "-2.1%" }, `<Input type="checkbox" id={1} name="check1"></Input>`],
        ["Loopy Cups #7257", "2/28/08", 0.1, 10.15, 0.25548, 0.25348, 1573.00, { v: 22, f: "22.0%" }, `<input type="checkbox" id={1} name="check1" onClick={e=>{console.log(e.target.name)}}></input>`],
      ],
      data : [
        ["Collection", "Change"],
        ["One Day Bae", { v: 12, f: "12.0%" }],
        ["Loopy Donuts", { v: -7.3, f: "-7.3%" }],
        ["Jailed Baby Ape Club", { v: 0, f: "0%" }],
        ["The Donut Shop", { v: -2.1, f: "-2.1%" }],
        ["Loopy Cups", { v: 22, f: "22.0%" }],
      ],
      options : {
        allowHtml: true,
        showRowNumber: true,
      },
      formatters : [
        {
          type: "ArrowFormat",
          column: 1,
        },
      ]
    };
    this.sendMail.bind(this);
    this.callNumber.bind(this);
    this.accountsChanged.bind(this);
    //this.chartEvents.bind(this);


  }

  sendMail() {
    window.location.href = "mailto:contact@example.com";
  }

  callNumber() {
    window.location.href = "tel:+152534-468-854";
  }

  componentDidMount() {
    document.body.classList = "";
    window.addEventListener("scroll", this.scrollNavigation, true);


    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.accountsChanged);
      if (window.ethereum._state.isConnected && typeof window.ethereum._state.accounts[0] !== "undefined") {
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });
        _nfts = this.state.nfts;
      }
    } 

  }
  // Make sure to remove the DOM listener when the component is unmounted.
  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollNavigation, true);
  }

  accountsChanged = () => {
    if (window.ethereum._state.isConnected && typeof window.ethereum._state.accounts[0] !== "undefined") {
 
     this.setState({
       ethereumAddress: window.ethereum._state.accounts[0],
       walletConnected: true,
     });
 
   }else if (typeof window.ethereum._state.accounts[0] === "undefined") {
     this.setState({nfts: [], walletConnected: false, ethereumAddress: ""})
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



  render() {

    const chartEvents = [
      {
        eventName: "select",
        callback({ chartWrapper }) {
          console.log("Selected ", chartWrapper.getChart().getSelection());
          const item = chartWrapper.getChart().getSelection()[0];
          console.log(item)
          
         // console.log(this.state.nfts[item.row+1]);
         console.log(_nfts);
        }
      },
      {
        eventName: "ready",
        callback({ chartWrapper }) {
         // console.log("ready ", chartWrapper.getChart());
        }
      },
      {
        eventName: "error",
        callback({ chartWrapper }) {
          console.log("error ", chartWrapper.getChart());
        }
      }
    ];
    return (
      <React.Fragment>
        <section className="bg-invoice bg-light">
          <Container>
            <Row className="mt-5 pt-4 pt-sm-0 justify-content-center">
              <Col lg="10">
                <Card className="shadow rounded border-0">
                  <CardBody>
                    <div className="invoice-top pb-4 border-bottom">
                      <Row>
                        <Col md="4">
                          <div className="logo-invoice mb-2">
                            <Link to="/" className="logo-footer">
                              <img
                                src={logodark}
                                height="250"
                                alt="Burnance Logo"
                              />
                            </Link>
                          </div>
                        </Col>

                        <Col md="8" className="mt-4 mt-sm-0">
                          <h5>Address :</h5>
                          {this.state.ethereumAddress}
                          <Chart
                            chartType="Table"
                            width="100%"
                            data={this.state.data}
                            options={this.state.options}
                            formatters={this.state.formatters}
                            chartEvents={chartEvents}
                          />
                        </Col>
                      </Row>
                    </div>

                    <div className="invoice-middle py-4">
                      <h5>Portfolio Details :</h5>
                      <Row className="mb-0">
                        <Col md={{ size: 8, order: 1 }} xs={{ order: 2 }}>
                          <dl className="row">
                            <dt className="col-md-3 col-5 fw-normal">
                              Total Gas Spent :
                            </dt>
                            <dd className="col-md-9 col-7 text">
                              0.23584 ( $358.34 )
                            </dd>
                            <dt className="col-md-3 col-5 fw-normal">
                              Total ETH Spent :
                            </dt>
                            <dd className="col-md-9 col-7 text">
                              4.63824 ( $7,047.37 ) - Gas
                            </dd>
                            <dt className="col-md-3 col-5 fw-normal">
                              Total Spent :
                            </dt>
                            <dd className="col-md-9 col-7 text">
                              4.89028 ( $7,405.71 ) - Gas
                            </dd>
                          </dl>
                        </Col>

                        <Col
                          md={{ size: 4, order: 2 }}
                          xs={{ order: 1 }}
                          className="mt-2 mt-sm-0"
                        >
                          {dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT")}
                        </Col>
                      </Row>
                    </div>

                    <div className="invoice-table pb-4">
                      <div className="table-responsive bg-white shadow rounded">
                      <Chart
                            chartType="Table"
                            width="100%"
                            data={this.state.nfts}
                            options={{
                              allowHtml: true,
                              showRowNumber: false,
                              width: '100%', 
                              height: '100%',
                              pageSize: 3
                            }}
                            formatters={[
                              {
                                type: "ArrowFormat",
                                column: 7,
                              },
                              {
                                type: "NumberFormat" ,
                                column: 6,
                                options: {
                                  prefix: "$",
                                  negativeColor: "red",
                                  negativeParens: true,
                                },
                              },
                              {
                                type: "NumberFormat" ,
                                column: 2,
                                options: {
                                  prefix: "$",
                                  negativeColor: "red",
                                  negativeParens: true,
                                },
                              },
                              {
                                type: "NumberFormat" ,
                                column: 3,
                                options: {
                                  prefix: "$",
                                  negativeColor: "red",
                                  negativeParens: true,
                                },
                              },
                              {
                                type: "NumberFormat" ,
                                column: 4,
                                options: {
                                  prefix: "$",
                                  negativeColor: "red",
                                  negativeParens: true,
                                },
                              },
                              {
                                type: "NumberFormat" ,
                                column: 5,
                                options: {
                                  fractionDigits: 6
                                },
                              }
                            ]}
                            chartEvents={chartEvents}
                          />
                        {/* <Table className="mb-0 table-center invoice-tb">
                          <thead className="bg-light">
                            <tr>
                              <th
                                scope="col"
                                className="border-bottom text-start"
                              >
                                No.
                              </th>
                              <th
                                scope="col"
                                className="border-bottom text-start"
                              >
                                Item
                              </th>
                              <th scope="col" className="border-bottom">
                                Floor
                              </th>
                              <th scope="col" className="border-bottom">
                                ETH Price
                              </th>
                              <th scope="col" className="border-bottom">
                                USD
                              </th>
                              <th scope="col" className="border-bottom">
                                ETH
                              </th>
                              <th scope="col" className="border-bottom">
                                GAS
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.items.map((item, key) => (
                              <tr key={key}>
                                <th scope="row" className="text-start">
                                  {key + 1}
                                </th>
                                <td className="text-start">{item.name}</td>
                                <td>{item.floor}  <span style={{fontSize: '12px'}}>{formatter.format(5.20)}</span> </td>
                                <td>{formatter.format(item.ethPrice)}</td>
                                <td>{formatter.format(item.usd)}</td>
                                <td>{item.eth}</td>
                                <td>{item.gas}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table> */}
                      </div>

                      <Row>
                        <Col lg="4" md="5" className="ms-auto">
                          <ul className="list-unstyled h6 fw-normal mt-4 mb-0 ms-md-5 ms-lg-4">
                            <li className="text-muted d-flex justify-content-between">
                              ETH Cost :<span>22.325458</span>
                            </li>
                            <li className="text-muted d-flex justify-content-between">
                              USD Cost :<span>$ 22600</span>
                            </li>
                            <li className="text-muted d-flex justify-content-between">
                              Floor Value :<span>$ 22600</span>
                            </li>
                            <li className="text-muted d-flex justify-content-between">
                              Taxes :<span> 0</span>
                            </li>
                            <li className="d-flex justify-content-between">
                              Total :<span>$ 22600</span>
                            </li>
                          </ul>
                        </Col>
                      </Row>
                    </div>

                    <div className="invoice-footer border-top pt-4">
                      <Row>
                        <Col sm="6">
                          <div className="text-sm-start text-muted text-center">
                            <h6 className="mb-0">
                              Customer Services :{' '}
                              <Link
                                to="#"
                                onClick={this.callNumber}
                                className="text-warning"
                              >
                                (+12) 1546-456-856
                              </Link>
                            </h6>
                          </div>
                        </Col>

                        <Col sm="6">
                          <div className="text-sm-end text-muted text-center">
                            <h6 className="mb-0">
                              <Link
                                to="/page-terms"
                                target="_blank"
                                className="text-primary"
                              >
                                Terms & Conditions
                              </Link>
                            </h6>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
      </React.Fragment>
    );
  }
}

export default PageInvoice;
