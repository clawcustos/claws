'use client';

import { useEnsName } from 'wagmi';
import { base } from 'viem/chains';
import type { Holder } from '@/hooks/useHolders';

interface HoldersTableProps {
  handle: string;
  holders: Holder[];
  isLoading: boolean;
}

// Individual row component to handle ENS resolution per holder
function HolderRow({ holder, rank }: { holder: Holder; rank: number }) {
  // Only resolve ENS for top 10 holders to save RPC calls
  const { data: ensName } = useEnsName({
    address: holder.address,
    chainId: 1, // Mainnet for ENS
    query: {
      enabled: rank <= 10, // Only resolve for top 10
    },
  });

  const truncatedAddress = `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`;
  const displayName = ensName || truncatedAddress;

  return (
    <tr className="holders-table-row">
      <td className="holders-table-cell holders-table-rank">#{rank}</td>
      <td className="holders-table-cell">
        <a
          href={`https://basescan.org/address/${holder.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="holders-table-link mono"
          title={holder.address}
        >
          {displayName}
        </a>
      </td>
      <td className="holders-table-cell holders-table-balance mono">
        {holder.balanceNumber.toLocaleString()}
      </td>
    </tr>
  );
}

export function HoldersTable({ handle, holders, isLoading }: HoldersTableProps) {
  if (isLoading) {
    return (
      <div className="holders-table-container">
        <h2 className="holders-table-heading">Holders</h2>
        <div className="holders-table-loading">
          <div className="holders-table-spinner" />
          <span>Loading holders...</span>
        </div>
      </div>
    );
  }

  if (holders.length === 0) {
    return (
      <div className="holders-table-container">
        <h2 className="holders-table-heading">Holders</h2>
        <div className="holders-table-empty">
          <p>No holders yet. Be the first to buy!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="holders-table-container">
      <h2 className="holders-table-heading">Holders</h2>
      <div className="holders-table-wrapper">
        <table className="holders-table">
          <thead>
            <tr className="holders-table-header-row">
              <th className="holders-table-header">Rank</th>
              <th className="holders-table-header">Holder</th>
              <th className="holders-table-header">Claws</th>
            </tr>
          </thead>
          <tbody>
            {holders.map((holder, index) => (
              <HolderRow
                key={holder.address}
                holder={holder}
                rank={index + 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
