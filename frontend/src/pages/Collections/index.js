import React, { Component } from "react";
import MostViewedProducts from "./MostViewedProducts";
import {initGA, PageView} from "../../common/gaUtils";

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethereumAddress: '',
      walletConnected: false,
      ethBalance: '',
    };

    this.accountsChanged.bind(this);
  }

  componentDidMount() {
    document.body.classList = '';
    window.addEventListener('scroll', this.scrollNavigation, true);

    initGA();
    PageView();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.accountsChanged);
      if (window.ethereum._state.isConnected && typeof window.ethereum._state.accounts[0] !== "undefined") {
        this.setState({
          ethereumAddress: window.ethereum._state.accounts[0],
          walletConnected: true,
        });
        //console.log('account', window.ethereum._state.accounts[0])
        //this.getEthBalance(window.ethereum._state.accounts[0]);
      }
    } 
  }

  // Make sure to remove the DOM listener when the component is unmounted.
  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollNavigation, true);
    //window.ethereum.off('disconnect', this.disconnect);
  
  }

 accountsChanged = () => {
  if (window.ethereum._state.isConnected && typeof window.ethereum._state.accounts[0] !== "undefined") {
    this.setState({
      ethereumAddress: window.ethereum._state.accounts[0],
      walletConnected: true,
    });
    //console.log('account', window.ethereum._state.accounts[0])
    //this.getEthBalance(window.ethereum._state.accounts[0]);
  }else if (typeof window.ethereum._state.accounts[0] === "undefined") {
    this.setState({walletConnected: false, ethereumAddress: ""})
  }
};



  scrollNavigation = () => {
    var doc = document.documentElement;
    var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    if (top > 80) {
      document.getElementById('topnav').classList.add('nav-sticky');
    } else {
      document.getElementById('topnav').classList.remove('nav-sticky');
    }
  };

  render() {
    return (
      <React.Fragment>
        {/* import Section 
        <Section />*/}

        {/* import Collection 
        <Collection />*/}

        <section className="section">
          <MostViewedProducts walletConnected={this.state.walletConnected} ethereumAddress={this.state.ethereumAddress} />

          {/* <TopCategories />

          <PopularProducts /> */}

          {/* <Cta /> */}

          {/* <RecentProducts /> */}
        </section>
      </React.Fragment>
    );
  }
}

export default Index;
