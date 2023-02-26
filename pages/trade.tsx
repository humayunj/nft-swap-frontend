/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import {
  erc721ABI,
  useAccount,
  useChainId,
  useConnect,
  useContractWrite,
  useEnsName,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { prepareWriteContract, writeContract } from "wagmi/actions";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ConnectKitButton } from "connectkit";
import { Network, Alchemy, Nft } from "alchemy-sdk";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useEffect, useState } from "react";
import { Combobox, Listbox, Menu } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useSocket } from "@/hooks/useSocket";
import { BigNumber } from "ethers/lib/ethers";
import { useRouter } from "next/router";
import { NFT_SWAP_ABI } from "@/utils/nft-swap.abi";
const NFT_CONTRACT = "0x812471e0506d522f88EB349EF634fe698691188F";
const SWAP_CONTRACT = "0x6bF7230C967098965F7Df7cB7Ebb60Ff8f0115fc";

const alchemy = new Alchemy({
  apiKey: "azRf7PUK8XFuVs9f6saZ0JIvoqLlnPbV", //
  network: Network.OPT_GOERLI,
});

export default function Home() {
  const socket = useSocket(
    async (swapped, data) => {
      console.log(data);
      const config = await prepareWriteContract({
        address: SWAP_CONTRACT,
        abi: NFT_SWAP_ABI,
        functionName: "performSwap",
        args: [
          data.xContractAddr,
          data.xAddr,
          data.xTokenId,
          data.yContractAddr,
          data.yAddr,
          data.yTokenId,
        ],
      });
      const tx = await writeContract(config);
      console.log("Calling swap");
      await tx.wait(1);
      swapped(data);
    },
    async (data) => {
      console.log("Recevied swapped");
      router.push("/swapped?session=" + router.query.session);
    }
  );
  const router = useRouter();
  const sessionId = router.query.session as string | undefined;

  const [approved, setApproved] = useState(false);

  const { address, isConnected } = useAccount({
    onConnect({ address, connector, isReconnected }) {
      socket.connect({
        address: address as string,
        sessionId: sessionId as string,
      });
    },
    onDisconnect: () => {
      console.log("Disconnected");

      socket.disconnect();
    },
  });

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const [selectedNft, setSelectedNft] = useState(-1);

  const nfts = useQuery(
    ["nfts"],
    async () =>
      await alchemy.nft.getNftsForOwner(address as string, { pageSize: 100 }),
    { enabled: isConnected && !!address }
  );

  const selectedNftData =
    selectedNft >= 0 && nfts.data
      ? nfts.data.ownedNfts[selectedNft]
      : undefined;

  const handleNFTSelected = (ind: number) => {
    const nft = nfts.data?.ownedNfts.at(ind);

    if (!nft) return;
    console.log("Sending update");

    socket.sendNFTUpdate({
      contractAddress: nft.contract.address,
      tokenId: nft.tokenId,
    });

    setSelectedNft(ind);
  };

  const handleSwapClick = () => {
    if (!selectedNftData) return;
    write?.();
  };
  const traderNftQuery = useQuery(
    [
      "trader-nft-" +
        socket.trader.nft.contractAddress +
        "-" +
        socket.trader.nft.tokenId,
    ],
    () => alchemy.nft.getNftsForContract(socket.trader.nft.contractAddress),
    {
      enabled:
        !!socket.trader.nft.contractAddress && !!socket.trader.nft.tokenId,
    }
  );

  const traderNft =
    socket.trader.nft.tokenId && traderNftQuery.data
      ? traderNftQuery.data.nfts.find(
          (f) => f.tokenId === socket.trader.nft.tokenId
        )
      : undefined;

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: selectedNftData?.contract.address as `0x${string}`,
    abi: erc721ABI,
    functionName: "approve",
    args: !!selectedNftData
      ? [SWAP_CONTRACT, BigNumber.from(selectedNftData?.tokenId)]
      : undefined,
    enabled: isConnected && !!selectedNftData && !!traderNft,
  });

  const network = useNetwork();

  const { data, isLoading, isSuccess, write, error, isError } =
    useContractWrite({
      ...config,
      onSuccess: async (tx) => {
        console.log("Waiting");
        await tx.wait(1);
        console.log("Done await");
        if (!selectedNftData) return;
        setApproved(true);
        socket.sendApproved({
          contractAddress: selectedNftData.contract.address,
          tokenId: selectedNftData.tokenId,
        });
      },
    });

  if (!sessionId) {
    if (typeof window !== "undefined") {
      router.replace("/");
    }
    return null;
  }

  if (!isConnected)
    return (
      <div className="flex flex-col w-screen min-h-screen items-center justify-center">
        <div className="flex flex-col p-4 items-center gap-4">
          <p className="text-xl font-semibold">
            Connect your wallet to continue
          </p>
          <ConnectKitButton showAvatar />
        </div>
      </div>
    );

  return (
    <div className="flex flex-col w-screen min-h-screen">
      <div className="flex w-full justify-end px-3 py-2 ">
        <ConnectKitButton showAvatar />
      </div>
      <div className="flex flex-col p-2 flex-1 items-center gap-20">
        <h1 className="text-3xl font-bold self-center">NFT Swap</h1>
        <div className="flex w-full  justify-center gap-5 max-w-[80vw]">
          <div className="flex gap-10 items-center flex-1 justify-end">
            <div className="flex flex-col gap-2 ">
              <label className="text-xl">Your NFT</label>

              {!nfts.data ? (
                <progress className="progress w-56" />
              ) : (
                <select
                  disabled={approved || isLoading}
                  value={selectedNft}
                  onChange={(e) => handleNFTSelected(Number(e.target.value))}
                  className="select 
                  select-bordered max-w-xs"
                >
                  {nfts.data.ownedNfts.map((nft, i) => (
                    <option value={i} key={i}>
                      {nft.contract.name} – {nft.title} #{nft.tokenId}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="w-[7em] h-[7em] bg-base-content rounded-md  relative ">
              {selectedNft >= 0 && (
                <img
                  alt="token thumbnail"
                  className="rounded-md w-full h-full "
                  src={
                    nfts.data?.ownedNfts.at(selectedNft)?.media[0]?.thumbnail
                  }
                />
              )}
            </div>
          </div>
          <div className="min-h-full self-stretch w-[1px] bg-base-content " />
          {!traderNft ? (
            <p className="text font-semibold flex-1 self-center">
              Trader is not connected
            </p>
          ) : (
            <div className="flex gap-10 items-center flex-1">
              <div className="w-[7em] h-[7em] bg-base-content rounded-md">
                <img
                  alt="token thumbnail"
                  className="rounded-md"
                  src={traderNft.media[0]?.thumbnail}
                />
              </div>

              {traderNft && (
                <div className="flex flex-col ">
                  <h2 className="text-2xl font-semibold">Trader NFT</h2>
                  <h3 className="text-lg font-medium">
                    {traderNft.contract.name}{" "}
                    {socket.trader.nft.approved && (
                      <span className="badge badge-success">Locked</span>
                    )}
                  </h3>
                  <p className="text-md">{traderNft.title}</p>
                  <p className="text-md">#{traderNft.tokenId}</p>
                  <a
                    className="text-xs font-mono"
                    href="#traderNft.contract.address"
                  >
                    {traderNft.contract.address}
                  </a>
                  <a
                    className="link text-xs font-mono"
                    href="#traderNft.contract.address"
                  >
                    {socket.trader?.address}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        {approved === false ? (
          <button
            className={`btn btn-accent gap-4 ${isLoading ? "loading" : ""}`}
            disabled={!write}
            onClick={handleSwapClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              fill="currentColor"
              className="bi bi-arrow-left-right w-4 h-4"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"
              />
            </svg>
            Swap
          </button>
        ) : (
          <button
            className="btn btn-accent gap-4"
            disabled={true}
            onClick={handleSwapClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-lock-fill  w-4 h-4"
              viewBox="0 0 16 16"
            >
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            </svg>
            Locked
          </button>
        )}
        <div className="flex flex-col gap-4 items-center">
          {(isError || isPrepareError) && (
            <p className="bg-error text-error-content p-1 px-2 mx-4 max-w-[50ch] rounded-md">
              {isError
                ? "Write " + error?.message
                : "" || prepareError?.message}
            </p>
          )}
          <p>{network.chain?.name}</p>

          <div className="flex gap-2 items-center text-base-content">
            {socket.isConnected ? (
              <span className="bg-accent-200  flex gap-2 items-center text-success">
                {/* <div className="badge badge-success badge-xs" /> */}
                Session {sessionId}
              </span>
            ) : (
              <>
                <div className="badge badge-error badge-xs" />
                Offline
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
