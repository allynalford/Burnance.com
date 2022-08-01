/* global BigInt */
// React Basic and Bootstrap
import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";

//Import Icons
import FeatherIcon from "feather-icons-react";



class PageError extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.test.bind(this);


  }

  test = async () =>{
    //console.log('NODE',process.env.RINKEBY_URL)
    const ethers = require("ethers");
    const CONTRACT_ADDRESS = "0x724bf64860F7284Bec4CC7dc9B31A3E1F97A26aD";
    const contractABI = require("../../assets/abi/Burnance.json");
    const { verifyMessage } = require('@ambire/signature-validator');
    const message = "Welcome to Burnance....";

    //await window.ethereum.request({method: 'eth_requestAccounts'});
  
    //Let's grab a provider for contract interactions
    

    await window.ethereum.request({method: 'eth_requestAccounts'});

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    let accounts = await provider.send("eth_requestAccounts", []);
    let account = accounts[0];
    console.log('account',account);

    const signer = provider.getSigner();

    console.log('signer',signer);

    // const tx = {
    //   to: '0x0000000000000000000000000000000000000000',
    //   value: ethers.utils.parseEther('0'),
    //   gasLimit: 50000,
    //   nonce: undefined,
    // };

    //await signer.sendTransaction(tx)

    const address = await signer.getAddress();

    console.log('Address',address);

    const signature = await signer.signMessage(message);
    console.log('signature',signature);

    const isValidSig = await verifyMessage({
	    signer: address,
	    message,
	    signature,
	    provider,
	});
	console.log('is the sig valid: ', isValidSig)

    // For Solidity, we need the expanded-format of a signature
    //let sig = ethers.utils.splitSignature(signature);

    // Call the verifyString function
    //let recovered = await contract.verifyString("Welcome to Burnance....", sig.v, sig.r, sig.s);

    //console.log(recovered);

    let contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

    const defaultPrice = await contract.defaultPrice();

    console.log('defaultPrice',BigInt(defaultPrice._hex).toString());

    const guaranteeFee = await contract.guaranteeFee();

    console.log('guaranteeFee',BigInt(guaranteeFee._hex).toString());

    const maxTokensPerTx = await contract.maxTokensPerTx();
    console.log('maxTokensPerTx',BigInt(maxTokensPerTx._hex).toString());

    const owner = await contract.owner();
    console.log('owner',owner);

    const transferedNFTs = await contract.transferedNFTs('0x09e0D0d2FBBdF81E411EAd4D0323C7879879EC65');
    console.log('transferedNFTs',transferedNFTs);
    console.log('transferedNFTs',transferedNFTs[0]);
    console.log('transferedNFTs',BigInt(transferedNFTs[1]._hex).toString());

    const furnance = await contract.furnance();
    console.log('furnance',furnance);


    //Grab the metadata use the contract to call the URL function with the tokenID
    //const batchTransfer = await contract.batchTransfer(['0x077E9BEb7ac6ef64EF255ebDed0dE4200749A2a2'], [48,49], [1,1]);
    //console.log(batchTransfer);

    //const guaranteeTransfer = await contract.guaranteeTransfer('0x077E9BEb7ac6ef64EF255ebDed0dE4200749A2a2', 47, 1);
    //console.log(guaranteeTransfer);
    

    //balance = await contract.getBalance("0x7C76C63DB86bfB5437f7426F4C37b15098Bb81da");
  
   // const furnance = await contract.furnance();
    //console.log(furnance);

    //const setFurnance = await contract.setFurnance('0x8211a5D8c117535e0c6D2dAD9D4Ba2c9c92664D5');
    //console.log(setFurnance);
  

    
    //const batchTransfer = await burnanceContract.batchTransfer([0x077E9BEb7ac6ef64EF255ebDed0dE4200749A2a2], [48,49], [1,1]);
    //await batchTransfer.wait();
    
    //console.log('Batch',batchTransfer);
  }


  render() {
    return (
      <React.Fragment>
        <div className="back-to-home rounded d-none d-sm-block">
          <Link to="/index" className="btn btn-icon btn-soft-primary">
            <i>
              <FeatherIcon icon="home" className="icons" />
            </i>
          </Link>
        </div>

        <section className="bg-home d-flex align-items-center">
          <Container>
            <Row className="justify-content-center">
              <Col lg={8} md={12} className="text-center">
                <div className="text-uppercase mt-4 display-3">Oh ! no</div>
                <div className="text-capitalize text-dark mb-4 error-page">
                  Page Not Found
                </div>
                <Link
                                    to="#"
                                    className="btn mouse-down"
                                    style={{
                                      marginRight: '10px',
                                      backgroundColor: '#ff914d',
                                      color: 'white',
                                    }}
                                    disabled={this.state.loading}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      this.test();
                                    }}
                                  >
                                    Run Test
                                  </Link>
              </Col>
            </Row>

          </Container>
        </section>
      </React.Fragment>
    );
  }
}
export default withRouter(PageError);
