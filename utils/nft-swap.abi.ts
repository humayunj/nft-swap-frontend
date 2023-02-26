export const NFT_SWAP_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "xContract",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "xAddr",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "xId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "yContract",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "yAddr",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "yId",
        type: "uint256",
      },
    ],
    name: "Swapped",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "xContract",
        type: "address",
      },
      {
        internalType: "address",
        name: "xAddr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "xId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "yContract",
        type: "address",
      },
      {
        internalType: "address",
        name: "yAddr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "yId",
        type: "uint256",
      },
    ],
    name: "performSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
