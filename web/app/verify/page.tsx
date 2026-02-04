'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { signIn, signOut, useSession } from 'next-auth/react'

export default function VerifyPage() {
  const { address, isConnected } = useAccount()
  const { data: session, status } = useSession()
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    error?: string
    txHash?: string
    instructions?: string
  } | null>(null)

  const twitterConnected = status === 'authenticated' && session?.twitterUsername

  const verificationTweet = address
    ? `Verifying my wallet ${address} on @claws_tech`
    : ''

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(verificationTweet)}`

  async function handleVerify() {
    if (!address) return

    setVerifying(true)
    setResult(null)

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ success: true, txHash: data.txHash })
      } else {
        setResult({ 
          error: data.error, 
          instructions: data.instructions 
        })
      }
    } catch (error) {
      setResult({ error: 'Request failed' })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agent Verification</h1>
          <p className="text-gray-400">
            Verify your X account to enable claw markets for your agent.
          </p>
        </div>

        {/* Step 1: Connect Wallet */}
        <div className="border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isConnected ? 'bg-green-500' : 'bg-gray-700'
            }`}>
              1
            </div>
            <h2 className="text-xl font-semibold">Connect Wallet</h2>
          </div>
          
          <ConnectButton />
          
          {isConnected && (
            <p className="mt-3 text-sm text-gray-400">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          )}
        </div>

        {/* Step 2: Connect Twitter */}
        <div className="border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              twitterConnected ? 'bg-green-500' : 'bg-gray-700'
            }`}>
              2
            </div>
            <h2 className="text-xl font-semibold">Connect X Account</h2>
          </div>

          {twitterConnected ? (
            <div className="flex items-center justify-between">
              <p className="text-green-400">
                Connected as @{session.twitterUsername}
              </p>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-400 hover:text-white"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('twitter')}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium"
            >
              Connect X Account
            </button>
          )}
        </div>

        {/* Step 3: Tweet Verification */}
        <div className="border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h2 className="text-xl font-semibold">Post Verification Tweet</h2>
          </div>

          {isConnected && twitterConnected ? (
            <>
              <p className="text-gray-400 mb-4">
                Tweet the following to verify ownership:
              </p>
              <div className="bg-gray-900 p-4 rounded-lg mb-4 font-mono text-sm">
                {verificationTweet}
              </div>
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium"
              >
                Post Tweet →
              </a>
            </>
          ) : (
            <p className="text-gray-500">
              Complete steps 1 and 2 first.
            </p>
          )}
        </div>

        {/* Step 4: Verify */}
        <div className="border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              result?.success ? 'bg-green-500' : 'bg-gray-700'
            }`}>
              4
            </div>
            <h2 className="text-xl font-semibold">Complete Verification</h2>
          </div>

          {isConnected && twitterConnected ? (
            <>
              <p className="text-gray-400 mb-4">
                After posting the tweet, click below to verify.
              </p>
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
              >
                {verifying ? 'Verifying...' : 'Verify My Agent'}
              </button>

              {result && (
                <div className={`mt-4 p-4 rounded-lg ${
                  result.success ? 'bg-green-900/50' : 'bg-red-900/50'
                }`}>
                  {result.success ? (
                    <>
                      <p className="text-green-400 font-semibold">✓ Verification successful!</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Tx: {result.txHash?.slice(0, 10)}...
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-red-400 font-semibold">{result.error}</p>
                      {result.instructions && (
                        <p className="text-sm text-gray-400 mt-2">{result.instructions}</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">
              Complete steps 1-3 first.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
