import React, { Component } from "react";
import { Container, Row, Col, Table, Input } from "reactstrap";
import { Link } from "react-router-dom";

//Import components
import PageBreadcrumb from "../../../components/Shared/PageBreadcrumb";

var USD = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'USD'});

class ShopCart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalCostBasis: 0,
      totalLosses: 0,
      pathItems: [
        //id must required
        { id: 1, name: "Burnance", link: "/" },
        { id: 2, name: "Batch", link: "/batch" },
        { id: 3, name: "NFTs" },
      ],
      items: [
        { id: 1, image: "https://lh3.googleusercontent.com/UZ-26gO6lqy5ttLDdHM5hdZFUy1fjHCpurmWHJl0dFgmuQw2LVjN2FV2bm5JwS-i1rvkngpBzDyWaKgDox80OB4v8_muh9JkZcFS=w600", name: "Bored Ape Yacht Club #1957", price: 255.00, qty: 1 },
        { id: 2, image: "https://lh3.googleusercontent.com/hK5N3SQdLDiOE4UShsUbcIDnIbum5aIlLBVWMTmyRn-SrWeAI57hL1p6VTmyfT7SVKPIbumK6aGsG3kyUw3YEWtG54YcGwpvBPwU=w600", name: "Cool Cat #3995", price: 520.00, qty: 1 },
        { id: 3, image: "https://lh3.googleusercontent.com/qYIEkkleVnMjIkoIzQch730RIN0AyO6YnhzCsx9kV3Ag3vArZFRpskAWmldwMAuX2DB23LzjP0KiiMbLdq5yojRXwG8mQoqAhW1HYQ=w600", name: "Doodle #8712", price: 160.00, qty: 1 },
      ],
    };
    this.addItem.bind(this);
    this.removeItem.bind(this);
    this.removeCartItem.bind(this);
  }

  removeCartItem = (itemId) => {
    let items = this.state.items;

    var filtered = items.filter(function (item) {
      return item.id !== itemId;
    });

    this.setState({ items: filtered });
  };

  addItem = (itemId) => {
    var newItems = this.state.items;
    newItems.map((item, key) =>
      item.id === itemId ? (item.qty = item.qty + 1) : false
    );
    this.setState({ items: newItems });
  };

  removeItem = (itemId) => {
    var newItems = this.state.items;
    newItems.map(
      (item, key) => {
        if (item.id === itemId && item.qty > 0) {
          return (item.qty = item.qty - 1);
        } else {
          return false;
        }
      }
      // item.id === itemId ? (item.qty = item.qty - 1) : false
    );
    this.setState({ items: newItems });
  };

  componentDidMount() {
    window.addEventListener("scroll", this.scrollNavigation, true);
  }

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
                <div className="table-responsive bg-white shadow">
                  <Table className="table-center table-padding mb-0">
                    <thead>
                      <tr>
                        <th className="py-3 border-bottom" style={{ minWidth: "20px" }}>Remove</th>
                        <th className="py-3 border-bottom" style={{ minWidth: "300px" }}>
                          Product
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
                      {this.state.items.map((item, key) => (
                        <tr key={key} className="shop-list">
                          <td className="h6">
                            <Link
                              to="#"
                              onClick={() => this.removeCartItem(item.id)}
                              className="text-danger"
                            >
                              X
                            </Link>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={item.image}
                                className="img-fluid avatar avatar-small rounded shadow"
                                style={{ height: "auto" }}
                                alt=""
                              />
                              <h6 className="mb-0 ms-3">{item.name}</h6>
                            </div>
                          </td>
                          <td className="text-center">{USD.format(item.price)}</td>
                          <td className="text-center qty-icons">
                            <Input
                              type="button"
                              value="-"
                              onClick={() => this.removeItem(item.id)}
                              className="minus btn btn-icon btn-soft-primary"
                              readOnly
                            />{" "}
                            <Input
                              type="text"
                              step="1"
                              min="1"
                              name="quantity"
                              value={item.qty}
                              title="Qty"
                              readOnly
                              className="btn btn-icon btn-soft-primary qty-btn quantity"
                            />{" "}
                            <Input
                              type="button"
                              value="+"
                              onClick={() => this.addItem(item.id)}
                              readOnly
                              className="plus btn btn-icon btn-soft-primary"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
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
