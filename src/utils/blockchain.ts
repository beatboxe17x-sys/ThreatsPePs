// Free blockchain explorer using Blockchair API (no key needed)
// Supports: Bitcoin, Ethereum, Litecoin, Dogecoin

export type Chain = 'bitcoin' | 'ethereum' | 'litecoin' | 'dogecoin';

export const CHAIN_NAMES: Record<Chain, string> = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  litecoin: 'Litecoin',
  dogecoin: 'Dogecoin',
};

export const CHAIN_SYMBOLS: Record<Chain, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  litecoin: 'LTC',
  dogecoin: 'DOGE',
};

export const CHAIN_EXPLORERS: Record<Chain, string> = {
  bitcoin: 'https://blockchair.com/bitcoin/transaction',
  ethereum: 'https://blockchair.com/ethereum/transaction',
  litecoin: 'https://blockchair.com/litecoin/transaction',
  dogecoin: 'https://blockchair.com/dogecoin/transaction',
};

export interface TxInfo {
  hash: string;
  chain: Chain;
  chainName: string;
  symbol: string;
  blockId: number;
  confirmations: number;
  time: string;
  fee: number;
  feeUsd: number;
  amount: number;
  amountUsd: number;
  inputs: number;
  outputs: number;
  size: number;
  explorerUrl: string;
  status: 'confirmed' | 'pending' | 'unknown';
}

/**
 * Look up a transaction by hash on any supported chain.
 * Auto-detects chain if not specified by trying each chain.
 */
export async function lookupTransaction(
  hash: string,
  chain?: Chain
): Promise<TxInfo | null> {
  const cleanHash = hash.trim();
  if (!cleanHash) return null;

  const chainsToTry: Chain[] = chain
    ? [chain]
    : ['bitcoin', 'ethereum', 'litecoin', 'dogecoin'];

  for (const c of chainsToTry) {
    try {
      const res = await fetch(
        `https://api.blockchair.com/${c}/dashboards/transaction/${cleanHash}`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!res.ok) continue;

      const json = await res.json();
      if (!json.data || json.context?.code !== 200) continue;

      const tx = json.data[cleanHash]?.transaction;
      if (!tx) continue;

      const currentBlock = json.context?.state ?? 0;
      const blockId = tx.block_id ?? 0;
      const confirmations = blockId > 0 && currentBlock > 0 ? currentBlock - blockId + 1 : 0;

      return {
        hash: cleanHash,
        chain: c,
        chainName: CHAIN_NAMES[c],
        symbol: CHAIN_SYMBOLS[c],
        blockId,
        confirmations,
        time: tx.time ?? 'Unknown',
        fee: tx.fee ?? 0,
        feeUsd: tx.fee_usd ?? 0,
        amount: Math.abs(tx.balance ?? 0),
        amountUsd: Math.abs(tx.balance_usd ?? 0),
        inputs: tx.input_count ?? 0,
        outputs: tx.output_count ?? 0,
        size: tx.size ?? 0,
        explorerUrl: `${CHAIN_EXPLORERS[c]}/${cleanHash}`,
        status: blockId > 0 ? 'confirmed' : 'pending',
      };
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Get the latest block height for a chain (useful for confirmation count)
 */
export async function getLatestBlock(chain: Chain): Promise<number> {
  try {
    const res = await fetch(`https://api.blockchair.com/${chain}/stats`);
    const json = await res.json();
    return json.data?.blocks ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Auto-detect which chain a transaction hash likely belongs to
 * by checking length/prefix patterns
 */
export function guessChain(hash: string): Chain | null {
  const h = hash.trim();
  if (/^0x[a-fA-F0-9]{64}$/.test(h)) return 'ethereum';
  if (/^[a-fA-F0-9]{64}$/.test(h)) return 'bitcoin';
  return null;
}
