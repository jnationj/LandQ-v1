'use client';

import { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useSendTransaction,
  useTransaction,
} from "wagmi";
import { parseEther } from "viem";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../TokenTransfer.module.css";

const TokenTransfer = () => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const { address } = useAccount();
  const chainId = useChainId();

  // Get the user's native currency balance
  const { data: balance } = useBalance({
    address: address,
  });

  const { sendTransaction, error: sendError } = useSendTransaction();

  const {
    isLoading: isTransactionPending,
    isSuccess: isTransactionSuccessful,
  } = useTransaction({
    hash: txHash as `0x${string}`,
  });

  useEffect(() => {
    if (isTransactionSuccessful) {
      const explorerUrl = `${
        chainId === 1114
          ? "https://scan.test2.btcs.network"
          : "https://scan.coredao.org/"
      }/tx/${txHash}`;

      toast.success(
        <div>
          Transaction successful!{" "}
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0000EE", textDecoration: "underline" }}
          >
            View on Explorer
          </a>
        </div>,
        {
          onClick: () => window.open(explorerUrl, "_blank"),
        }
      );
    }
  }, [isTransactionSuccessful, chainId, txHash]);

  const getFaucetLink = () => {
    if (chainId === 1114) {
      //Testnet2
      return "https://scan.test2.btcs.network/faucet";
    }
    return "";
  };

  const handleTransfer = () => {
    if (!sendTransaction || !recipientAddress || !amount) return;
    try {
      toast.info("Sending transaction...");
      sendTransaction(
        {
          to: recipientAddress as `0x${string}`,
          value: parseEther(amount),
        },
        {
          onSuccess: (hash) => {
            setTxHash(hash);
          },
        }
      );
    } catch (error) {
      console.error("Transfer failed:", error);
      toast.error("Transfer failed!");
    }
  };

  const insufficientBalance = Boolean(
    balance && amount && parseFloat(balance.formatted) < parseFloat(amount)
  );

  return (
    <div className={styles.tokenTransferContainer}>
      <h2 className={styles.title}>
        Transfer {chainId === 1114 ? "TCORE2" : "TCORE"}
      </h2>
      <div className={styles.balanceInfo}>
        Your Balance: {balance?.formatted} {balance?.symbol}
      </div>
      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <input
          type="number"
          placeholder={`Amount in ${chainId === 1114 ? "TCORE2" : "TCORE"}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={styles.input}
          step="0.000000000000000001"
          min="0"
        />
      </div>
      {insufficientBalance && (
        <div className={styles.errorMessage}>
          Insufficient balance. Get {chainId === 1114 ? "TCORE2" : "TCORE"} from
          the faucet:
          <a href={getFaucetLink()} target="_blank" rel="noopener noreferrer">
            {chainId === 1114 ? "TCORE2" : "TCORE"} Faucet
          </a>
        </div>
      )}
      {sendError && (
        <div className={styles.errorMessage}>Error: {sendError.message}</div>
      )}
      <button
        onClick={handleTransfer}
        disabled={
          chainId === 1116 ||
          !sendTransaction ||
          insufficientBalance ||
          isTransactionPending
        }
        className={styles.transferButton}
      >
        {chainId !== 1114
          ? "Connect to Core Testnet"
          : isTransactionPending
          ? "Sending..."
          : `Send ${chainId === 1114 ? "TCORE2" : "TCORE"}`}
      </button>
    </div>
  );
};

export default TokenTransfer;