import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Button, Card } from 'react-bootstrap'
import axios from 'axios';

function Home({marketplace, nft})
{
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    let itemCount;
    const loadMarketplaceItems = async()=> 
    {
        try{
          itemCount = await marketplace.getItemCount();
          console.log("item count:", itemCount);
        }
        catch(error){
          console.log("Error loading item count:",error);
        }
        
        let Marketitems = [];

        for(let i = 1; i<= itemCount; i++){
            const item = await marketplace.items(i);   //@dev returns the struct "Item" from within the mapping.
            if(!item.sold){
                const URI = await nft.tokenURI(item.tokenID);
                //@dev using get request to fetch data from the URI.
                const response = await axios.get(URI,  {headers: {
                    'Accept': 'text/plain'
                  }})

                const metadata = JSON.parse(Object.keys(response.data)[0])

                const totalPrice = await marketplace.getprice(item.itemId);

                Marketitems.push({
                    totalPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                })
            }
        }
        setLoading(false);
        setItems(Marketitems);
    }

    const buyMarketItem = async (item) => {
        await (await marketplace.PurchaseItems(item.itemId, { value: item.totalPrice })).wait();
        loadMarketplaceItems();
    }

    useEffect(() => {
        loadMarketplaceItems();
    }, []);

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
        <h2>Loading.....</h2>
        </main>
    )

    return(
        <div className="flex justify-center">
        {items.length > 0 ?
          <div className="px-5 container">
            <Row xs={1} md={2} lg={4} className="g-4 py-5">
              {items.map((item, idx) => (
                <Col key={idx} className="overflow-hidden">
                  <Card>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Body color="secondary">
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>
                        {item.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <div className='d-grid'>
                        <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                          Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
          : (
            <main style={{ padding: "1rem 0" }}>
              <h2>No listed assets</h2>
            </main>
          )}
      </div>
    );
}

export default Home;