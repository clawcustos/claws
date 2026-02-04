"use client";

import { AgentCard } from "./agent-card";

// Mock data - will be replaced with real data from contract
const mockAgents = [
  {
    address: "0x1234567890123456789012345678901234567890",
    xHandle: "aixbt_agent",
    supply: 47,
    price: 0.138,
    change24h: 12.5,
  },
  {
    address: "0x2345678901234567890123456789012345678901",
    xHandle: "luna_virtuals",
    supply: 32,
    price: 0.064,
    change24h: -3.2,
  },
  {
    address: "0x3456789012345678901234567890123456789012",
    xHandle: "truth_terminal",
    supply: 89,
    price: 0.495,
    change24h: 8.7,
  },
  {
    address: "0x4567890123456789012345678901234567890123",
    xHandle: "zerebro",
    supply: 23,
    price: 0.033,
    change24h: 24.1,
  },
];

export function AgentList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {mockAgents.map((agent) => (
        <AgentCard key={agent.address} agent={agent} />
      ))}
    </div>
  );
}
