import React, { Component } from "react";
import {
  Col,
  Container,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";

import apps from "../../assets/images/dalle/DALL·E 2022-07-26 15.40.09 - An unknown person sitting at a computer in the middle of the night selling digital art work for less than a penny. To Only realize i.png";
import widgets2 from "../../assets/images/task/widgets2.png";
import task from "../../assets/images/task/task.png";
import file from "../../assets/images/task/file.png";

export default class TaskManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "1",
    };
    this.toggleTab = this.toggleTab.bind(this);
  }
  toggleTab(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  }
  render() {
    return (
      <React.Fragment>
        <Container className="mt-100 mt-60">
          <Row className="justify-content-center">
            <Col xs={12}>
              <div className="section-title text-center mb-4 pb-2">
                <h2 className="title mb-4">How BBG works:</h2>
                <p className="text para-desc mb-0 mx-auto">
                  Overview goes here...
                </p>
              </div>
            </Col>{' '}
          </Row>
          <Row className="align-items-center">
            <Col md={5} className="mt-4 pt-2">
              <ul
                className="nav nav-pills bg-white nav-justified flex-column mb-0"
                id="pills-tab"
                role="tablist"
              >
                <NavItem className="bg-light rounded-md">
                  <NavLink
                    to="#"
                    className={classnames(
                      { active: this.state.activeTab === '1' },
                      'rounded-md',
                    )}
                    onClick={() => {
                      this.toggleTab('1');
                    }}
                  >
                    <div className="p-3 text-start">
                      <h5 className="title">Let’s say months down the road</h5>
                      <p className="text tab-para mb-0">
                        your Sh!t asset gets pumped and has value, you can buy
                        it back from us at a fixed 0.005 E fee no matter what.
                        So buy your BBG on your NFT’s it’s only .001E anyways!
                      </p>
                    </div>
                  </NavLink>
                </NavItem>

                <NavItem className="bg-light rounded-md mt-4">
                  <NavLink
                    to="#"
                    className={classnames(
                      { active: this.state.activeTab === '2' },
                      'rounded-md',
                    )}
                    onClick={() => {
                      this.toggleTab('2');
                    }}
                  >
                    <div className="p-3 text-start">
                      <h5 className="title">With our fixed buy back program</h5>
                      <p className="text-muted tab-para mb-0">
                        you and only you will have the ability to recover your
                        burned asset and flip it out for profits. This will not
                        violate your realized loss you claimed, since you are
                        “reinvesting” for .005 on the buyback!
                      </p>
                    </div>
                  </NavLink>
                </NavItem>

                <NavItem className="bg-light rounded-md mt-4">
                  <NavLink
                    to="#"
                    className={classnames(
                      { active: this.state.activeTab === '3' },
                      'rounded-md',
                    )}
                    onClick={() => {
                      this.toggleTab('3');
                    }}
                  >
                    <div className="p-3 text-start">
                      <h5 className="title">Pay a fixed fee</h5>
                      <ul className="text tab-para mb-0">
                          <li>On burn: 0.003 ETH</li>
                          <li>Asset Recovery: 0.005 ETH</li>
                      </ul>
                    </div>
                  </NavLink>
                </NavItem>

                <NavItem className="bg-light rounded-md mt-4">
                  <NavLink
                    to="#"
                    className={classnames(
                      { active: this.state.activeTab === '4' },
                      'rounded-md',
                    )}
                    onClick={() => {
                      this.toggleTab('4');
                    }}
                  >
                    <div className="p-3 text-start">
                      <h5 className="title">File Integrate</h5>
                      <p className="text-muted tab-para mb-0">
                        Dummy text is text that is used in the publishing
                        industry or by web designers.
                      </p>
                    </div>
                  </NavLink>
                </NavItem>
              </ul>
            </Col>
            <Col md={7} xs={12} className="mt-4 pt-2">
              <TabContent className="ms-lg-4" activeTab={this.state.activeTab}>
                <TabPane className="show fade" tabId="1">
                  <img
                    src={apps}
                    className="img-fluid mx-auto rounded-md shadow-lg d-block"
                    alt=""
                  />
                </TabPane>

                <TabPane className="fade show" tabId="2">
                  <img
                    src={widgets2}
                    className="img-fluid mx-auto rounded-md shadow-lg d-block"
                    alt=""
                  />
                </TabPane>

                <TabPane className="show fade" tabId="3">
                  <img
                    src={task}
                    className="img-fluid mx-auto rounded-md shadow-lg d-block"
                    alt=""
                  />
                </TabPane>

                <TabPane className="tab-pane fade show" tabId="4">
                  <img
                    src={file}
                    className="img-fluid mx-auto rounded-md shadow-lg d-block"
                    alt=""
                  />
                </TabPane>
              </TabContent>
            </Col>{' '}
          </Row>{' '}
        </Container>
      </React.Fragment>
    );
  }
}
