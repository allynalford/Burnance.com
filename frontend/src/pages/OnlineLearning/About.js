import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody
} from "reactstrap";
import SectionTitle from "../../components/Shared/SectionTitle";

class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen1: false,
      isOpen: false,
    };
    this.openModal = this.openModal.bind(this);
    this.openModalMap.bind(this);
  }

  openModal() {
    this.setState({ isOpen: true });
  }

  openModalMap = (branchName, location) => {
    this.setState({
      isOpen1: !this.state.isOpen1,
    });
  };

  render() {
    return (
      <React.Fragment>
        <Container>
          {/* render Section title */}
          <SectionTitle
            title="How NFT Alternative Text Generator Works"
            desc="Using the latest AI technology, our solution analyzes your NFTs to produce high-quality descriptive alternative text"
          />
          <Row className="align-items-center">
            <Col lg={6} md={12}>
              <Row className="align-items-center">
                <Col lg={6} md={6} className="mt-4 mt-lg-0 pt-2 pt-lg-0">
                  <Card className="work-container work-modern overflow-hidden rounded border-0 shadow-lg">
                    <CardBody className="p-0">
                      <img
                        src={"https://lh3.googleusercontent.com/hK5N3SQdLDiOE4UShsUbcIDnIbum5aIlLBVWMTmyRn-SrWeAI57hL1p6VTmyfT7SVKPIbumK6aGsG3kyUw3YEWtG54YcGwpvBPwU=w600"}
                        className="img-fluid" alt="This is an NFT of a Doodle (#8712) by Burnt Toast. The Doodle has a rainbow puke face, holographic brushcut hair, pink and white jacket body, light blue background, and yellow head." />
                      <div className="overlay-work bg-dark"></div>
                      <div className="content">
                        <a
                          href="https://opensea.io/assets/0x8a90cab2b38dba80c64b7734e58ee1db38b8992e/8712"
                          target={"_new"}
                          className="title text-white d-block fw-bold"
                        >
                          Doodle #8712
                        </a>
                        <small className="text-light">Alt Text: This is an NFT image of a Doodle (#8712) by Burnt Toast. The Doodle has a rainbow puke face, holographic brushcut hair, pink and white jacket body, light blue background, and yellow head.</small>
                      </div>
                    </CardBody>
                  </Card>

                  {/* <div className="mt-4 pt-2 text-end d-none d-md-block">
                    <Link to="#" className="btn btn-primary">
                      See More{" "}
                      <i>
                        <FeatherIcon
                          icon="chevron-right"
                          className="fea icon-sm"
                        />
                      </i>
                    </Link>
                  </div> */}
                </Col>

                <Col lg={6} md={6}>
                  <Row>
                    <Col lg={12} md={12} className="mt-4 mt-lg-0 pt-2 pt-lg-0">
                      <Card className="work-container work-modern overflow-hidden rounded border-0 shadow-lg">
                        <CardBody className="p-0">
                          <img
                            src={"https://lh3.googleusercontent.com/UZ-26gO6lqy5ttLDdHM5hdZFUy1fjHCpurmWHJl0dFgmuQw2LVjN2FV2bm5JwS-i1rvkngpBzDyWaKgDox80OB4v8_muh9JkZcFS=w600"}
                            className="img-fluid" alt="This NFT features a blue background, a black T-shirt, a bored unshaven pipe, a halo, zombie fur, and bored eyes." />
                          <div className="overlay-work bg-dark"></div>
                          <div className="content">
                            <a
                              target={"_new"}
                              href="https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/1957"
                              className="title text-white d-block fw-bold"
                            >
                              Bored Ape Yacht Club #1957
                            </a>
                            <small className="text-light">Alt Text: This image features a blue background, a black T-shirt, a bored unshaven pipe, a halo, zombie fur, and bored eyes.</small>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>

                    <Col lg={12} md={12} className="mt-4 pt-2">
                      <Card className="work-container work-modern overflow-hidden rounded border-0 shadow-lg">
                        <CardBody className="p-0">
                          <img src={"https://lh3.googleusercontent.com/qYIEkkleVnMjIkoIzQch730RIN0AyO6YnhzCsx9kV3Ag3vArZFRpskAWmldwMAuX2DB23LzjP0KiiMbLdq5yojRXwG8mQoqAhW1HYQ=w600"}
                            className="img-fluid" alt="The Cool Cat #3995 is a blue cat with a ninja red hat, a red t-shirt, and glasses. It is a level 2 cool cat." />
                          <div className="overlay-work bg-dark"></div>
                          <div className="content">
                            <a
                              href="https://opensea.io/assets/0x1a92f7381b9f03921564a437210bb9396471050c/3995"
                              className="title text-white d-block fw-bold"
                              target={"_new"}
                            >
                              Cool Cat #3995
                            </a>
                            <small className="text-light">Alt Text: The Cool Cat #3995 is a blue cat with a ninja red hat, a red t-shirt, and glasses. It is a level 2 cool cat.</small>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>

            <Col lg={6} md={12} className="mt-4 mt-lg-0 pt- pt-lg-0">
              <div className="ms-lg-4">
                <div className="section-title mb-4 pb-2">
                  <h3 className="title mb-4">What’s an NFT?</h3>
                  <p className="text para-desc mb-0">
                  Non-fungible tokens, or NFTs, are a kind of cryptocurrency that can be traded over the internet. 
                  NFTs are generated and traded in cryptocurrency, which is digital cash with an encrypted key 
                  often in the form of a random string of numbers. NFTs are popular today because they offer a 
                  unique marketplace for digital assets with even companies creating their own NFTs as part of 
                  their marketing mix. Besides these NFTs allow users to store, control, and protect information 
                  related to their identity. Creators can also receive royalties from their NFTs and receive a 
                  percentage of future sales of their NFTs.
                  </p>
                  <p className="text para-desc">
                  NFTs are non-fungible tokens, meaning that they can hold and 
                  transmit more than just the value of the cryptocurrency that it is based on. 
                  For example, one NFT can be a photograph, with extra metadata providing detailed 
                  information about when it was taken, by who, and where.
                  </p>
                </div>

                <div className="section-title mb-4 pb-2">
                  <h3 className="title mb-4">What Does Alternative Text for NFTs do?</h3>
                  <p className="text para-desc">
                  Alternative text is critical for digital assets like photos and artwork. 
                  It gives access to people with visual and specific cognitive disabilities by 
                  describing the function, appearance, and context of an image or graphic they cannot see. 
                  If someone is willing to spend hundreds or thousands in currency, they should have the 
                  full details of what they are buying, whether they are disabled or not.
                  </p>
                </div>

                <div className="mt-4 pt-2">
                  <a href={"#waitlist"}
                    className="btn btn-warning m-1">
                    Use the API
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </Container>



        {/* <Container className="mt-100 mt-60">
          <Row>
            <Col lg={3} md={6} xs={12}>
              <Media className="d-flex features feature-clean">
                <div className="icons text-primary text-center mx-auto">
                  <i className="uil uil-airplay d-block rounded h3 mb-0">
                    
                  </i>
                </div>
                <div className="flex-1 content ms-3">
                  <h5 className="mb-1">
                    <Link to="#" className="text-dark">
                      Learners
                    </Link>
                  </h5>
                  <p className="text-muted mb-0">
                    This is required when, for text is not yet available.
                  </p>
                </div>
              </Media>
            </Col>

            <Col lg={3} md={6} xs={12} className="mt-4 pt-2 mt-sm-0 pt-sm-0">
              <Media className="d-flex features feature-clean">
                <div className="icons text-primary text-center mx-auto">
                  <i className="uil uil-bag d-block rounded h3 mb-0">
                    
                  </i>
                </div>
                <div className="flex-1 content ms-3">
                  <h5 className="mb-1">
                    <Link to="#" className="text-dark">
                      Teachers
                    </Link>
                  </h5>
                  <p className="text-muted mb-0">
                    This is required when, for text is not yet available.
                  </p>
                </div>
              </Media>
            </Col>

            <Col lg={3} md={6} xs={12} className="mt-4 pt-2 mt-lg-0 pt-lg-0">
              <Media className="d-flex features feature-clean">
                <div className="icons text-primary text-center mx-auto">
                  <i className="uil uil-star d-block rounded h3 mb-0">
                    
                  </i>
                </div>
                <div className="flex-1 content ms-3">
                  <h5 className="mb-1">
                    <Link to="#" className="text-dark">
                      Parents
                    </Link>
                  </h5>
                  <p className="text-muted mb-0">
                    This is required when, for text is not yet available.
                  </p>
                </div>
              </Media>
            </Col>

            <Col lg={3} md={6} xs={12} className="mt-4 pt-2 mt-lg-0 pt-lg-0">
              <Media className="d-flex features feature-clean">
                <div className="icons text-primary text-center mx-auto">
                  <i className="uil uil-at d-block rounded h3 mb-0">
                    
                  </i>
                </div>
                <div className="flex-1 content ms-3">
                  <h5 className="mb-1">
                    <Link to="#" className="text-dark">
                      Doners
                    </Link>
                  </h5>
                  <p className="text-muted mb-0">
                    This is required when, for text is not yet available.
                  </p>
                </div>
              </Media>
            </Col>
          </Row>
        </Container> */}
      </React.Fragment>
    );
  }
}

export default About;
