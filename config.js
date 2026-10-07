const ACTIVE_NETWORK = "sepolia";

const CONTRACT_ADDRESS = "0x5f5fcd92381888357cfd85ed7ad4fae06dc6c7e3";

const BACKEND_URL = "http://127.0.0.1:5000";

const FLIGHT_INSURANCE_ABI = [
  "function policyCount() view returns (uint256)",

  "function buyPolicy(string _flightNumber, string _plan, uint256 _premium, uint256 _coverage, uint256 _delayThreshold) payable returns (uint256)",

  "function updateFlightDelay(uint256 _policyId, uint256 _actualDelay)",

  "function processPayout(uint256 _policyId)",

  "function getPolicy(uint256 _policyId) view returns (uint256 policyId, address customer, string flightNumber, string plan, uint256 premium, uint256 coverage, uint256 delayThreshold, uint256 actualDelay, bool active, bool eligible, bool paid)",

  "function policies(uint256) view returns (uint256 policyId, address customer, string flightNumber, string plan, uint256 premium, uint256 coverage, uint256 delayThreshold, uint256 actualDelay, bool active, bool eligible, bool paid)",

  "event PolicyCreated(uint256 indexed policyId, address indexed customer, string flightNumber, string plan, uint256 premium, uint256 coverage, uint256 delayThreshold)",

  "event FlightDelayUpdated(uint256 indexed policyId, uint256 actualDelay, bool eligible)",

  "event PayoutProcessed(uint256 indexed policyId, address indexed customer, uint256 amount)"
];

const NETWORKS = {
  sepolia: {
    name: "Ethereum Sepolia",
    chainId: 11155111,
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    explorer: "https://sepolia.etherscan.io",
    currency: "ETH",
  },

  baseSepolia: {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: "https://base-sepolia-rpc.publicnode.com",
    explorer: "https://sepolia.basescan.org",
    currency: "ETH",
  },

  polygonAmoy: {
    name: "Polygon Amoy",
    chainId: 80002,
    rpcUrl: "https://polygon-amoy-bor-rpc.publicnode.com",
    explorer: "https://amoy.polygonscan.com",
    currency: "POL",
  },

  arbitrumSepolia: {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    rpcUrl: "https://sepolia.arbiscan.io",
    currency: "ETH",
  },

  optimismSepolia: {
    name: "OP Sepolia",
    chainId: 11155420,
    rpcUrl: "https://optimism-sepolia.etherscan.io",
    currency: "ETH",
  },
};