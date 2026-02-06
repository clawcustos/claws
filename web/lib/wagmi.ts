import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Claws',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [base],
  ssr: true,
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL, {
      batch: {
        batchSize: 1024,
        wait: 50, // batch calls within 50ms window
      },
    }),
  },
});
