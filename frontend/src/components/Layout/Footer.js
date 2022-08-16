import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";

//Import Icons
import FeatherIcon from "feather-icons-react";



//Import Images
import logodark from "../../assets/images/burnance_logo.png";

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      grid1: [
        { title: "Collections", link: "/collections" },
        { title: "Coins", link: "/coins" },
        { title: 'Transactions', link: '/account' },
        { title: 'Batch', link: '/batch' },
      ],
      grid2: [
        { title: "ERC721/1155 Contract", link: `https://www.etherscan.io/address/0x5Dbd2Cdb75EDf046Ab08Eced4DCA1dDAB3C66aC4`, external: true },
        { title: "Exp. Transaction", link: `https://etherscan.io/tx/0x5c68bc463df68446c9dd54af80eb3ceef2fe86fcdedcd3ab454ccb629ec09f9a`, external: true },
        { title: "ERC20 Contract", link: `https://www.etherscan.io/address/0xeC159e7c5237305BcA43f82A948F0111d361551b`, external: true },
      ],
    };
  }

  render() {
    return (
      <React.Fragment>
        <footer className={this.props.isLight ? 'footer bg-light' : 'footer'}>
          <Container>
            <Row>
              <Col
                lg="4"
                xs="12"
                className="mb-0 mb-md-4 pb-0 pb-md-2"
                name="footercolumn"
              >
                <Link to="/" className="logo-footer">
                  <img src={logodark} height="118" alt="Burnance Logo" />
                </Link>
                <ul
                  className={
                    this.props.isLight
                      ? 'list-unstyled social-icon social mb-0 m t-4'
                      : 'list-unstyled social-icon foot-social-icon mb-0 mt-4'
                  }
                >
                  {/* <li className="list-inline-item me-1">
                    <a
                      aria-label="Tenably Labs Facebook"
                      target={'_new'}
                      href="https://www.facebook.com/tenablylabs"
                      className="rounded"
                    >
                      <FeatherIcon
                        icon="facebook"
                        className="fea icon-sm fea-social"
                      />
                    </a>
                  </li>
                  <li className="list-inline-item me-1">
                    <a
                      aria-label="Tenably Labs instagram"
                      target={'_new'}
                      href="https://www.instagram.com/tenablylabs/"
                      className="rounded"
                    >
                      <FeatherIcon
                        icon="instagram"
                        className="fea icon-sm fea-social"
                      />
                    </a>
                  </li> */}
                  <li className="list-inline-item me-1">
                    <a
                      aria-label="burnance twitter"
                      target={'_new'}
                      href="https://twitter.com/burnance_"
                      className="rounded"
                    >
                      <FeatherIcon
                        icon="twitter"
                        className="fea icon-sm fea-social"
                      />
                    </a>
                  </li>
                  {/* <li className="list-inline-item me-1">
                    <a
                      aria-label="Tenably Labs linkedin"
                      target={'_new'}
                      href="https://www.linkedin.com/company/tenablylabs"
                      className="rounded"
                    >
                      <FeatherIcon
                        icon="linkedin"
                        className="fea icon-sm fea-social"
                      />
                    </a>
                  </li> */}
                </ul>
              </Col>
              <Col md="6">
                <h4 style={{ fontWeight: 'bold' }}>No Legal Advice Intended</h4>
                <p>
                  The contents of this website, and the posting and viewing of
                  the information on this website, should not be construed as,
                  and should not be relied upon for, legal or tax advice in any
                  particular circumstance or fact situation.
                </p>
                <p>
                  Burnance does not provide tax, legal or accounting advice. You
                  should consult your own tax, legal and accounting advisors.
                </p>
              </Col>

              <Col
                lg="2"
                md="4"
                xs="12"
                className="mt-4 mt-sm-0 pt-2 pt-sm-0"
                name="footercolumn"
              >
                <h4
                  className={
                    this.props.isLight
                      ? 'text-dark footer-head'
                      : 'text-light footer-head'
                  }
                >
                  Company
                </h4>
                <ul className="list-unstyled footer-list mt-4">
                  {this.state.grid1.map((grid, key) => (
                    <li key={key}>
                      {typeof grid.external !== 'undefined' &&
                      grid.external === true ? (
                        <a className={this.props.isLight ? 'text' : 'text-foot'} target={'_new'} href={grid.link}>
                          {grid.title}
                        </a>
                      ) : (
                        <Link
                          to={grid.link}
                          className={this.props.isLight ? 'text' : 'text-foot'}
                        >
                          <i className="mdi mdi-chevron-right me-1"></i>{' '}
                          {grid.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </Col>

              {/* <Col
                lg="3"
                md="4"
                xs="12"
                className="mt-4 mt-sm-0 pt-2 pt-sm-0"
                name="footercolumn"
              >
                <h4
                  className={
                    this.props.isLight
                      ? 'text-dark footer-head'
                      : 'text-light footer-head'
                  }
                >
                  Usefull Links
                </h4>
                <ul className="list-unstyled footer-list mt-4">
                  {this.state.grid2.map((grid, key) => (
                    <li key={key}>
                      {typeof grid.external !== 'undefined' &&
                      grid.external === true ? (
                        <a
                          className={this.props.isLight ? 'text' : 'text-foot'}
                          target={'_new'}
                          href={grid.link}
                        >
                          {grid.title}
                        </a>
                      ) : (
                        <Link
                          to={grid.link}
                          className={this.props.isLight ? 'text' : 'text-foot'}
                        >
                          <i className="mdi mdi-chevron-right me-1"></i>{' '}
                          {grid.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </Col> */}
            </Row>
          </Container>
        </footer>
        <footer className="footer footer-bar">
          <Container className="text-center">
            <Row className="align-items-center">
              <Col sm="6">
                <div className="text-sm-start">
                  <p className="mb-0">2022 Burnance</p>
                </div>
              </Col>
            </Row>
          </Container>
        </footer>
      </React.Fragment>
    );
  }
}

export default Footer;
