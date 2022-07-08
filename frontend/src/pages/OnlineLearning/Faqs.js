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
    this.t_col5 = this.t_col5.bind(this);
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
    });
  }
  t_col2() {
    this.setState({
      col2: !this.state.col2,
      col1: false,
      col3: false,
      col4: false,
      col5: false,
    });
  }
  t_col3() {
    this.setState({
      col3: !this.state.col3,
      col2: false,
      col1: false,
      col4: false,
      col5: false,
    });
  }
  t_col4() {
    this.setState({
      col4: !this.state.col4,
      col2: false,
      col3: false,
      col1: false,
      col5: false,
    });
  }
  t_col5() {
    this.setState({
      col5: !this.state.col5,
      col2: false,
      col3: false,
      col1: false,
      col4: false,
    });
  }
  t_col6() {
    this.setState({
      col6: !this.state.col6,
      col2: false,
      col3: false,
      col1: false,
      col4: false,
      col5: false,
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
                            ? "faq position-relative text-primary"
                            : "faq position-relative text-dark"
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingOne"
                        >
                          <h4 className="title mb-0">
                            What’s the point of having alternative text for my NFT?
                            <i
                              className={
                                this.state.col1
                                  ? "mdi mdi-chevron-up float-end"
                                  : "mdi mdi-chevron-down float-end"
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col1}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">
                            Alternative text allows users with disabilities to understand what the
                            NFT is with a detailed description of the image that can be read by screen readers.
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
                            ? "faq position-relative text-primary"
                            : "faq position-relative text-dark"
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingTwo"
                        >
                          <h4 className="title mb-0">
                            How much does NFT Alternative Text Generator cost?
                            <i
                              className={
                                this.state.col2
                                  ? "mdi mdi-chevron-up float-end"
                                  : "mdi mdi-chevron-down float-end"
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col2}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">
                            Our NFT Alternative Text Generator is free for users looking to generate alternative
                            text for their NFTs. We do offer a paid API integration, you can contact our team
                            to get a quote.
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
                            ? "faq position-relative text-primary"
                            : "faq position-relative text-dark"
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingTwo"
                        >
                          <h4 className="title mb-0">
                            How Does Our AI NFT Alternative Text Generator Work?
                            <i
                              className={
                                this.state.col3
                                  ? "mdi mdi-chevron-up float-end"
                                  : "mdi mdi-chevron-down float-end"
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col3}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">
                            We use deep learning technology to review your
                            image and create alternative text using GPT-3.
                          </p>
                        </CardBody>
                      </Collapse>
                    </Card>
                    <Card className="border-0 rounded mb-2">
                      <Link
                        to="#"
                        onClick={this.t_col4}
                        className={
                          this.state.col4
                            ? "faq position-relative text-primary"
                            : "faq position-relative text-dark"
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingTwo"
                        >
                          <h4 className="title mb-0">
                            How does alternative text for NFT's help?
                            <i
                              className={
                                this.state.col4
                                  ? "mdi mdi-chevron-up float-end"
                                  : "mdi mdi-chevron-down float-end"
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col4}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">
                            Sometimes people with visual impairments will use alternative text to
                            help them understand what the image is depicting. Regular consumers might
                            also want to browse the web without images for a more text-based experience.
                          </p>
                        </CardBody>
                      </Collapse>
                    </Card>
                    <Card className="border-0 rounded mb-2">
                      <Link
                        to="#"
                        onClick={this.t_col5}
                        className={
                          this.state.col5
                            ? "faq position-relative text-primary"
                            : "faq position-relative text-dark"
                        }
                      >
                        <CardHeader
                          className="border-0 bg-light p-3 pe-5"
                          id="headingTwo"
                        >
                          <h4 className="title mb-0">
                            How do we generate Alternative text for NFT's?
                            <i
                              className={
                                this.state.col5
                                  ? "mdi mdi-chevron-up float-end"
                                  : "mdi mdi-chevron-down float-end"
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col5}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">
                            We use the Ethereum blockchain to review your NFT to create
                            alternative text such as "Keys of Glory" or "The Amazing Flying Onion."
                            We evaluate each NFT based on its characteristics, including the number of
                            NFT traits or tags it has, its rarity level, IPFS and more.
                          </p>
                        </CardBody>
                      </Collapse>
                    </Card>
                    <Card className="border-0 rounded mb-2">
                      <Link
                        to="#"
                        onClick={this.t_col6}
                        className={
                          this.state.col6
                            ? "faq position-relative text-primary"
                            : "faq position-relative text-dark"
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
                                this.state.col6
                                  ? "mdi mdi-chevron-up float-end"
                                  : "mdi mdi-chevron-down float-end"
                              }
                            ></i>
                          </h4>
                        </CardHeader>
                      </Link>
                      <Collapse isOpen={this.state.col6}>
                        <CardBody>
                          <p className="text mb-0 faq-ans">
                          NFT stands for non-fungible token. One cannot copy an NFT, 
                          making it one-of-a-kind and secure. 
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
                      src={"https://gateway.pinata.cloud/ipfs/QmTiRYughXmGdbFkXJPxEAZNyh5CjeniTPCEChKAa3MSzB/927.png"}
                      alt="This is an NFT called 0xAASC #927. It is part of an expansion collection to grow the 0x Social Club and Yellow Army. Your NFT is your membership pass. The image shows a yellow creature with light fur, a red body, and a pipe in its mouth. Its eyes are waved and it is wearing a rainbow party hat and big hoop earrings." />
                    <div className="overlay-work bg-dark"></div>
                    <div className="content">
                      <a
                        target={"_new"}
                        href="https://opensea.io/assets/0x121f509d496ff8b384ea41c565cfd9110152112b/927"
                        className="title text-white d-block fw-bold"
                      >
                        0xAASC #927
                      </a>
                      <small className="text-light">Alt Text: This image is of an NFT called 0xAASC #927. It is part of an expansion collection to grow the 0x Social Club and Yellow Army. Your NFT is your membership pass. The image shows a yellow creature with light fur, a red body, and a pipe in its mouth. Its eyes are waved and it is wearing a rainbow party hat and big hoop earrings.</small>
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
