import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from './abi.json'; // Update this with the new contract ABI
import './App.css';

// Contract address
const contractAddress = '0x30979ac99E0D2beEfCA20edb4591B56caA9AbAb2'; // Deployed address

//Main Component
function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [origin, setOrigin] = useState('');
  const [materialComposition, setMaterialComposition] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newMaterialComposition, setNewMaterialComposition] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState(null);

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
    if (!productId || !newProductName || !newOrigin || !newMaterialComposition || !newStatus) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const tx = await contract.updateProduct(
        productId,
        newProductName,
        newOrigin,
        newMaterialComposition,
        newStatus,
        {
      
    gasLimit: 500000,
        }
      );
      await tx.wait();
      console.log('Product Updated');
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product: ' + error.message);
    }
const product = await contract.digitalProducts(productId);
if (product.currentStatus === 3) {  // DELIVERED
  alert('Cannot update a delivered product');
  return;
    
  };
}

  // Delete a product
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
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product: ' + error.message);
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
            <input
              type="text"
              placeholder="Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
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
            <input
              type="number"
              placeholder="New Status (0-3)"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />
            <button onClick={updateProduct}>Submit</button>
          </div>

          <div>
            <h2>Delete Product</h2>
            <input
              type="text"
              placeholder="Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
            <button onClick={deleteProduct}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
