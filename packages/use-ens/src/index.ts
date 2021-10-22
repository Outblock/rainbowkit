import { useEffect, useState } from 'react'
import { getENS, ResolvedENS } from 'get-ens'
import type { BaseProvider as Provider } from '@ethersproject/providers'

export type UseENSOptions = {
  provider: Provider
  domain: string
  fetchOptions?: RequestInit
  contractAddress?: string
  cache?: boolean
}

/**
 * A React hook to fetch ENS records from a domain.
 * @param provider Ethers.js provider
 * @param domain ENS domain to fetch data from
 * @returns
 */
export const useENS = ({ provider, domain, fetchOptions, contractAddress, cache }: UseENSOptions): ResolvedENS => {
  const [data, set] = useState<ResolvedENS>({ address: null, owner: null, records: {}, domain: '' })

  useEffect(() => {
    const getENSFromProvider = () => {
      provider.getNetwork().then(({ chainId }) => {
        if (contractAddress || chainId === 1) {
          getENS(provider, contractAddress)(domain, fetchOptions).then((data) => {
            if (cache) localStorage.setItem(`use-ens-${domain}`, JSON.stringify(data))
            set(data)
          })
        }
      })
    }

    if (cache) {
      try {
        const cachedData = JSON.parse(localStorage.getItem(`use-ens-${domain}`))
        if (cachedData != null) set(cachedData)
        // eslint-disable-next-line no-empty
      } catch {
        getENSFromProvider()
      }
    } else if (provider && domain) {
      getENSFromProvider()
    }
  }, [cache, contractAddress, domain, fetchOptions])

  return data
}
