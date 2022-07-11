import React, { useEffect, useState } from 'react';
import { useNft } from "use-nft";

function Nft(props) {


    const { loading, error, nft } = useNft(
      '0xd07dc4262bcdbf85190c01c996b4c06a461d2430',
      '90473',
    );
  const [isloading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log(props);

    return () => {};
  }, []);

  // nft.loading is true during load.
  if (loading) return 'Loading…';

  // nft.error is an Error instance in case of error.
  if (error) return 'Error.';

  // You can now display the NFT metadata.
  return (
    <section>
      <h1>{nft.name}</h1>
      <img src={nft.image} alt="" />
      <p>{nft.description}</p>
    </section>
  );
}
