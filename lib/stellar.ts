import {
  isConnected,
  getAddress,
  setAllowed,
  signMessage,
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
