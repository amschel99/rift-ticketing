import { ethers } from 'ethers';

export interface OnchainValidationParams {
  hash: string;
  expectedAmount: number; // in USDC
  chain: string; // e.g. 'BASE'
  asset: string; // e.g. 'USDC'
  recipientAddress: string; // event organizer wallet
}

export interface OnchainValidationResult {
  isValid: boolean;
  amountMatches: boolean;
  transactionAmount: number;
  expectedAmount: number;
  minedAt: Date | null;
  blockNumber: number | null;
  from: string;
  to: string;
  transactionHash: string;
  message?: string;
}

const RETRY_INTERVALS_MS = [2000, 4000, 6000]; // up to ~12s total

async function retryRpcCall<T>(fn: () => Promise<T | null>, retries = RETRY_INTERVALS_MS.length): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (err) {
      if (i === retries - 1) throw err;
    }
    if (i < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVALS_MS[i]));
    }
  }
  return null;
}

export async function validateOnchainUsdcPayment(
  params: OnchainValidationParams
): Promise<OnchainValidationResult> {
  const { hash, expectedAmount, chain, asset, recipientAddress } = params;

  console.log('[OnchainValidation] Starting validation', {
    hash,
    expectedAmount,
    chain,
    asset,
    recipientAddress,
  });

  // Only support BASE for now (matches your invoice default)
  if (chain !== 'BASE') {
    throw new Error(`Unsupported chain ${chain} for on-chain validation`);
  }

  const rpcEndpoint = process.env.BASE_RPC_ENDPOINT;
  if (!rpcEndpoint) {
    throw new Error('BASE_RPC_ENDPOINT is not configured');
  }
  if (!recipientAddress) {
    throw new Error('Recipient address is required for on-chain validation');
  }

  const provider = new ethers.JsonRpcProvider(rpcEndpoint);

  // Fetch transaction
  const tx = await retryRpcCall(() => provider.getTransaction(hash));
  if (!tx) {
    throw new Error(`Transaction ${hash} not found on ${chain}`);
  }

  // Fetch receipt
  const receipt = await retryRpcCall(() => provider.getTransactionReceipt(hash));
  if (!receipt) {
    throw new Error(`Receipt for transaction ${hash} not found (may still be pending)`);
  }

  const isMined = receipt.status === 1;
  if (!isMined) {
    return {
      isValid: false,
      amountMatches: false,
      transactionAmount: 0,
      expectedAmount,
      minedAt: null,
      blockNumber: receipt.blockNumber ?? null,
      from: tx.from,
      to: tx.to || '',
      transactionHash: hash,
      message: 'Transaction failed on-chain',
    };
  }

  // Get block timestamp
  const block = await provider.getBlock(receipt.blockNumber!);
  const minedAt = block ? new Date(Number(block.timestamp) * 1000) : null;

  // Decode ERC20 Transfer events to ADMIN_ADDRESS
  const transferSig = ethers.id('Transfer(address,address,uint256)');
  const tokenDecimals = 6; // USDC on Base

  const recipientLower = recipientAddress.toLowerCase();

  let transactionAmount = 0;

  console.log('[OnchainValidation] Scanning logs for Transfer events');

  const matchingLog = receipt.logs.find((log) => {
    if (!log.topics || log.topics.length < 3) return false;
    if (log.topics[0] !== transferSig) return false;
    const toAddress = ethers.getAddress('0x' + log.topics[2].slice(-40));
    const isRecipient = toAddress.toLowerCase() === recipientLower;

    console.log('[OnchainValidation] Transfer log', {
      toAddress,
      isRecipient,
      data: log.data,
    });

    return isRecipient;
  });

  if (!matchingLog) {
    console.error('[OnchainValidation] No matching Transfer event found for recipient', {
      recipientLower,
      logCount: receipt.logs.length,
    });
    throw new Error(`No ${asset} Transfer event found to recipient address in transaction ${hash}`);
  }

  const rawAmount = ethers.toBigInt(matchingLog.data);
  transactionAmount = Number(ethers.formatUnits(rawAmount, tokenDecimals));

  // Allow a small tolerance for rounding/conversion differences.
  // Consider valid if the on-chain amount is at least expectedAmount minus a tiny offset (e.g. 0.01 USDC).
  const tolerance = 0.01; // 1 cent tolerance
  const amountMatches = transactionAmount + tolerance >= expectedAmount;

  console.log('[OnchainValidation] Validation result', {
    hash,
    transactionAmount,
    expectedAmount,
    amountMatches,
    recipientAddress,
    from: tx.from,
    to: tx.to || '',
  });

  return {
    isValid: isMined && amountMatches,
    amountMatches,
    transactionAmount,
    expectedAmount,
    minedAt,
    blockNumber: receipt.blockNumber ?? null,
    from: tx.from,
    to: tx.to || '',
    transactionHash: hash,
    message: amountMatches
      ? 'On-chain payment validated successfully'
      : `Amount mismatch: expected ${expectedAmount} ${asset}, got ${transactionAmount} ${asset}`,
  };
}

