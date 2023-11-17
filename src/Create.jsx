import { useState } from 'react';
import { Row, Form, Button } from 'react-bootstrap';
import {uploadFileToIPFS, uploadFJSONToIPFS} from './upload';
import { ethers } from "ethers"

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  

  const handleFileUpload = async(e) =>  
  {
    e.preventDefault();
    const file = e.target.files[0];
    if(typeof file !== 'undefined')
    {
      try
      {
        const res = await uploadFileToIPFS(file);
        console.log("Response:", res);
        setImage(res.pinataURL);
        console.log("ImageURL:",image);
      } 
      catch (error) 
      {
        console.error('Error uploading file:', error);
      }
    }
  }

  const createNFT = async() =>{
    if(!image || !price || !name || !description) return
      try{
         const res = await uploadFJSONToIPFS(JSON.stringify({image, name, description, price}));
         console.log("Response:", res);
         mintThenList(res);
      }
      catch(error)
      {
        console.log("Error while minting NFT:",error);
      }
            
  }

  const mintThenList = async(result) => {
    const uri = await result.pinataURL;
    console.log("mintThenList URI", uri);
    //@dev mint your NFT
    const transaction = await nft.mint(uri);
    await transaction.wait();
    //@dev Get tokenID
    const tokenId = await nft.tokenID();
    //@dev approve marketplace to spend NFT
    await(await nft.setApprovalForAll(marketplace.address, true)).wait();
    //@dev List the NFT on Marketplace
    const listPrice = ethers.parseEther(price.toString());
    await(await marketplace.listMarketItem(nft.address, tokenId, listPrice)).wait();
  }



  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={handleFileUpload}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create