import {
  isConnected,
  getAddress,
  setAllowed,
  signMessage,
  signTransaction,
} from "@stellar/freighter-api"
import { StrKey } from "@stellar/stellar-sdk"

export const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet"

export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await isConnected()
    return result.isConnected
  } catch {
    return false
  }
}

export async function requestFreighterAccess(): Promise<
  { publicKey: string } | { error: string }
> {
  try {
    const accessResult = await setAllowed()
    if (accessResult.error) {
      return { error: String(accessResult.error) }
    }

    const addressResult = await getAddress()
    if (addressResult.error) {
      return { error: String(addressResult.error) }
    }

    // Forzamos que la UI de Freighter se abra para pedir confirmación al usuario
    const signResult = await signMessage("Authorize connection to PEVI")
    if (signResult.error) {
      return { error: "wallet.signatureRejected" }
    }

    return { publicKey: addressResult.address }
  } catch (e) {
    return { error: "wallet.connectionError" }
  }
}

export function isValidStellarAddress(address: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(address)
  } catch {
    return false
  }
}

export async function signAndSubmitTransaction(xdr: string): Promise<{ hash?: string; error?: string }> {
  try {
    const networkPassphrase = STELLAR_NETWORK === "mainnet"
      ? "Public Global Stellar Network ; September 2015"
      : "Test SDF Network ; September 2015"

    const signedResult = await signTransaction(xdr, { networkPassphrase })

    if (signedResult.error) {
      return { error: signedResult.error as string }
    }

    const horizonUrl = STELLAR_NETWORK === "mainnet"
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org"

    const body = new URLSearchParams()
    body.append("tx", signedResult.signedTxXdr)

    const res = await fetch(`${horizonUrl}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    })

    const data = await res.json()
    if (res.ok && data.hash) {
      return { hash: data.hash }
    }

    // Mejorar el reporte de errores de Stellar Horizon
    const resultCodes = data.extras?.result_codes
    const errorDetail = resultCodes
      ? `Codes: ${resultCodes.transaction}${resultCodes.operations ? ` [${resultCodes.operations.join(",")}]` : ""}`
      : data.detail || data.title

    return { error: `Network error: ${errorDetail}` }
  } catch (err: any) {
    return { error: `Execution error: ${err.message}` }
  }
}
