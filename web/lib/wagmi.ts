import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Claws",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [base, baseSepolia],
  ssr: true,
});

// Contract addresses
export const CLAWS_ADDRESS = {
  [base.id]: "0x0000000000000000000000000000000000000000" as `0x${string}`, // TBD
  [baseSepolia.id]: "0x0000000000000000000000000000000000000000" as `0x${string}`, // TBD
} as const;
