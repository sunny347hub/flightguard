import { ethers } from "ethers";
import abi from "../contracts/FlightInsuranceABI.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID);

const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

function getEthereum() {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed. Please install MetaMask to continue."
    );
  }

  return window.ethereum;
}

export async function getProvider() {
  const ethereum = getEthereum();
  return new ethers.BrowserProvider(ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function connectWallet() {
  const ethereum = getEthereum();

  const accounts = await ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No wallet account was connected.");
  }

  await ensureSepolia();

  return accounts[0];
}

export async function ensureSepolia() {
  const ethereum = getEthereum();

  const currentChainId = await ethereum.request({
    method: "eth_chainId",
  });

  if (currentChainId.toLowerCase() === SEPOLIA_CHAIN_ID_HEX) {
    return true;
  }

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID_HEX,
            chainName: "Ethereum Sepolia",
            nativeCurrency: {
              name: "SepoliaETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });
    } else {
      throw new Error(
        "Please switch MetaMask to the Ethereum Sepolia test network."
      );
    }
  }

  return true;
}

export async function getContract(withSigner = false) {
  const provider = await getProvider();

  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  }

  return new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
}

export async function getPolicyCount() {
  const contract = await getContract();
  return contract.policyCount();
}

export async function getPolicy(policyId) {
  const contract = await getContract();
  return contract.getPolicy(policyId);
}

export async function buyPolicy({
  flightNumber,
  plan,
  premium,
  coverage,
  delayThreshold,
  value,
}) {
  await ensureSepolia();

  const contract = await getContract(true);

  const transaction = await contract.buyPolicy(
    flightNumber,
    plan,
    premium,
    coverage,
    delayThreshold,
    {
      value,
    }
  );

  return transaction;
}

export async function getTransactionReceipt(txHash) {
  const provider = await getProvider();
  return provider.getTransactionReceipt(txHash);
}

export function formatAddress(address) {
  if (!address) return "";

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEth(value) {
  if (value === undefined || value === null) return "0 ETH";

  return `${ethers.formatEther(value)} ETH`;
}

export function getChainId() {
  return CHAIN_ID;
}

export { CONTRACT_ADDRESS };