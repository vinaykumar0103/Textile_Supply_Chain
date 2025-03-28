import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from './abi.json';
import './App.css';

const contractAddress = '0x21CFF3353F89Df64c848758d86Afb984001c9C01'; // Contract Address

//Main Component
function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [productId, setProductId] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [productName, setProductName] = useState('');
  const [origin, setOrigin] = useState('');
  const [materialComposition, setMaterialComposition] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newMaterialComposition, setNewMaterialComposition] = useState('');
  const [provider, setProvider] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [textileData, setTextileData] = useState([]);
  const [productIds, setProductIds] = useState([]);

  // Fetch textile data from API
  useEffect(() => {
    const fetchTextileData = async () => {
      try {
        const response = await fetch('https://api.myjson.online/v1/records/5f3ec479-5b28-47a2-9407-c8cd7abcf706');
        const result = await response.json();
        const data = result.data || []; 
        setTextileData(data);
        if (data.length === 0) {
          console.warn('API returned empty dataset. Please populate the API with textile data.');
        }
      } catch (error) {
        console.error('Error fetching textile data:', error);
        alert('Failed to load textile data from API.');
      }
    };
    fetchTextileData();
  }, []);

   // Fetch product IDs by owner
  useEffect(() => {
    const fetchProductIds = async () => {
      if (contract && account) {
        try {
          const ids = await contract.getProductIdsByOwner(account);
          setProductIds(ids.map(id => id.toString())); // Convert BigNumber to string
        } catch (error) {
          console.error('Error fetching product IDs:', error);
          alert('Failed to fetch product IDs: ' + error.message);
        }
      }
    };
    fetchProductIds();
  }, [contract, account]);

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);
        console.log('Connected to MetaMask:', account);

        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
        console.log('Contract initialized:', contractInstance);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        alert('Failed to connect wallet: ' + error.message);
      }
    } else {
      alert('MetaMask not detected! Please install MetaMask.');
    }
  };

  // Check existing MetaMask connection
  useEffect(() => {
    const checkMetaMaskConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          const signer = await provider.getSigner();
          const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
          setContract(contractInstance);
        }
      }
    };
    checkMetaMaskConnection();
  }, []);

  // Handle product selection
  const handleProductSelect = (e) => {
    const selected = e.target.value;
    setSelectedProduct(selected);
    if (selected) {
      const product = textileData.find(p => p.productName === selected);
      setProductName(product.productName);
      setOrigin(product.origin);
      setMaterialComposition(product.materialComposition);
    } else {
      setProductName('');
      setOrigin('');
      setMaterialComposition('');
    }
  };

  // Issue a new product
  const issueProduct = async () => {
    if (!contract || !account) {
      alert('Please connect your wallet.');
      return;
    }
    if (!productName || !origin || !materialComposition) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const tx = await contract.issueProduct(productName, origin, materialComposition);
      await tx.wait();
      console.log('Product Issued');
      alert('Product issued successfully!');
       const ids = await contract.getProductIdsByOwner(account);
      setProductIds(ids.map(id => id.toString()));
    } catch (error) {
      console.error('Error issuing product:', error);
      alert('Failed to issue product: ' + error.message);
    }
  };

  // Update product details
  const updateProduct = async () => {
    if (!contract || !account) {
      alert('Please connect your wallet.');
      return;
    }
    if (!productId || !newProductName || !newOrigin || !newMaterialComposition) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const tx = await contract.updateProduct(
        productId,
        newProductName,
        newOrigin,
        newMaterialComposition,
        { gasLimit: 500000 }
      );
      await tx.wait();
      console.log('Product Updated');
      alert('Product updated successfully!');
       const ids = await contract.getProductIdsByOwner(account);
      setProductIds(ids.map(id => id.toString()));
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product: ' + error.message);
    }
    const product = await contract.digitalProducts(productId);
    if (product.currentStatus === 3) {
      alert('Cannot update a delivered product');
      return;
    }
  };

  // Delete product
  const deleteProduct = async () => {
    if (!contract || !account) {
      alert('Please connect your wallet.');
      return;
    }
    if (!productId) {
      alert('Please enter the Product ID.');
      return;
    }
    try {
      const tx = await contract.deleteProduct(productId);
      await tx.wait();
      console.log('Product Deleted');
      alert('Product deleted successfully!');
       const ids = await contract.getProductIdsByOwner(account);
      setProductIds(ids.map(id => id.toString()));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product: ' + error.message);
    }
  };


   // Fetch product details by ID
  const getProductDetails = async () => {
    if (!contract || !account) {
      alert('Please connect your wallet.');
      return;
    }
    if (!productId) {
      alert('Please select a Product ID.');
      return;
    }
    try {
      const [productName, origin, materialComposition, productionDate, currentStatus] = await contract.getProduct(productId);
      setProductDetails({
        productName,
        origin,
        materialComposition,
        productionDate: productionDate.toString(),
        currentStatus: currentStatus.toString()
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      alert('Failed to fetch product details: ' + error.message);
    }
  };

   // JSX
  return (
    <div className="App">
      <h1>Textile Supply Chain</h1>
      {!account ? (
        <div>
          <button onClick={connectMetaMask}>Connect Wallet</button>
          <p>Please connect your wallet via MetaMask.</p>
        </div>
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          <div>
            <h2>Issue New Product</h2>
            <select value={selectedProduct} onChange={handleProductSelect}>
              <option value="">Select a product</option>
              {textileData.map((product, index) => (
                <option key={index} value={product.productName}>
                  {product.productName}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
            <input
              type="text"
              placeholder="Material Composition"
              value={materialComposition}
              onChange={(e) => setMaterialComposition(e.target.value)}
            />
            <button onClick={issueProduct}>Submit</button>
          </div>

          <div>
            <h2>Update Product</h2>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select Product ID</option>
              {productIds.map((id, index) => (
                <option key={index} value={id}>
                  {id}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="New Product Name"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
            />
            <input
              type="text"
              placeholder="New Origin"
              value={newOrigin}
              onChange={(e) => setNewOrigin(e.target.value)}
            />
            <input
              type="text"
              placeholder="New Material Composition"
              value={newMaterialComposition}
              onChange={(e) => setNewMaterialComposition(e.target.value)}
            />
            <button onClick={updateProduct}>Submit</button>
          </div>

          <div>
            <h2>Delete Product</h2>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select Product ID</option>
              {productIds.map((id, index) => (
                <option key={index} value={id}>
                  {id}
                </option>
              ))}
            </select>
            <button onClick={deleteProduct}>Submit</button>
          </div>

          <div>
            <h2>View Product Details</h2>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select Product ID</option>
              {productIds.map((id, index) => (
                <option key={index} value={id}>
                  {id}
                </option>
              ))}
            </select>
            <button onClick={getProductDetails}>Get Product</button>

            {productDetails && (
              <div>
                <p><strong>Name:</strong> {productDetails.productName}</p>
                <p><strong>Origin:</strong> {productDetails.origin}</p>
                <p><strong>Material Composition:</strong> {productDetails.materialComposition}</p>
                <p><strong>Production Date:</strong> {new Date(productDetails.productionDate * 1000).toLocaleString()}</p>
                <p><strong>Status:</strong> {['IN_PRODUCTION', 'QUALITY_CHECK', 'IN_TRANSIT', 'DELIVERED'][productDetails.currentStatus]}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;