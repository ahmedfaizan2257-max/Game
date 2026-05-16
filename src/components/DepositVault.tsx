import React, { useState } from "react";
import { CreditCard, Wallet, Layers, ShieldCheck, AlertTriangle, Coins, RefreshCw } from "lucide-react";

export interface LedgerEntry {
  id: string;
  type: "deposit" | "purchase" | "reward";
  amount: number;
  balanceAfter: number;
  hash: string;
  timestamp: string;
  details: string;
}

interface DepositVaultProps {
  balance: number;
  ledger: LedgerEntry[];
  onDeposit: (amount: string, cardDetails: any) => Promise<boolean>;
}

export default function DepositVault({ balance, ledger, onDeposit }: DepositVaultProps) {
  const [topUpAmount, setTopUpAmount] = useState<string>("10.00");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    if (!cardNumber || cardNumber.replace(/\s+/g, "").length < 15) {
      setErrorText("Invalid card formats. Provide a standard 15-16 digit payment card number.");
      return;
    }
    if (!cardHolder.trim()) {
      setErrorText("Cardholder registered name is essential.");
      return;
    }
    if (!expiry || !expiry.includes("/")) {
      setErrorText("Expiry criteria must be in MM/YY sequence.");
      return;
    }
    if (!cvv || cvv.length < 3) {
      setErrorText("CVV credential code must be at least 3 digits long.");
      return;
    }

    setLoading(true);
    const success = await onDeposit(topUpAmount, {
      cardNumber,
      cardHolder,
      expiry,
      cvv
    });

    setLoading(false);
    if (success) {
      setSuccessText(`Secure replenishment successful! Charged $${parseFloat(topUpAmount).toFixed(2)} to vapor vault.`);
      setCardNumber("");
      setCardHolder("");
      setExpiry("");
      setCvv("");
    } else {
      setErrorText("Gateway rejected authentication. Verify payment limits and retry.");
    }
  };

  return (
    <div className="flex flex-col gap-6" id="deposit-vault-view">
      
      {/* Visual Balance and Card combo layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="vault_cards_combo">
        
        {/* Card deposit form (Col 7) */}
        <div className="md:col-span-7 border border-neutral-800 bg-neutral-900/10 p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
            <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-500" />
              Secured Checkout Gateway
            </h3>
            <span className="text-[9px] font-mono text-[#00f0ff] uppercase tracking-widest animate-pulse">
              ● SSL GRID CONFLICT SECURE
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 font-mono text-xs">
            <div>
              <label className="block text-[9px] uppercase font-bold text-neutral-500 mb-1">
                AQUIRE PLATINUM CREDIT AMOUNT
              </label>
              <div className="grid grid-cols-4 gap-1.5" id="replenish-selector">
                {["5.00", "10.00", "25.00", "50.00"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setTopUpAmount(lvl);
                      setErrorText("");
                      setSuccessText("");
                    }}
                    className={`py-2 text-center transition-colors font-mono font-black border ${
                      topUpAmount === lvl
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border-transparent"
                    }`}
                  >
                    ${lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">
                16-Digit Card Number
              </label>
              <input
                type="text"
                placeholder="4000 1234 5678 9010"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-black border border-neutral-800 p-2 text-white placeholder-neutral-600 font-mono text-xs focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">
                Cardholder Registered Name
              </label>
              <input
                type="text"
                placeholder="F. AHMED"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full bg-black border border-neutral-800 p-2 text-white placeholder-neutral-600 uppercase font-mono text-xs focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  placeholder="12/28"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white placeholder-neutral-600 font-mono text-xs focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">
                  CVV Code
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="***"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white placeholder-neutral-600 font-mono text-xs focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {errorText && (
              <div className="p-2 border border-red-500/30 bg-red-500/10 text-red-500 flex items-center gap-1.5" id="form-error">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                <span>{errorText}</span>
              </div>
            )}

            {successText && (
              <div className="p-2 border border-green-500/30 bg-green-500/10 text-green-400" id="form-success">
                <span>{successText}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 font-black text-xs uppercase tracking-wider transition-colors mt-2 text-black ${
                loading
                  ? "bg-neutral-800 text-neutral-500"
                  : "bg-white hover:bg-[#00f0ff] hover:text-black"
              }`}
              id="topup-deposit-gateway-btn"
            >
              {loading ? "AUTHORIZING VAULT TRANSACTION..." : `Secured Top-Up Deposit ($${parseFloat(topUpAmount).toFixed(2)})`}
            </button>
          </form>
        </div>

        {/* Dynamic Balance Credit card display (Col 5) */}
        <div className="md:col-span-5 flex flex-col justify-between p-5 border border-neutral-800 bg-neutral-950 relative overflow-hidden">
          {/* Neon grid decorative background */}
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-radial-gradient from-blue-600/10 to-transparent pointer-events-none opacity-40"></div>

          <div className="flex justify-between items-start z-10">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-[#00f0ff] tracking-widest uppercase mb-1">
                VAULT SYSTEM ID
              </span>
              <span className="font-mono text-neutral-300 text-xs">VAPOR-ACC-991204</span>
            </div>
            <Coins className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>

          <div className="my-8 z-10">
            <span className="block text-[9px] font-bold uppercase text-neutral-500 tracking-widest">
              COMMITTED CREDITS BALANCE
            </span>
            <div className="text-3xl md:text-4xl font-extrabold text-white mt-1 font-mono tracking-tight" id="visual-wallet-total-bal">
              ${balance.toFixed(2)}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 font-mono text-[9px] text-neutral-400 flex justify-between items-center z-10">
            <span>PLATINUM SEED GATEWAY ROUTE</span>
            <span className="text-yellow-400 font-bold uppercase">SECURED</span>
          </div>
        </div>

      </div>

      {/* Ledger sheet Audit log */}
      <div className="border border-neutral-800 bg-neutral-900/20" id="ledger_audit_block">
        <div className="px-5 py-4 border-b border-neutral-800/80 flex justify-between items-end">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Immutable Account Ledger Stream
            </h3>
            <p className="text-[9px] font-mono text-neutral-500 mt-0.5">
              Secure ledger containing credit allocations, gamepass submissions and rewards audit.
            </p>
          </div>
          <span className="text-[10px] text-blue-500 font-mono font-bold leading-none align-middle block">
            [CRC Checked]
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 uppercase text-[9px] text-neutral-400 bg-neutral-950 select-none">
                <th className="px-5 py-2.5">TX ID / Hash</th>
                <th className="px-5 py-2.5">Type</th>
                <th className="px-5 py-2.5">Mutation</th>
                <th className="px-5 py-2.5">End Credits</th>
                <th className="px-5 py-2.5">Timestamp</th>
                <th className="px-5 py-2.5">Transaction Remarks</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-neutral-800/25 border-b border-neutral-800/50"
                  id={`ledger-txrow-${entry.id}`}
                >
                  <td className="px-5 py-3">
                    <span className="font-bold text-neutral-300 block">{entry.id}</span>
                    <span className="text-[9px] text-neutral-500 block uppercase tracking-tighter mt-0.5 font-mono">
                      {entry.hash}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-1.5 py-0.5 text-[8px] font-bold uppercase ${
                      entry.type === "deposit"
                        ? "bg-green-500/10 border border-green-500/30 text-green-400"
                        : entry.type === "purchase"
                        ? "bg-blue-600/10 border border-blue-500/30 text-blue-400"
                        : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className={`px-5 py-3 font-bold ${
                    entry.type === "deposit" ? "text-green-400" : "text-blue-400"
                  }`}>
                    {entry.type === "deposit" ? "+" : "-"}${entry.amount.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-neutral-300">${entry.balanceAfter.toFixed(2)}</td>
                  <td className="px-5 py-3 text-neutral-500 text-[10px]">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-5 py-3 text-neutral-400 truncate max-w-[180px]" title={entry.details}>
                    {entry.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ledger.length === 0 && (
            <div className="text-center py-6 text-neutral-600 uppercase text-[10px] font-mono">
              Account telemetry initialized. Awaiting transactions input ledger logs.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
