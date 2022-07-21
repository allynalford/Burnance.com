/* eslint-disable jsx-a11y/img-redundant-alt */
/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Collapse,
  Card,
  CardBody,
  CardHeader,
} from "reactstrap";
import { Link } from "react-router-dom";


//import images
import Asset190 from "../../assets/images/illustrator/Asset190.svg";
import Asset189 from "../../assets/images/illustrator/Asset189.svg";
import Asset192 from "../../assets/images/illustrator/Asset192.svg";
import Asset187 from "../../assets/images/illustrator/Asset187.svg";



class Faqs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counters: [
        {
          title: "Happy Client",
          image: Asset190,
          start: 0,
          value: 97,
          postfix: "%",
        },
        { title: "Awards", image: Asset189, start: 0, value: 15, postfix: "+" },
        {
          title: "Job Placement",
          image: Asset192,
          start: 0,
          value: 2,
          postfix: "K",
        },
        {
          title: "Project Complete",
          image: Asset187,
          start: 0,
          value: 98,
          postfix: "%",
        },
      ],
      isOpen: false,
      collapse1: true,
      col1: true,
      col2: false,
      col3: false,
      col4: false,
      col5: false,
      col6: false,
    };
    this.openModal = this.openModal.bind(this);
    this.t_col1 = this.t_col1.bind(this);
    this.t_col2 = this.t_col2.bind(this);
    this.t_col3 = this.t_col3.bind(this);
    this.t_col4 = this.t_col4.bind(this);
    this.t_col5 = this.t_col5.bind(this);
    this.t_col6 = this.t_col6.bind(this);
    this.t_col7 = this.t_col7.bind(this);
  }

  openModal() {
    this.setState({ isOpen: true });
  }

  t_col1() {
    this.setState({
      col1: !this.state.col1,
      col2: false,
      col3: false,
      col4: false,
      col5: false,
      col6: false,
      col7: false,
    });
  }
  t_col2() {
    this.setState({
      col2: !this.state.col2,
      col1: false,
      col3: false,
      col4: false,
      col5: false,
      col6: false,
      col7: false,
    });
  }
  t_col3() {
    this.setState({
      col3: !this.state.col3,
      col2: false,
      col1: false,
      col4: false,
      col5: false,
      col6: false,
      col7: false,
    });
  }
  t_col4() {
    this.setState({
      col4: !this.state.col4,
      col2: false,
      col3: false,
      col1: false,
      col5: false,
      col6: false,
      col7: false,
    });
  }
  t_col5() {
    this.setState({
      col5: !this.state.col5,
      col2: false,
      col3: false,
      col1: false,
      col4: false,
      col6: false,
      col7: false,
    });
  }
  t_col6() {
    this.setState({
      col6: !this.state.col6,
      col7: false,
      col2: false,
      col3: false,
      col1: false,
      col4: false,
      col5: false,
    });
  }
  t_col7() {
    this.setState({
      col7: !this.state.col7,
      col2: false,
      col3: false,
      col1: false,
      col4: false,
      col5: false,
      col6: false,
    });
  }
  render() {
    return (
      <React.Fragment>
        <section className="section">
          {/* <Container>
            <Row className="justify-content-center">
              <Col className="text-center">
                <div className="section-title mb-4 pb-2">
                  <h3 className="title mb-4">
                   What’s the point of having alternative text for my NFT?
                  </h3>
                  <p className="text-muted para-desc mx-auto mb-0">
                    Start working with{" "}
                    <span className="text-primary fw-bold">
                      Landrick
                    </span>{" "}
                    that can provide everything you need to generate awareness,
                    drive traffic, connect.
                  </p>
                </div>
              </Col>
            </Row>

            <Row id="counter">
              <Counter2 counters={this.state.counters} />
            </Row>
          </Container> */}

          <Container className="mt-100 mt-60">
            <Row className="align-items-center">
              <Col lg="7" md="6">
                <div className="faq-content me-lg-5">
                  <div className="accordion" id="accordionExample">
                    <Card className="border-0 rounded mb-2">
                      <Link
                        to="#"
                        onClick={this.t_col1}
                        className={
                          this.state.col1
                            ? 'faq position-relative text-primary'
                            : 'faq position-relative text-dark'
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingTwo"
                        >
                          <h4 className="title mb-0">
                            What does NFT stand for?
                            <i
                              className={
                                this.state.col1
                                  ? 'mdi mdi-chevron-up float-end'
                                  : 'mdi mdi-chevron-down float-end'
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col1}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">
                            NFT stands for non-fungible token. One cannot copy
                            an NFT, making it one-of-a-kind and secure.
                          </p>
                        </CardBody>
                      </Collapse>
                    </Card>
                    <Card className="border-0 rounded mb-2">
                      <Link
                        to="#"
                        onClick={this.t_col2}
                        className={
                          this.state.col2
                            ? 'faq position-relative text-primary'
                            : 'faq position-relative text-dark'
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingTwo"
                        >
                          <h4 className="title mb-0">
                            What is the crypto tax rate?
                            <i
                              className={
                                this.state.col2
                                  ? 'mdi mdi-chevron-up float-end'
                                  : 'mdi mdi-chevron-down float-end'
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col2}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">
                            The length of time a trader has held an asset
                            determines whether their proceeds will be taxed as
                            short-term capital gains or long-term capital gains.
                            The U.S. incentivizes long-term trading by taxing
                            long-term gains at lower rates. Per the IRS’s
                            cryptocurrency tax FAQs, the holding period begins
                            on the day after you receive an asset. The asset's
                            cost basis will be its purchase price, plus any
                            applicable fees.
                          </p>
                          <h5>Short-term capital gains</h5>
                          <p className="text mb-0 faq-ans">
                            If you hold a digital asset for a year or less
                            before you sell, swap, or trade it, your proceeds
                            will be considered short-term capital gains and
                            taxed at your ordinary income rate, which is
                            determined by your overall income.
                          </p>
                          <h5>Long-term capital gains</h5>
                          <p className="text mb-0 faq-ans">
                            Long-term capital gains: If you hold cryptocurrency
                            for more than a year before you sell, swap, or trade
                            it, your proceeds will be taxed at the advantageous
                            long-term gains rate. These rates also depend on
                            your overall income, but are generally lower than
                            the short-term gains rates.
                          </p>
                          <h5>Ordinary income</h5>
                          <p className="text mb-0 faq-ans">
                            If you earn crypto from staking, lending, mining, or
                            payment for goods or services, these assets will be
                            taxed at your ordinary income tax rate.
                          </p>
                        </CardBody>
                      </Collapse>
                    </Card>
                    <Card className="border-0 rounded mb-2">
                      <Link
                        to="#"
                        onClick={this.t_col3}
                        className={
                          this.state.col3
                            ? 'faq position-relative text-primary'
                            : 'faq position-relative text-dark'
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingTwo"
                        >
                          <h4 className="title mb-0">
                            What is the capital gains tax rate for NFTs?
                            <i
                              className={
                                this.state.col3
                                  ? 'mdi mdi-chevron-up float-end'
                                  : 'mdi mdi-chevron-down float-end'
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col3}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">......</p>
                        </CardBody>
                      </Collapse>
                    </Card>
                    <Card className="border-0 rounded mb-2">
                      <Link
                        to="#"
                        onClick={this.t_col4}
                        className={
                          this.state.col6
                            ? 'faq position-relative text-primary'
                            : 'faq position-relative text-dark'
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingTwo"
                        >
                          <h4 className="title mb-0">
                            How can I reduce my crypto capital gains taxes?
                            <i
                              className={
                                this.state.col4
                                  ? 'mdi mdi-chevron-up float-end'
                                  : 'mdi mdi-chevron-down float-end'
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col4}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">.....</p>
                        </CardBody>
                      </Collapse>
                    </Card>
                    <Card className="border-0 rounded mb-2">
                      <Link
                        to="#"
                        onClick={this.t_col5}
                        className={
                          this.state.col1
                            ? 'faq position-relative text-primary'
                            : 'faq position-relative text-dark'
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingOne"
                        >
                          <h4 className="title mb-0">
                            Are NFTs taxable?
                            <i
                              className={
                                this.state.col5
                                  ? 'mdi mdi-chevron-up float-end'
                                  : 'mdi mdi-chevron-down float-end'
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col5}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">......</p>
                        </CardBody>
                      </Collapse>
                    </Card>

                    <Card className="border-0 rounded mb-2">
                      <Link
                        to="#"
                        onClick={this.t_col6}
                        className={
                          this.state.col6
                            ? 'faq position-relative text-primary'
                            : 'faq position-relative text-dark'
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingTwo"
                        >
                          <h4 className="title mb-0">
                            Investor taxes for NFT's
                            <i
                              className={
                                this.state.col6
                                  ? 'mdi mdi-chevron-up float-end'
                                  : 'mdi mdi-chevron-down float-end'
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col6}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">......</p>
                        </CardBody>
                      </Collapse>
                    </Card>
                    <Card className="border-0 rounded mb-2">
                      <Link
                        to="#"
                        onClick={this.t_col7}
                        className={
                          this.state.col3
                            ? 'faq position-relative text-primary'
                            : 'faq position-relative text-dark'
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingTwo"
                        >
                          <h4 className="title mb-0">
                            NFT taxes for creators
                            <i
                              className={
                                this.state.col7
                                  ? 'mdi mdi-chevron-up float-end'
                                  : 'mdi mdi-chevron-down float-end'
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col7}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">
                            Creators are treated as a “business” when it comes
                            to taxes. The money generated is considered income
                            and should be taxed accordingly. This also applies
                            to the royalties associated with the sales of the
                            assets.
                          </p>
                        </CardBody>
                      </Collapse>
                    </Card>
                  </div>
                </div>
              </Col>

              <Col lg="5" md="6" className="mt-4 mt-sm-0 pt-2 pt-sm-0">
                <Card className="work-container work-modern overflow-hidden rounded border-0 shadow-lg">
                  <CardBody className="p-0">
                    <img
                      className="rounded img-fluid mx-auto d-block"
                      src={
                        'https://gateway.pinata.cloud/ipfs/QmTiRYughXmGdbFkXJPxEAZNyh5CjeniTPCEChKAa3MSzB/927.png'
                      }
                      alt="This is an NFT called 0xAASC #927. It is part of an expansion collection to grow the 0x Social Club and Yellow Army. Your NFT is your membership pass. The image shows a yellow creature with light fur, a red body, and a pipe in its mouth. Its eyes are waved and it is wearing a rainbow party hat and big hoop earrings."
                    />
                    <div className="overlay-work bg-dark"></div>
                    <div className="content">
                      <a
                        target={'_new'}
                        href="https://opensea.io/assets/0x121f509d496ff8b384ea41c565cfd9110152112b/927"
                        className="title text-white d-block fw-bold"
                      >
                        0xAASC #927
                      </a>
                      <small className="text-light">
                        Alt Text: This image is of an NFT called 0xAASC #927. It
                        is part of an expansion collection to grow the 0x Social
                        Club and Yellow Army. Your NFT is your membership pass.
                        The image shows a yellow creature with light fur, a red
                        body, and a pipe in its mouth. Its eyes are waved and it
                        is wearing a rainbow party hat and big hoop earrings.
                      </small>
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

export default Faqs;
