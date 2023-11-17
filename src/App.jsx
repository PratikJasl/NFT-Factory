import { useState,useEffect } from 'react';
import { useSDK } from '@metamask/sdk-react';
import { Route, Routes } from 'react-router-dom';
import { ethers } from 'ethers'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { Spinner } from 'react-bootstrap'
import marketplaceABI from './contractsData/Marketplace.json';
import nftABI from './contractsData/NFT.json';
import marketplaceAddress from './contractsData/Marketplace-address.json';
import nftAddress from './contractsData/NFT-address.json';
import Home from './Home';
import Create from './Create';
import ListedItems from './ListedItems';
import Purchases from './Purchases';
import Navigation from './Navbar';
function App() { 
  const [account, setAccount] = useState();
  const { sdk, connected, connecting, provider, chainId } = useSDK();
  const [loading, setloading] = useState(true);
  const [marketplace, setMarketplace] = useState({});
  const [nft, setNFT] = useState({});

  const ConnectMetaMask = async () => {
      const accounts = await sdk?.connect();
      setAccount(accounts?.[0]);
  
      const provider = new ethers.BrowserProvider(window.ethereum);

      const Web3signer = await provider.getSigner();

      loadContract(Web3signer); 
    
  };

  const loadContract = async(Web3signer) =>{
      const marketplace = new ethers.Contract(marketplaceAddress.address,marketplaceABI.abi,Web3signer);
      setMarketplace(marketplace);
      console.log("Market-place object:",marketplace);
      const nft = new ethers.Contract(nftAddress.address, nftABI.abi, Web3signer);
      setNFT(nft);
      console.log("NFT object:", nft);
      setloading(false); 
  }

  return (
      <div className='App'>
        <Navigation ConnectMetaMask = {ConnectMetaMask} account = {account}/>
        <div>
          {loading ? (
              <div className='spinner'>
                <Spinner animation="border" style={{ display: 'flex' }}></Spinner>
                <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
              </div>
          ):(
            <Routes>
                <Route path="/" element={<Home marketplace={marketplace} nft={nft} />} />
                <Route path="/Create" element={<Create marketplace={marketplace} nft={nft} />} />
                <Route path="/ListedItems" element={<ListedItems marketplace={marketplace} nft={nft} account={account} />} />
                <Route path="/Purchases" element={<Purchases marketplace={marketplace} nft={nft} account={account} />} />
            </Routes>
          )}
        </div>
      </div>
  )
}

export default App
