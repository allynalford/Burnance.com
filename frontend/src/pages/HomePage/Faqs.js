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


class Faqs extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
                          <p className="text faq-ans">
                            While the IRS hasn’t taken a formal stance on the
                            tax treatment of NFTs yet it does not exclude them
                            from needing proper tracking for tax purposes. This
                            does make calculating NFT taxes a bit tricky, but it
                            also underscores the importance of staying on top of
                            your NFT taxes.
                          </p>
                          <p className="text faq-ans">
                            It’s better to be over prepared than under prepared
                            when dealing with the IRS. On one hand, it’s
                            possible that NFTs could receive the same treatment
                            as crypto, in which case NFTs would be considered
                            property. That means they would have long-term
                            capital gains tax rates based on your personal
                            income, around 0% to 20%.
                          </p>
                          <p className="text faq-ans">
                            On the other hand, NFTs may receive similar
                            treatment to stamps, antiques, or trading cards.
                            This would give them the collectibles tax rate,
                            which is significantly higher, around 28%.
                          </p>
                          <p className="text faq-ans">
                            These are just the rates for NFTs held longer than
                            one year though. If you buy and sell an NFT in less
                            than a year,{' '}
                            <b>
                              you’re subject to short-term capital gains tax
                              based on your personal income. Some estimate this
                              range could be between 37% and 50% of your
                              earnings.
                            </b>
                          </p>
                          <p className="text mb-0 faq-ans">
                            Now, remember that a lot of these numbers are
                            currently just industry speculation. But you have to
                            be aware of the conversation happening around NFT
                            taxes. The best thing you can do is get in touch
                            with a tax professional to discuss what your
                            personal situation will look like. And that
                            situation will look different depending on whether
                            you’re an NFT artist or an NFT investor.
                          </p>
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
                          <p className="text faq-ans">
                            Being that crypto taxes is one of the most discussed
                            topics in economics, tax shelters are still being
                            figured out and are certain to evolve over time,
                            especially as regulations enforce harder.
                          </p>
                          <p className="text faq-ans">
                            The best ways currently:
                          </p>
                          <ol className="text faq-ans">
                            <li>Tax Harvesting (Which is what Burnance is)</li>
                            <li>Donating to charity (something we do!)</li>
                          </ol>
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
                          <p className="text faq-ans">
                            The IRS has not released any tax guidance on NFTs
                            yet. The best guidance currently is the existing US
                            tax code (
                            <a
                              target={'_new'}
                              href="https://www.law.cornell.edu/uscode/text/26/408"
                            >
                              IRS 408(m)(2)(A)
                            </a>
                            ), “any work of art” is considered a “collectible”.
                            Therefore, it is reasonable to assume that most
                            art-based NFTs should be classified as collectibles
                            for tax purposes. This classification subjects NFTs
                            to{' '}
                            <a
                              target={'_new'}
                              href="https://www.cointracker.io/blog/crypto-tax-guide"
                            >
                              capital gain taxes similar to other common
                              cryptocurrencies
                            </a>{' '}
                            (e.g. BTC, ETH, etc.).
                          </p>
                          <p className="text faq-ans">
                            The specific tax implications of a given NFT depends
                            on:
                          </p>
                          <ol className="text faq-ans">
                            <li>
                              The taxpayer’s role (NFT creator or investor) and;
                            </li>
                            <li>
                              To what extent (i.e. as a{' '}
                              <a
                                target={'_new'}
                                href="https://www.irs.gov/faqs/small-business-self-employed-other-business/income-expenses/income-expenses"
                              >
                                hobby
                              </a>{' '}
                              or a{' '}
                              <a
                                target={'_new'}
                                href="https://www.irs.gov/businesses/small-businesses-self-employed/business-activities"
                              >
                                trade or business
                              </a>
                              ) the taxpayer interacts with NFTs
                            </li>
                          </ol>
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
                          <p className="text faq-ans">
                            Taxes apply when one of the following actions takes
                            place:
                          </p>
                          <ul className="text faq-ans">
                            <li>Acquire an NFT using cryptocurrency</li>
                            <li>Sell off an NFT for cryptocurrency</li>
                            <li>Trade an NFT for another NFT</li>
                          </ul>
                          <p className="text faq-ans">
                            Purchasing an NFT with crypto, like ETH, is
                            considered a disposal event. You’ll incur a capital
                            gain or loss on that disposal depending on the
                            valuation of your coins since your original point of
                            purchase.
                          </p>
                          <p className="text faq-ans">
                            For example, let’s say you bought 1 ETH last year
                            for $100. Today, you want to use it to purchase an
                            NFT for 1 ETH, but the overall value of ETH has
                            appreciated to $1,000.
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
