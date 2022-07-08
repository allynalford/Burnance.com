/* eslint-disable jsx-a11y/anchor-is-valid */
/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Alert,
  Form,
  Label,
  Input,
  Button,
} from "reactstrap";
//Import Icons
import FeatherIcon from "feather-icons-react";
//Import Images
import cta from "../../assets/images/nfts/ac1_unfit_digital_collage_of_locally_owned_nfts_by_annie_bur.jpg";
const endpoint = require("../../common/endpoint");

class Cta extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      loading: false,
      email: "",
      name: "",
      build: "",
      message: "",
      msgColor: "info",
      subscribe: ""
    };
    this.handleSubmit.bind(this);
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true });

    if(this.state.email === ""){
      this.setState({ loading: false, message: "Email Address is required", msgColor: "warning",isOpen: true });
    }

    if(this.state.name === ""){
      this.setState({ loading: false, message: "Name is required", msgColor: "warning",isOpen: true });
    }

    if(this.state.build === ""){
      this.setState({ loading: false, message: "What your building is required", msgColor: "warning",isOpen: true });
    }

    const resp = await endpoint._post(
      `${process.env.REACT_APP_BASE_API_URL}/nft/drip/add/subscriber`,
      {
        email: this.state.email,
        name: this.state.name,
        build: this.state.build,
        subscribe: this.state.subscribe,
      },
    );

    if (typeof resp.data.success !== "undefined" && resp.data.success === true) {
      //Clear the form and submit a message
      this.setState({
        loading: false,
        name: "",
        email: "",
        build: "",
        message: "Your on the waitlist",
        msgColor: "info",
        isOpen: true
      });
    } else {
      this.setState({
        loading: false,
        message: "Error joining waitlist",
        msgColor: "warning",
        isOpen: true
      });
    }


    this.setState({ loading: false});

  };

  render() {
    return (
      <React.Fragment>
        <Container fluid className="mt-100 mt-60">
          <div
            className="rounded py-md-5"
            style={{ background: `url(${cta}) center center no-repeat` }}
          >
            <Row className="py-5">
              <Container>
                <Row className="align-items-center px-3 px-sm-0">
                  <Col lg={8} md={6} xs={12}>
                    {/* <div className="section-title">
                      <h3 className="display-4 h1 text-black title-dark mb-4">
                        Join the API Waitlist
                      </h3>
                      <p className="text titlek para-desc">
                        Start working with Landrick that can provide everything
                        you need to generate awareness, drive traffic, connect.
                      </p>
                      <div className="mt-4">
                        <Link to="#" className="btn btn-primary">
                          Admission Now
                        </Link>
                      </div>
                    </div> */}
                    &nbsp;
                  </Col>

                  <Col
                    lg={4}
                    md={6}
                    xs={12}
                    className="mt-4 pt-2 mt-sm-0 pt-sm-0"
                  >
                    <Card className="login_page shadow rounded border-0">
                      <CardBody>
                        <h4 className="card-title"><a href="#" name="waitlist">Join the API Wait list</a></h4>
                        <Alert
                          isOpen={this.state.isOpen}
                          toggle={() => this.setState({ isOpen: false })}
                          color={this.state.msgColor}
                        >
                         {this.state.message}
                        </Alert>
                        <Form
                          className="login-form"
                          onSubmit={this.handleSubmit}
                        >
                          <Row>
                            <Col md={12}>
                              <div className="mb-3">
                                <Label className="form-label" for="name">
                                  Your Name :
                                  <span className="text" style={{color: "#CF000F", fontWeight: "bolder"}}>*</span>
                                </Label>
                                <div className="form-icon position-relative">
                                  <i>
                                    <FeatherIcon
                                      icon="user"
                                      className="fea icon-sm icons"
                                    />
                                  </i>
                                </div>
                                <Input
                                  name="name"
                                  id="name"
                                  type="text"
                                  className="form-control ps-5"
                                  placeholder="Your Name :"
                                  value={this.state.name}
                                  onChange={ e=> {
                                    this.setState({name: e.target.value})
                                  }}
                                  disabled={this.state.loading}
                                />
                              </div>
                            </Col>
                            <Col md={12}>
                              <div className="mb-3">
                                <Label className="form-label" for="email">
                                  Your Email :
                                  <span className="text" style={{color: "#CF000F", fontWeight: "bolder"}}>*</span>
                                </Label>
                                <div className="form-icon position-relative">
                                  <i>
                                    <FeatherIcon
                                      icon="mail"
                                      className="fea icon-sm icons"
                                    />
                                  </i>
                                </div>
                                <Input
                                  name="email"
                                  id="email"
                                  type="email"
                                  className="form-control ps-5"
                                  placeholder="Your email :"
                                  value={this.state.email}
                                  onChange={ e=> {
                                    this.setState({email: e.target.value})
                                  }}
                                  disabled={this.state.loading}
                                />
                              </div>
                            </Col>
                            <Col md={12}>
                              <div className="mb-3">
                                <Label className="form-label" for="build">
                                  What are you building?
                                  <span className="text" style={{color: "#CF000F", fontWeight: "bolder"}}>*</span>
                                </Label>
                                <div className="form-icon position-relative">
                                  <i>
                                    <FeatherIcon
                                      icon="mail"
                                      className="fea icon-sm icons"
                                    />
                                  </i>
                                </div>
                                <Input
                                  name="build"
                                  id="build"
                                  type="textarea"
                                  className="form-control ps-5"
                                  placeholder="What are you building?"
                                  value={this.state.build}
                                  onChange={ e=> {
                                    this.setState({build: e.target.value})
                                  }}
                                  disabled={this.state.loading}
                                />
                              </div>
                            </Col>
                            <Col md={12}>
                              <div className="mb-3">
                                <div className="form-check">
                                  <Input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="subscribe"
                                    value={this.state.subscribe}
                                    disabled={this.state.loading}
                                    onChange={ e=> {
                                      this.setState({subscribe: e.target.value})
                                    }}
                                  />
                                  <Label
                                    className="form-check-label"
                                    htmlFor="customCheck1"
                                  >
                                    Subscribe to wait list updates
                                  </Label>
                                </div>
                              </div>
                            </Col>
                            <Col md={12}>
                              <Button
                                color="primary"
                                type="submit"
                                className="w-100"
                                disabled={this.state.loading}
                              >
                                Join
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Container>
            </Row>
          </div>
        </Container>
      </React.Fragment>
    );
  }
}

export default Cta;
