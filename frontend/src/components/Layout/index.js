import React, { Component, Suspense } from "react";
import { withRouter } from "react-router-dom";
import ScrollUpButton from "react-scroll-up-button";
import FeatherIcon from "feather-icons-react";
// Layout Components
const Topbar = React.lazy(() => import("./Topbar"));
const Footer = React.lazy(() => import("./Footer"));

const CustomDot = () => {
  return (
    <React.Fragment>
      <FeatherIcon icon="arrow-up" className="icons" />
    </React.Fragment>
  );
};

const Loader = () => {
  return (
    <div id="preloader">
      <div id="status">
        <div className="spinner">
          <div className="double-bounce1"></div>
          <div className="double-bounce2"></div>
        </div>
      </div>
    </div>
  );
};
class Layout extends Component {

  render() {
    return (
      <React.Fragment>
        <Suspense fallback={Loader()}>
        <Topbar tagline={null} hasDarkTopBar={this.props.hasDarkTopBar} />

          {this.props.children}
          {(() => {
            return <Footer />;
          })()}

          {/* <div className="btn btn-icon btn-soft-primary back-to-top"> */}
          {/* scrollup button */}
          <ScrollUpButton
            ContainerClassName="classForContainer"
            style={{ height: 36, width: 36 }}
            TransitionClassName="classForTransition"
          >
            <CustomDot />
          </ScrollUpButton>
          {/* </div> */}

          {/* theme switcher 
          <ThemeSwitcher />
          */}
        </Suspense>
      </React.Fragment>
    );
  }
}

export default withRouter(Layout);
