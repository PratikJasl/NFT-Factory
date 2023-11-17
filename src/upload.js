import axios from 'axios';
import FormData from 'form-data';
const key = "840d3f87a4818d35d745";
const secretKey = "1dacb046e5070a1473cf327fb9c6c1b3821ada17098e921d24d35089709e3027";

export const uploadFileToIPFS = async(file) => {
    console.log(axios);
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    //making axios POST request to Pinata ⬇️
    
    let data = new FormData();
    data.append('file', file);

    const metadata = JSON.stringify({
        name: 'testname',
        keyvalues: {
            exampleKey: 'exampleValue'
        }
    });
    data.append('pinataMetadata', metadata);

    return axios 
        .post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: key,
                pinata_secret_api_key: secretKey,
                'Accept': 'text/plain'
            }
        })
        .then(function (response) {
            console.log("image uploaded", response.data.IpfsHash)
            return {
               success: true,
               pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }

    });
};

export const uploadFJSONToIPFS = async(JSONfile) =>{
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    return axios
    .post(url, JSONfile, {
        headers:{
            pinata_api_key: key,
            pinata_secret_api_key: secretKey,
            'Accept': 'text/plain'
        }
    })
    .then(function (response){
        console.log("JSON uploaded", response.data.IpfsHash);
        return {
            success: true,
            pinataURL: "https://gateway.pinata.cloud/ipfs/"+response.data.IpfsHash
        };
    })
    .catch(function(error){
        console.log(error);
        return {
            success: false,
            message: error.message,
        }
    });
}