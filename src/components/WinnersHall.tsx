import React, { useState } from "react";
import { Award, ShieldCheck, Truck, ExternalLink, MessageSquare, Copy, Check } from "lucide-react";

export interface PastCompetition {
  id: string;
  title: string;
  prizeName: string;
  prizeValue: number;
  winnerUsername: string;
  winningScore: number;
  dateEnded: string;
  statusText: string;
  deliveryStatus: "shipped" | "delivered" | "processing";
  courier: string;
  trackingNumber: string;
  reviewQuote: string;
  recipientLocation: string;
}

interface WinnersHallProps {
  pastComps: PastCompetition[];
}

export default function WinnersHall({ pastComps }: WinnersHallProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTracking = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getRelativeDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6" id="winners-hall-of-fame">
      {/* Intro Header banner */}
      <div className="border border-neutral-800 bg-neutral-900/40 p-6 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 bg-yellow-400 rounded-none animate-ping"></span>
            <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest">
              OFFICIAL BLOCK MUSEUM
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight font-display text-white">
            Vapor Hall of Champions
          </h2>
          <p className="text-neutral-400 text-xs mt-1 max-w-xl">
            Each physical shipment is secured on the blockchain and shipped fully insured worldwide via Express dispatch routes within 48 to 72 hours.
          </p>
        </div>

        <div className="flex gap-4 p-4 border border-yellow-500/20 bg-yellow-500/5 items-center">
          <ShieldCheck className="w-10 h-10 text-yellow-400 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-yellow-300 uppercase">100% SECURE VERIFIED</div>
            <div className="text-neutral-400 font-mono text-[10px] uppercase mt-0.5">
              All heights verified via CRT keyframe proof
            </div>
          </div>
        </div>
      </div>

      {pastComps.length === 0 ? (
        <div className="text-center p-12 border border-neutral-800 bg-neutral-950 text-neutral-500 font-mono text-xs uppercase">
          [Acquiring past manifest timelines...]
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="past_tourneys_grid">
          {pastComps.map((comp) => (
            <div
              key={comp.id}
              className="border border-neutral-800 bg-neutral-900/20 hover:border-neutral-700 transition-all flex flex-col justify-between"
              id={`past-card-${comp.id}`}
            >
              {/* Product top section */}
              <div className="p-5 border-b border-neutral-800/80">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <span className="text-[10px] font-mono font-bold bg-neutral-800 border border-neutral-700 text-neutral-400 px-2 py-0.5 uppercase">
                    ID: {comp.id}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-green-400 font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-none"></span>
                    Verified {comp.deliveryStatus}
                  </span>
                </div>

                <h3 className="text-md font-black uppercase leading-tight text-white mb-1.5">
                  {comp.title}
                </h3>
                <div className="flex justify-between items-baseline mb-3 font-mono">
                  <span className="text-[11px] text-neutral-400">Prize: {comp.prizeName}</span>
                  <span className="text-xs text-[#00f0ff] font-bold shrink-0">
                    Value: ${comp.prizeValue.toFixed(0)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-3 border border-neutral-800/40 font-mono text-xs mb-3">
                  <div>
                    <span className="block text-[8px] text-neutral-500 uppercase">CHAMPION</span>
                    <span className="text-[#ff007f] font-bold">@{comp.winnerUsername}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-neutral-500 uppercase">PEAK HEIGHT</span>
                    <span className="text-white font-bold">{comp.winningScore} blocks</span>
                  </div>
                </div>
              </div>

              {/* Transit tracking status */}
              <div className="p-4 bg-black/60 border-b border-neutral-800/60 font-mono text-xs">
                <div className="flex items-center gap-2 font-bold mb-2">
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[9px] text-neutral-400 uppercase tracking-widest">
                    CARRIER TRANSIT MANIFEST
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-[11px] text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Logistics Courier:</span>
                    <span>{comp.courier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Recipient Hub:</span>
                    <span>{comp.recipientLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Ended Epoch:</span>
                    <span>{getRelativeDate(comp.dateEnded)}</span>
                  </div>
                  {comp.trackingNumber && (
                    <div className="flex justify-between mt-1 items-center bg-neutral-900 border border-neutral-800 p-1.5">
                      <span className="text-neutral-500">Tracking Code:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#00f0ff] uppercase">{comp.trackingNumber}</span>
                        <button
                          onClick={() => handleCopyTracking(comp.trackingNumber, comp.id)}
                          className="text-neutral-400 hover:text-white transition-colors"
                          title="Copy shipping code"
                        >
                          {copiedId === comp.id ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Winner review quote */}
              {comp.reviewQuote && (
                <div className="p-4 bg-[#ff007f]/5 border-t border-neutral-800 flex gap-3 items-start">
                  <MessageSquare className="w-4 h-4 text-[#ff007f] shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed italic text-neutral-300">
                    &ldquo;{comp.reviewQuote}&rdquo;
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
