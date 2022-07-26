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

export default class HowBurningWorks extends Component {
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
                <h2 className="title mb-4">How burning works:</h2>
                <p className="text para-desc mb-0 mx-auto">
                 Burned NFT's go into the furnace wallet
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
                      <h5 className="title">Identify NFT to Burn</h5>
                      <p className="text tab-para mb-0">
                       ......
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
                      <h5 className="title">Approve NFT for transfer</h5>
                      <p className="text-muted tab-para mb-0">
                        .....
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
                      <h5 className="title">Execute Transfer</h5>
                      ......
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
                      <h5 className="title">We pay you in ETH</h5>
                      <p className="text-muted tab-para mb-0">
                        ......
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
