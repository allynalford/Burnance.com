import React, { Component } from "react";
import {Helmet} from "react-helmet";
import Section from "./Section";
import About from "./About";
import FAQ from "./Faqs";
import TaskManager from "./TaskManager";
import HowBurningWorks from "./HowBurningWorks";
import {initGA, PageView} from "../../common/gaUtils";
class Index extends Component {
  componentDidMount() {
    document.body.classList = "";
    document.title = "Burnance NFT and Coin Liquidity";
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
        <Helmet>
          <title>A website that provides liquidity for owners of worthless NFTs and ERC20 tokens</title>
          <meta property="og:title" content="A website that provides liquidity for owners of worthless NFTs and ERC20 tokens" />
          <meta name="keywords" content="taxes, crypto tokens, liquidity for owners, ERC20 tokens, NFT, NFT Liquidity, Liquidity,Ethereum, ETH, ERC-721, ERC-20, ERC-1155, burner, burn, burn rewards" />
          <meta name="description" content="Burn your Sh!t NFTs and get paid in (ETH) Ethereum" />
          <meta property="og:description" content="The one stop shop for those looking to unload their worthless NFTs and ERC20 tokens!" />
          <meta name="twitter:title" content="Takin Shots" />
        </Helmet>
        <Section />
      </React.Fragment>
    );
  }
}

export default Index;
