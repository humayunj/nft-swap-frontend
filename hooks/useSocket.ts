import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ISession } from "./useAPI";

const WS_URI = process.env.NEXT_PUBLIC_WS_URI as string;

export function useSocket(
  processSwap: (swapped: (data: ISession) => void, data: ISession) => void,
  onSwapped: (data: ISession) => void
) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [trader, setTrader] = useState({
    address: "",
    nft: { contractAddress: "", tokenId: "", approved: false },
  });
  const connect = ({
    address,
    sessionId,
  }: {
    address: string;
    sessionId: string;
  }) => {
    if (socket?.active) disconnect();

    let s = io(WS_URI, {
      extraHeaders: { "x-session-id": sessionId, "x-address": address },
    });
    s.on("connect", () => {
      console.log("connected");
      setSocket(s);
    });
    s.on("disconnect", () => {
      setSocket(null);
    });
    s.on("participants", ({ addresses }) => {
      console.log("Already connected sockets: ", addresses);
      setTrader({
        address: addresses[0],
        nft: { contractAddress: "", tokenId: "", approved: false },
      });
    });
    s?.on("swapped", (data) => {
      onSwapped(data);
      console.log("RCV Swapped");
    });
    s.on("new-participant", ({ address }) => {
      console.log("New participant: ", address);
      setTrader({
        address: address,
        nft: { contractAddress: "", tokenId: "", approved: false },
      });
    });
    s.on(
      "target-nft-approved",
      ({
        contractAddress,
        tokenId,
      }: {
        contractAddress: string;
        tokenId: string;
      }) => {
        setTrader((t) => ({
          address: t.address,
          nft: { contractAddress, tokenId, approved: true },
        }));
      }
    );
    s.on("process-swap", (data) => {
      processSwap((data) => {
        s.emit("swapped", data);
      }, data);
    });
    s.on(
      "target-nft-selected",
      ({
        contractAddress,
        tokenId,
      }: {
        contractAddress: string;
        tokenId: string;
      }) => {
        console.log("Target nft selected:", contractAddress, tokenId);
        setTrader((t) => ({
          address: t.address,
          nft: { contractAddress, tokenId, approved: false },
        }));
      }
    );
  };

  const sendNFTUpdate = ({
    contractAddress,
    tokenId,
  }: {
    contractAddress: string;
    tokenId: string;
  }) => {
    socket?.emit("nft-selected", { contractAddress, tokenId });
  };
  const sendApproved = ({
    contractAddress,
    tokenId,
  }: {
    contractAddress: string;
    tokenId: string;
  }) => {
    socket?.emit("nft-approved", { contractAddress, tokenId });
  };

  const disconnect = () => {
    socket?.disconnect();
  };

  const swapped = (data: ISession) => {
    console.log("Emiting swapped ", socket);

    socket?.emit("swapped", data);
  };

  //   useEffect(() => {
  //     if (!socket) return;
  //     return () => {
  //       if (socket.connected) socket.disconnect();
  //     };
  //   }, [socket]);

  return {
    isConnected: socket?.connected,
    rawSocket: socket,
    connect,
    disconnect,
    sendNFTUpdate,
    trader,
    sendApproved,
    swapped,
  };
}
