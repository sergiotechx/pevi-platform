"use client"

import { useRef, useState, useEffect } from "react"
import { Heart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { apiClient } from "@/lib/axios-client"
import { signAndSubmitTransaction } from "@/lib/stellar"

interface DonationModalProps {
  campaignId: string | number
  campaignName: string
  escrowId?: string
  onClose: () => void
}

export function DonationModal({ campaignId, campaignName, escrowId, onClose }: DonationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { user } = useAuth()
  const { t } = useTranslation()
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const handleClose = () => {
    dialogRef.current?.close()
    onClose()
  }

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0 || !user) return
    if (!user.walletAddress) {
      setError(t("wallet.notConnected") || "Por favor, conecta tu wallet en tu perfil antes de donar.")
      return
    }
    if (!escrowId) {
      setError(t("wallet.noEscrow") || "Esta campaña no posee una bóveda (escrow) activa en la red.")
      return
    }

    setLoading(true)
    setError("")
    try {
      const numericId = parseInt(String(campaignId).replace(/\D/g, ""))
      const res = await apiClient.post("/donations", {
        user_id: parseInt(user.id),
        campaign_id: numericId,
        amount: parseFloat(amount),
        escrow_id: escrowId,
        sender_public_key: user.walletAddress,
      })

      if (res.data?.raw_xdr) {
        setLoading(false)
        // Wait for signature
        const txRes = await signAndSubmitTransaction(res.data.raw_xdr)
        setLoading(true)
        if (txRes.error) {
          console.error("Transaction failed:", txRes.error)
          setError(txRes.error)
          setLoading(false)
          return
        }

        // Confirm with the API
        if (txRes.hash) {
          await apiClient.put(`/donations/${res.data.donation_id}`, {
            hash: txRes.hash
          })
        }
      } else {
        setError("No se pudo obtener el contrato de donación de la red.")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(handleClose, 2500)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box relative max-w-md">
        <button
          onClick={handleClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <Heart className="h-8 w-8 text-success" />
            </div>
            <p className="text-lg font-semibold text-base-content">
              {t("donation.thanks")}
            </p>
          </div>
        ) : (
          <>
            <h3 className="mb-1 font-heading text-lg font-bold text-base-content">
              {t("donation.title")}
            </h3>
            <p className="mb-5 text-sm text-base-content/60">{campaignName}</p>

            {error && (
              <div className="mb-4 rounded-md bg-error/10 p-3 text-sm text-error">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-base-content">
                {t("donation.amountLabel")}
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={t("donation.amountPlaceholder")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="modal-action mt-6">
              <Button variant="ghost" onClick={handleClose} disabled={loading}>
                {t("donation.cancel")}
              </Button>
              <Button
                onClick={handleDonate}
                disabled={loading || !amount || parseFloat(amount) <= 0}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm mr-2" />
                ) : (
                  <Heart className="mr-2 h-4 w-4" />
                )}
                {t("donation.button")}
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="modal-backdrop" onClick={handleClose} />
    </dialog>
  )
}
