import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Table, Card, CardBody } from "reactstrap";
import logodark from "../../../assets/images/burnance_logo.png";
//Import Icons
import FeatherIcon from "feather-icons-react";

class PageInvoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        { id: 1, name: "One Day Bae #7925", qty: 2, rate: 2600 },
        { id: 2, name: "Loopy Donuts #7257", qty: 1, rate: 3660 },
        { id: 3, name: "Jailed Baby Ape Club #5940", qty: 3, rate: 4580 },
      ],
      nfts: [],
      ethereumAddress: '',
      walletConnected: false,
    };
    this.sendMail.bind(this);
    this.callNumber.bind(this);
    this.accountsChanged.bind(this);
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
                        </Col>
                      </Row>
                    </div>

                    <div className="invoice-middle py-4">
                      <h5>Portfolio Details :</h5>
                      <Row className="mb-0">
                        <Col md={{ size: 8, order: 1 }} xs={{ order: 2 }}>
                          <dl className="row">
                            <dt className="col-md-3 col-5 fw-normal">
                              Invoice No. :
                            </dt>
                            <dd className="col-md-9 col-7 text-muted">
                              land45845621
                            </dd>

                            <dt className="col-md-3 col-5 fw-normal">Name :</dt>
                            <dd className="col-md-9 col-7 text-muted">
                              Calvin Carlo
                            </dd>

                            <dt className="col-md-3 col-5 fw-normal">
                              Address :
                            </dt>
                            <dd className="col-md-9 col-7 text-muted">
                              <p className="mb-0">1962 Pike Street,</p>
                              <p className="mb-0">Diego, CA 92123</p>
                            </dd>

                            <dt className="col-md-3 col-5 fw-normal">
                              Phone :
                            </dt>
                            <dd className="col-md-9 col-7 text-muted">
                              (+45) 4584-458-695
                            </dd>
                          </dl>
                        </Col>

                        <Col
                          md={{ size: 4, order: 2 }}
                          xs={{ order: 1 }}
                          className="mt-2 mt-sm-0"
                        >
                          <dl className="row mb-0">
                            <dt className="col-md-4 col-5 fw-normal">Date :</dt>
                            <dd className="col-md-8 col-7 text-muted">
                              15th Oct, 2019
                            </dd>
                          </dl>
                        </Col>
                      </Row>
                    </div>

                    <div className="invoice-table pb-4">
                      <div className="table-responsive bg-white shadow rounded">
                        <Table className="mb-0 table-center invoice-tb">
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
                                Total
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
                                <td>{item.qty}</td>
                                <td>$ {item.rate}</td>
                                <td>{item.qty}</td>
                                <td>{item.qty}</td>
                                <td>{item.qty}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
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
