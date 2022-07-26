import React, { Component } from "react";
//Import Components
import Section from "./Section";
import About from "./About";
import FAQ from "./Faqs";
import TaskManager from "./TaskManager";
import HowBurningWorks from "./HowBurningWorks";
import {initGA, PageView} from "../../common/gaUtils";
class Index extends Component {
  componentDidMount() {
    document.body.classList = "";
    document.title = "NFT Liquidity Provider";
    window.addEventListener("scroll", this.scrollNavigation, true);
    initGA();
    PageView();
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
        <Section />
        <HowBurningWorks />
        <TaskManager />
        <section className="section">
          <About />

          <FAQ />
          {/* <Cta /> */}

        </section>
      </React.Fragment>
    );
  }
}

export default Index;
