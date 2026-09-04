// oxlint-disable
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, type Rec } from "./api";

function Badge({ level }: { level: string }) {
  const c = level === "CRITICAL" ? "risk-CRITICAL" : level === "HIGH" ? "risk-HIGH" : level === "MEDIUM" ? "risk-MEDIUM" : "risk-LOW";
  return <span className={`mono px-2 py-0.5 rounded border text-xs font-semibold ${c}`}>{level}</span>;
}
function Src({ s }: { s: string }) {
  const cl = s === "LIVE_MODEL" ? "src-LIVE_MODEL" : "src-DEMO_FALLBACK";
  return <span className={`mono text-[10px] px-2 py-0.5 rounded border ${cl}`}>{s.replace("_", " ")}</span>;
}
function Card({ children, className = "" }: { children: any; className?: string }) {
  return <div className={`card p-4 ${className}`}>{children}</div>;
}
const DEMO_STEPS = [
  { label: "1. Dashboard", path: "/" },
  { label: "2. Suspicious", action: "suspicious" },
  { label: "3. Investigate", action: "open_last" },
  { label: "4. SHAP", anchor: "shap" },
  { label: "5. Fraud ring", action: "fraud_ring" },
  { label: "6. Copilot", anchor: "copilot" },
  { label: "7. Privacy", path: "/privacy/U-00001" },
  { label: "8. Performance", path: "/performance" },
  { label: "9. Architecture", path: "/architecture" },
  { label: "10. Reset", action: "reset" },
];
export function Dashboard() {
  const [items, setItems] = useState<Rec[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const lastRef = useRef<string | null>(null);
  const nav = useNavigate();
  async function refresh() {
    try {
      const [l, m, h] = await Promise.all([api.list(), api.metrics(), api.health()]);
      const txs = (l as any).transactions ?? (l as any);
      setItems(txs);
      setMetrics(m);
      setHealth(h);
      if (txs.length) lastRef.current = txs[txs.length - 1]?.transaction?.transaction_id ?? txs[0]?.transaction?.transaction_id;
    } catch {}
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(async () => {
      const picks: (string | null)[] = ["normal", "normal", "normal", "suspicious", "ambiguous", null];
      const pick = picks[Math.floor(Math.random() * picks.length)];
      if (pick) await api.generate(pick); else await api.generate("normal");
      refresh();
    }, 1800);
    return () => clearInterval(id);
  }, [running]);
  const alerts = items.filter((r) => r.score.risk_score >= 0.6);
  const critical = items.filter((r) => r.score.risk_level === "CRITICAL");
  async function doDemoAction(a: string) {
    if (a === "suspicious") { const r: any = await api.generate("suspicious"); await refresh(); nav(`/investigate/${r.transaction.transaction_id}`); }
    else if (a === "fraud_ring") { const r: any = await api.generate("fraud_ring"); await refresh(); nav(`/investigate/${r.transaction.transaction_id}`); }
    else if (a === "open_last") { if (lastRef.current) nav(`/investigate/${lastRef.current}`); else { const r: any = await api.generate("suspicious"); nav(`/investigate/${r.transaction.transaction_id}`); } }
    else if (a === "reset") { await api.reset(); refresh(); nav("/"); }
  }

  // Manual UPI Simulation State
  const [upiSender, setUpiSender] = useState<string>("akram@oksbi");
  const [upiReceiver, setUpiReceiver] = useState<string>("chaiwala@paytm");
  const [upiAmount, setUpiAmount] = useState<number>(50);
  const [upiNote, setUpiNote] = useState<string>("Chai & snacks");
  const [upiProcessing, setUpiProcessing] = useState<boolean>(false);
  const [upiResult, setUpiResult] = useState<Rec | null>(null);

  async function handleUpiPayment(overrideAmount?: number) {
    const amt = overrideAmount !== undefined ? overrideAmount : Number(upiAmount);
    if (overrideAmount !== undefined) {
      setUpiAmount(overrideAmount);
    }
    if (!amt || amt <= 0) {
      alert("Please enter a valid UPI payment amount.");
      return;
    }
    setUpiProcessing(true);
    try {
      const isLarge = amt >= 100000;
      const isMicro = amt <= 500;
      const payload = {
        transaction_id: `UPI-${Date.now().toString().slice(-6)}`,
        user_id: upiSender,
        amount: amt,
        timestamp: new Date().toISOString(),
        merchant: upiReceiver,
        merchant_category: isMicro ? "everyday" : (isLarge ? "high_value_p2p" : "p2p"),
        device_id: "DEV-PHONE-AKRAM",
        location: isLarge ? "Home City (High-Value Transfer)" : "Home City",
        velocity: 1,
        usual_amount: 500.0,
      };

      const res: any = await api.score(payload);
      setUpiResult(res);
      await refresh();
    } catch (e: any) {
      alert("UPI Transaction failed: " + e.message);
    } finally {
      setUpiProcessing(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 backdrop-blur bg-[#0a0e14]/90 border-b border-[#1f2733]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-indigo-500" />
            <div>
              <div className="font-bold tracking-tight">FINSHEILD</div>
              <div className="text-[10px] opacity-60 mono">HYBRID FRAUD INTELLIGENCE • DEMO SIMULATION</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Src s={health ? (health.adapter === "real" ? "LIVE_MODEL" : "DEMO_FALLBACK") : "DEMO_FALLBACK"} />
            <span className="mono opacity-60">XGB {metrics?.xgboost ? `${metrics.xgboost.roc_auc.toFixed(3)} ROC • ${metrics.xgboost.pr_auc.toFixed(3)} PR` : "…"}</span>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <nav className="flex flex-wrap gap-2 text-xs mono">
          <Link className="border border-[#1f2733] px-3 py-1 rounded bg-[#11161f]" to="/">Command Center</Link>
          <Link className="border border-[#1f2733] px-3 py-1 rounded hover:bg-[#11161f]" to="/performance">Model Performance</Link>
          <Link className="border border-[#1f2733] px-3 py-1 rounded hover:bg-[#11161f]" to="/architecture">Architecture</Link>
          <Link className="border border-[#1f2733] px-3 py-1 rounded hover:bg-[#11161f]" to="/privacy/U-00001">Privacy</Link>
          <span className="ml-auto opacity-60 self-center">DEMO SIMULATION — not real banking data</span>
        </nav>
        <Card className="border-indigo-900/40">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-sm">DEMO MODE — 10-step judge flow</div>
            <span className="text-xs mono opacity-60">Step {demoStep + 1}/10</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {DEMO_STEPS.map((s, i) => (
              <button key={i} onClick={() => { setDemoStep(i); if (s.path) nav(s.path); else if (s.action) doDemoAction(s.action); }} className={`text-xs mono px-2.5 py-1 rounded border ${i===demoStep ? "bg-indigo-600 border-indigo-500 text-white" : "border-[#1f2733] hover:bg-[#11161f]"}`}>{s.label}</button>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            ["System", health?.status ?? "…", health?.status === "ok" ? "bg-emerald-500" : "bg-amber-500"],
            ["Model adapter", health?.adapter ?? "…", health?.adapter === "real" ? "bg-emerald-500" : "bg-amber-500"],
            ["Transactions", String(items.length), "bg-cyan-500"],
            ["High-risk alerts", String(alerts.length), alerts.length ? "bg-red-500" : "bg-[#1f2733]"],
            ["Critical", String(critical.length), critical.length ? "bg-[#ff2e63]" : "bg-[#1f2733]"],
          ].map(([k, v, dot]) => (
            <Card key={k} className="p-3">
              <div className="flex items-center gap-2 text-xs opacity-60"><span className={`w-2 h-2 rounded-full ${dot}`} />{k}</div>
              <div className="text-xl font-semibold mono mt-1">{v}</div>
            </Card>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <Card><div className="text-xs opacity-60">REAL BENCHMARK — XGB ROC-AUC</div><div className="text-2xl font-semibold mono">{metrics?.xgboost ? metrics.xgboost.roc_auc.toFixed(4) : "…"}</div><div className="text-xs opacity-60">from xgboost_metrics.json</div></Card>
          <Card><div className="text-xs opacity-60">REAL BENCHMARK — XGB PR-AUC</div><div className="text-2xl font-semibold mono">{metrics?.xgboost ? metrics.xgboost.pr_auc.toFixed(4) : "…"}</div><div className="text-xs opacity-60">0.17% fraud • 486× lift</div></Card>
          <Card><div className="text-xs opacity-60">Hard-overlap stress — XGB PR</div><div className="text-2xl font-semibold mono">0.373</div><div className="text-xs opacity-60">vs 0.959 easy — overlap works</div></Card>
        </div>
        {/* UPI Payment Simulator & Real-Time Fraud Interceptor */}
        <Card className="border-indigo-500/40 bg-gradient-to-br from-[#0a0f18] via-[#0d1424] to-[#121024] shadow-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1f2733] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                📱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    UPI Instant Payment Simulator
                  </h2>
                  <span className="text-[10px] mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                    FinShield Protected
                  </span>
                </div>
                <p className="text-xs opacity-70 mt-0.5 text-slate-300">
                  Test manual UPI transactions live. Everyday amounts (₹50 – ₹100) are automatically verified as safe, while high-value transfers (≥ ₹1 Lakh) are instantly flagged and blocked.
                </p>
              </div>
            </div>

            {/* Quick Test Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs opacity-60 mono">Quick Test:</span>
              <button
                onClick={() => handleUpiPayment(50)}
                className="text-xs mono px-3 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-all font-semibold flex items-center gap-1.5"
              >
                <span>☕ ₹50</span>
                <span className="text-[10px] opacity-75">(Pass)</span>
              </button>
              <button
                onClick={() => handleUpiPayment(100)}
                className="text-xs mono px-3 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-all font-semibold flex items-center gap-1.5"
              >
                <span>🍕 ₹100</span>
                <span className="text-[10px] opacity-75">(Pass)</span>
              </button>
              <button
                onClick={() => handleUpiPayment(100000)}
                className="text-xs mono px-3 py-1.5 rounded-lg border border-red-500/50 bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-all font-semibold flex items-center gap-1.5"
              >
                <span>🚨 ₹1,00,000</span>
                <span className="text-[10px] opacity-75">(1 Lakh - Flag)</span>
              </button>
              <button
                onClick={() => handleUpiPayment(250000)}
                className="text-xs mono px-3 py-1.5 rounded-lg border border-red-500/50 bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-all font-semibold flex items-center gap-1.5"
              >
                <span>🛑 ₹2,50,000</span>
                <span className="text-[10px] opacity-75">(Block)</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 mt-6">
            {/* Left: Manual UPI Form (6 cols) */}
            <div className="lg:col-span-6 space-y-4 bg-[#080c14] p-5 rounded-2xl border border-[#1f2733]">
              <div className="text-xs font-bold mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Enter Payment Details</span>
                <span className="text-cyan-400">NPCI / UPI 2.0</span>
              </div>

              <div>
                <label className="text-xs font-semibold mono opacity-80 block mb-1 text-slate-300">
                  From (Payer UPI ID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiSender}
                    onChange={(e) => setUpiSender(e.target.value)}
                    className="w-full bg-[#0d131f] border border-[#1f2733] focus:border-cyan-500 rounded-lg px-3 py-2 text-sm mono text-white outline-none"
                    placeholder="e.g. akram@oksbi"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] mono text-emerald-400">● Active</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mono opacity-80 block mb-1 text-slate-300">
                  To (Payee / Merchant UPI ID)
                </label>
                <input
                  type="text"
                  value={upiReceiver}
                  onChange={(e) => setUpiReceiver(e.target.value)}
                  className="w-full bg-[#0d131f] border border-[#1f2733] focus:border-cyan-500 rounded-lg px-3 py-2 text-sm mono text-white outline-none"
                  placeholder="e.g. merchant@paytm or receiver@ybl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold mono opacity-80 block mb-1 text-slate-300">
                  Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-lg font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(Number(e.target.value))}
                    className="w-full bg-[#0d131f] border border-[#1f2733] focus:border-cyan-500 rounded-lg pl-8 pr-3 py-2 text-lg font-bold mono text-white outline-none"
                    placeholder="50"
                  />
                </div>
                {/* Visual indicator of threshold */}
                <div className="mt-1.5 flex items-center justify-between text-[11px] mono">
                  <span className={upiAmount >= 100000 ? "text-red-400 font-bold" : (upiAmount <= 500 ? "text-emerald-400 font-bold" : "text-amber-400")}>
                    {upiAmount >= 100000 ? "🚨 High-Value Anomaly (Exceeds ₹1 Lakh)" : (upiAmount <= 500 ? "✅ Everyday Micro-Payment (Verified Safe)" : "⚠️ Moderate Amount")}
                  </span>
                  <span className="opacity-50">Threshold: ₹1,00,000</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mono opacity-80 block mb-1 text-slate-300">
                  Remarks / Note
                </label>
                <input
                  type="text"
                  value={upiNote}
                  onChange={(e) => setUpiNote(e.target.value)}
                  className="w-full bg-[#0d131f] border border-[#1f2733] focus:border-cyan-500 rounded-lg px-3 py-2 text-xs mono text-white outline-none"
                  placeholder="e.g. Chai, Groceries, Transfer"
                />
              </div>

              <button
                onClick={() => handleUpiPayment()}
                disabled={upiProcessing}
                className={`w-full py-3.5 rounded-xl font-bold mono text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  upiAmount >= 100000
                    ? "bg-gradient-to-r from-amber-600 via-red-600 to-rose-700 hover:opacity-90 text-white shadow-red-500/20"
                    : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-90 text-white shadow-emerald-500/20"
                }`}
              >
                {upiProcessing ? (
                  <span>⏳ Processing UPI Payment via FinShield...</span>
                ) : (
                  <span>⚡ Pay ₹{Number(upiAmount).toLocaleString("en-IN")} via UPI</span>
                )}
              </button>
            </div>

            {/* Right: Live Payment Verdict / Result Screen (6 cols) */}
            <div className="lg:col-span-6 bg-[#080c14] border border-[#1f2733] rounded-2xl p-6 flex flex-col justify-between">
              {upiResult ? (
                <div className="space-y-5">
                  {/* Status Banner */}
                  {upiResult.score.risk_score >= 0.7 ? (
                    <div className="p-4 rounded-xl border border-red-500/50 bg-red-950/40 text-red-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🚨</span>
                          <div>
                            <div className="font-bold text-sm tracking-wide text-red-300">
                              PAYMENT BLOCKED — FLAGGED AS NOT SAFE!
                            </div>
                            <div className="text-[11px] mono text-red-400/80">
                              FinShield Protection Intercepted High-Risk Fund Drain
                            </div>
                          </div>
                        </div>
                        <Badge level="CRITICAL" />
                      </div>
                      <div className="text-xs bg-red-900/30 p-2.5 rounded border border-red-500/30 text-red-200">
                        <strong>Alert:</strong> Transfer of ₹{Number(upiResult.transaction.amount).toLocaleString("en-IN")} to <span className="mono font-semibold">{String(upiResult.transaction.merchant)}</span> was halted.
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/40 text-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">✅</span>
                          <div>
                            <div className="font-bold text-sm tracking-wide text-emerald-300">
                              PAYMENT SUCCESSFUL & VERIFIED SAFE
                            </div>
                            <div className="text-[11px] mono text-emerald-400/80">
                              Passed FinShield 5-Signal Security Check
                            </div>
                          </div>
                        </div>
                        <Badge level="LOW" />
                      </div>
                      <div className="text-xs bg-emerald-900/30 p-2.5 rounded border border-emerald-500/30 text-emerald-200">
                        ₹{Number(upiResult.transaction.amount).toLocaleString("en-IN")} paid to <span className="mono font-semibold">{String(upiResult.transaction.merchant)}</span> safely.
                      </div>
                    </div>
                  )}

                  {/* Risk Score & Evidence */}
                  <div className="bg-[#0e1422] p-4 rounded-xl border border-[#1f2733] space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs mono opacity-70">FinShield Risk Score</span>
                      <span className={`text-2xl font-bold mono ${upiResult.score.risk_score >= 0.7 ? "text-red-400" : "text-emerald-400"}`}>
                        {(upiResult.score.risk_score * 100).toFixed(1)}
                        <span className="text-xs opacity-50 font-normal"> / 100</span>
                      </span>
                    </div>

                    <div className="w-full bg-[#182030] h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          upiResult.score.risk_score >= 0.7
                            ? "bg-red-500"
                            : upiResult.score.risk_score >= 0.3
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, upiResult.score.risk_score * 100))}%` }}
                      />
                    </div>

                    {/* Triggered Rules */}
                    {upiResult.score.rules.length > 0 && (
                      <div>
                        <span className="text-[10px] mono opacity-60 uppercase block mb-1">Triggered Security Rules:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {upiResult.score.rules.map((rule) => (
                            <span key={rule} className="text-[10px] mono px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-semibold">
                              ⚠️ {rule}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evidence Points */}
                    <div className="space-y-1 pt-1 border-t border-[#1f2733]/60">
                      <span className="text-[10px] mono opacity-60 uppercase block">Engine Security Analysis:</span>
                      <ul className="text-xs space-y-1 text-slate-300">
                        {upiResult.score.evidence.map((ev, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className={upiResult.score.risk_score >= 0.7 ? "text-red-400" : "text-emerald-400"}>•</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUpiResult(null)}
                      className="flex-1 py-2 px-3 rounded-lg text-center text-xs font-semibold mono bg-[#151c28] hover:bg-[#1f293b] text-slate-300 border border-[#1f2733] transition-all"
                    >
                      ↺ New Payment
                    </button>
                    <Link
                      to={`/investigate/${upiResult.transaction.transaction_id}`}
                      className="flex-1 py-2 px-3 rounded-lg text-center text-xs font-semibold mono bg-[#162030] hover:bg-cyan-900/40 text-cyan-300 border border-cyan-500/40 transition-all"
                    >
                      🔍 Forensic View →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-3xl shadow-inner">
                    📱
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Ready for UPI Payment</h3>
                    <p className="text-xs opacity-70 mt-1 max-w-xs text-slate-300">
                      Enter any amount on the left or use the <strong>Quick Test</strong> buttons above to see how FinShield automatically passes ₹50–₹100 micro-payments and blocks high-value transfers in Lakhs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">Live Transaction Stream — DEMO SIMULATION</div>
            <span className={`text-xs mono px-2 py-0.5 rounded border ${running ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-[#1f2733] text-white/60"}`}>{running ? "● LIVE" : "○ PAUSED"}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 text-xs mono">
            <button className={`border px-3 py-1.5 rounded ${running ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`} onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"} stream</button>
            <button className="border border-[#1f2733] px-3 py-1.5 rounded" onClick={async () => { await api.reset(); refresh(); }}>Reset</button>
            <button className="border border-[#1f2733] px-3 py-1.5 rounded" onClick={async () => { await api.generate("normal"); refresh(); }}>Generate Normal</button>
            <button className="border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 rounded" onClick={async () => { await api.generate("suspicious"); refresh(); }}>Generate Suspicious</button>
            <button className="border border-red-500/30 bg-red-500/10 px-3 py-1.5 rounded" onClick={async () => { await api.generate("fraud_ring"); refresh(); }}>Generate Fraud Ring</button>
            <button className="border border-[#1f2733] px-3 py-1.5 rounded" onClick={async () => { await api.generate("ambiguous"); refresh(); }}>Generate Subtle</button>
          </div>
          <p className="text-xs opacity-60 mt-2">Deterministic simulator — same seed → same sequence. Start → 1.8s interval.</p>
        </Card>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <div className="font-semibold text-sm mb-2">Alerts (risk ≥ 0.6) — {alerts.length} active</div>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {alerts.length === 0 ? <div className="text-sm opacity-60">No high-risk alerts — generate suspicious to demo.</div> : alerts.slice(0, 12).map((r) => (
                <Link key={r.transaction.transaction_id as string} to={`/investigate/${r.transaction.transaction_id}`} className="flex items-center justify-between border border-[#1f2733] rounded px-3 py-2 hover:bg-[#0f131a]">
                  <div><div className="mono text-sm font-semibold">{r.transaction.transaction_id as string} <Badge level={r.score.risk_level} /></div><div className="text-xs opacity-60">{r.transaction.merchant as string} • {r.transaction.location as string} • ₹{r.transaction.amount as number}</div></div>
                  <div className="text-right"><div className="mono text-sm">{r.score.risk_score.toFixed(3)}</div><div className="text-xs opacity-60"><Src s={r.score.source} /></div></div>
                </Link>
              ))}
            </div>
          </Card>
          <Card>
            <div className="font-semibold text-sm mb-2">Recent investigations</div>
            <div className="space-y-1.5 max-h-[420px] overflow-auto pr-1">
              {items.slice(0, 10).map((r) => (
                <Link key={r.transaction.transaction_id as string} to={`/investigate/${r.transaction.transaction_id}`} className="flex justify-between text-xs mono border border-[#1f2733] rounded px-2 py-1.5 hover:bg-[#0f131a]">
                  <span>{r.transaction.transaction_id as string}</span><Badge level={r.score.risk_level} />
                </Link>
              ))}
              {items.length === 0 && <div className="text-xs opacity-60">No transactions yet.</div>}
            </div>
          </Card>
        </div>
        <Card>
          <div className="font-semibold text-sm mb-2">Recent transactions — DEMO SIMULATION (last 20)</div>
          <div className="overflow-auto">
            <table className="w-full text-xs mono">
              <thead><tr className="text-left opacity-60"><th className="py-1">ID</th><th>Amount</th><th>Merchant</th><th>Location</th><th>Device</th><th>Risk</th><th>Score</th></tr></thead>
              <tbody>
                {items.slice(0, 20).map((r) => (
                  <tr key={r.transaction.transaction_id as string} className="border-t border-[#1f2733] hover:bg-[#0f131a]">
                    <td className="py-1"><Link className="underline" to={`/investigate/${r.transaction.transaction_id}`}>{r.transaction.transaction_id as string}</Link></td>
                    <td>₹{r.transaction.amount as number}</td>
                    <td>{r.transaction.merchant as string}</td>
                    <td className="opacity-70">{r.transaction.location as string}</td>
                    <td className="opacity-70">{String(r.transaction.device_id).slice(0, 12)}</td>
                    <td><Badge level={r.score.risk_level} /></td>
                    <td>{r.score.risk_score.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
export function Investigation() {
  const { id } = useParams();
  const nav = useNavigate();
  const [rec, setRec] = useState<Rec | null>(null);
  const [copilot, setCopilot] = useState<any>(null);
  const [graph, setGraph] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      if (!id) return;
      try { setRec(await api.get(id)); } catch { setRec(null); }
      try { setGraph(await api.graph(id)); } catch {}
    })();
  }, [id]);
  if (!rec) return <div className="p-6 max-w-6xl mx-auto">Loading… <button className="underline" onClick={() => nav("/")}>back</button></div>;
  const t = rec.transaction as Record<string, any>;
  const s = rec.score;
  const shapMax = Math.max(1, ...s.signals.map((x: any) => Math.abs(x.contribution)));
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <Link className="underline text-xs mono" to="/">← Command Center</Link>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold mono">{t.transaction_id}</h2><Badge level={s.risk_level} /><Src s={s.source} />
        <span className={`ml-auto mono text-xs px-2 py-1 rounded border ${s.risk_score >= 0.6 ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>Risk {s.risk_score.toFixed(3)}</span>
      </div>
      {s.risk_score >= 0.6 && (
        <div className="border border-red-500/30 bg-red-500/10 rounded p-3 flex items-center gap-3">
          <span className="text-xl">⚠</span>
          <div><div className="font-semibold text-sm text-red-300">Fraud Alert — {s.risk_level}</div><div className="text-xs opacity-80">Evidence-driven risk from XGBoost + behavioral + anomaly + rules + graph.</div></div>
        </div>
      )}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <div className="font-semibold text-sm mb-2">Transaction</div>
          <div className="space-y-1.5 text-xs mono">
            {[
              ["amount", `₹${t.amount}`], ["timestamp", String(t.timestamp).slice(0, 19).replace("T", " ")],
              ["merchant", t.merchant], ["category", t.merchant_category], ["location", t.location],
              ["device", String(t.device_id).slice(0, 18)], ["user", t.user_id], ["velocity", String(t.velocity)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[#1f2733] py-1"><span className="opacity-60">{k}</span><span>{v}</span></div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="font-semibold text-sm mb-2">Risk — from Risk Fusion</div>
          <div className="space-y-1.5 text-xs mono">
            {[
              ["fused risk", s.risk_score.toFixed(3)],
              ["xgb score", s.xgb_score != null ? s.xgb_score.toFixed(3) : "NOT AVAILABLE"],
              ["anomaly", s.anomaly_score.toFixed(3)],
              ["behavioral", s.behavioral_score.toFixed(3)],
              ["graph", s.graph_score != null ? s.graph_score.toFixed(3) : "NOT AVAILABLE"],
              ["rules", s.rules.join(", ") || "none"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[#1f2733] py-1"><span className="opacity-60">{k}</span><span>{String(v)}</span></div>
            ))}
            <div className="pt-2">
              <div className="text-xs font-semibold">Recommended action</div>
              <div className={`mt-1 mono text-xs px-2 py-1 rounded border inline-block ${s.risk_level === "CRITICAL" ? "bg-red-500 text-white border-red-600" : s.risk_level === "HIGH" ? "bg-amber-500 text-black border-amber-600" : "bg-emerald-500/15 border-emerald-500/30"}`}>
                {s.risk_level === "CRITICAL" ? "BLOCK" : s.risk_level === "HIGH" ? "INVESTIGATE / STEP-UP" : s.risk_level === "MEDIUM" ? "STEP-UP" : "APPROVE"}
              </div>
              <div className="text-xs opacity-60 mt-1">From risk engine — LLM only explains.</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="font-semibold text-sm mb-2">Evidence</div>
          <ul className="list-disc ml-5 text-xs mono space-y-1">
            {s.evidence.map((e: string) => <li key={e}>{e}</li>)}
          </ul>
          <div className="mt-3 text-xs opacity-60">Evidence from actual signals — <Src s={s.source} /></div>
        </Card>
      </div>
      <Card>
        <div id="shap" className="font-semibold text-sm mb-3">SHAP Explanation <span className="opacity-60 font-normal">actual contributions</span></div>
        {s.signals.length === 0 ? <div className="text-xs opacity-60">No SHAP data.</div> : (
          <div className="space-y-2">
            {s.signals.slice().sort((a: any, b: any) => Math.abs(b.contribution) - Math.abs(a.contribution)).map((sig: any) => (
              <div key={sig.name} className="flex items-center gap-2 text-xs mono">
                <span className="w-36 opacity-70">{sig.name}</span>
                <div className="flex-1 h-4 bg-[#0f131a] rounded overflow-hidden flex">
                  <div className="h-full flex items-center justify-end pr-1 text-[10px]" style={{ width: `${(Math.abs(sig.contribution) / shapMax) * 100}%`, background: sig.contribution >= 0 ? "#f85149" : "#3fb950" }}>{sig.contribution >= 0 ? "▲" : "▼"}</div>
                </div>
                <span className="w-16 text-right">{sig.contribution >= 0 ? "+" : ""}{sig.contribution.toFixed(3)}</span>
                <span className="w-20 text-right opacity-60">{sig.value}</span>
              </div>
            ))}
            <div className="flex gap-4 text-xs opacity-60 mono"><span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#f85149]" /> fraud</span><span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#3fb950]" /> legit</span></div>
          </div>
        )}
      </Card>
      <Card>
        <div className="font-semibold text-sm mb-2">Graph Intelligence — {graph?.kind === "DEMO_SIMULATION" ? "DEMO SIMULATION" : "LIVE"} <span className="opacity-60 font-normal">suspicious cluster</span></div>
        {graph ? (
          <div className="space-y-2">
            <div className="rounded border border-[#1f2733] bg-[#0f131a] p-3 mono text-xs">
              <svg viewBox="0 0 600 220" className="w-full h-[220px]">
                <defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3fb950" opacity={0.6} /></marker></defs>
                {(graph.nodes ?? []).map((n: any, i: number) => {
                  const x = 80 + (i % 3) * 200;
                  const y = 40 + Math.floor(i / 3) * 90;
                  const isSusp = String(n.id).includes("X") || String(n.id).includes("ring");
                  return <g key={n.id}><rect x={x - 50} y={y - 16} width={100} height={32} rx={8} fill={isSusp ? "#ff2e63" : "#1f2733"} stroke={isSusp ? "#ff2e63" : "#3fb950"} strokeWidth={isSusp ? 2 : 1} /><text x={x} y={y + 4} textAnchor="middle" fontSize={10} fill={isSusp ? "white" : "#e6edf3"}>{n.id}</text><text x={x} y={y + 14} textAnchor="middle" fontSize={8} fill={isSusp ? "white" : "#8b949e"}>{n.type}</text></g>;
                })}
                {(graph.edges ?? []).map((e: any, i: number) => {
                  const nodes: any[] = graph.nodes ?? [];
                  const a = nodes.find((n: any) => n.id === e.from);
                  const b = nodes.find((n: any) => n.id === e.to);
                  if (!a || !b) return null;
                  const ai = nodes.indexOf(a), bi = nodes.indexOf(b);
                  const ax = 80 + (ai % 3) * 200, ay = 40 + Math.floor(ai / 3) * 90;
                  const bx = 80 + (bi % 3) * 200, by = 40 + Math.floor(bi / 3) * 90;
                  return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke="#3fb950" strokeOpacity={0.5} strokeWidth={1.2} markerEnd="url(#arr)" />;
                })}
              </svg>
            </div>
            <div className="text-xs mono opacity-60">{graph.note ?? ""} • <Src s={graph.kind ?? "DEMO_SIMULATION"} /></div>
            <details className="text-xs mono"><summary className="underline cursor-pointer">Raw JSON</summary><pre className="mt-2 p-2 bg-[#0f131a] rounded overflow-auto">{JSON.stringify(graph, null, 2)}</pre></details>
          </div>
        ) : <div className="text-xs opacity-60">No graph data.</div>}
      </Card>
      <Card>
        <div id="copilot" className="font-semibold text-sm mb-2">Investigation Copilot — explains engine evidence only</div>
        <div className="text-xs opacity-60 mb-2">LLM receives structured evidence; never sets risk score.</div>
        <button className="border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 rounded text-xs mono" onClick={async () => {
          setLoading(true);
          try {
            const body = {
              transaction_amount: t.amount, usual_amount: 4200, new_device: String(t.device_id).includes("NEW") || String(t.device_id).includes("X"),
              location_distance_km: String(t.location).includes("400") ? 400 : String(t.location).includes("120") ? 120 : 10,
              recent_transaction_count: t.velocity, xgboost_score: s.xgb_score ?? s.risk_score, anomaly_score: s.anomaly_score,
              triggered_rules: s.rules, graph_signals: { shared_device_accounts: s.graph_score && s.graph_score > 0.5 ? 4 : 1 },
            };
            setCopilot(await api.explain(body));
          } finally { setLoading(false); }
        }}>{loading ? "Thinking…" : "Run copilot explanation"}</button>
        {copilot && (
          <div className="mt-3 border border-indigo-500/20 bg-indigo-500/5 rounded p-3 mono text-xs space-y-1">
            <div className="flex gap-2"><span className="opacity-60">Risk:</span><Badge level={copilot.risk_level} /></div>
            <div><span className="opacity-60">Fraud type:</span> {copilot.fraud_type}</div>
            <div className="opacity-80">{copilot.summary}</div>
            <ul className="list-disc ml-5">{(copilot.evidence ?? []).map((e: string) => <li key={e}>{e}</li>)}</ul>
            <div><span className="opacity-60">Action:</span> {copilot.recommended_action}</div>
            <div className="opacity-60"><Src s={copilot.source} /> • LLM explains, does not decide</div>
          </div>
        )}
      </Card>
    </div>
  );
}
export function Performance() {
  const [m, setM] = useState<any>(null);
  const [synth, setSynth] = useState<any>(null);
  useEffect(() => {
    api.metrics().then(setM).catch(() => {});
    api.metrics().then((d: any) => setSynth(d.synthetic_experiments ?? null)).catch(() => {});
  }, []);
  if (!m) return <div className="p-6">Loading…</div>;
  const row = (name: string, d: any) => (
    <tr className="border-t border-[#1f2733] mono text-xs">
      <td className="py-1.5">{name}</td><td>{d.roc_auc.toFixed(4)}</td><td>{d.pr_auc.toFixed(4)}</td>
      <td>{d.precision.toFixed(4)}</td><td>{d.recall.toFixed(4)}</td><td>{d.f1.toFixed(4)}</td>
    </tr>
  );
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link className="underline text-xs mono" to="/">← Command Center</Link>
      <h2 className="text-xl font-bold">Model Performance</h2>
      <Card>
        <div className="font-semibold text-sm">REAL ULB BENCHMARK — MEASURED <span className="mono text-xs opacity-60">284,807 rows • 492 fraud • 0.17%</span></div>
        <p className="text-xs opacity-60">Read from xgboost_metrics.json • Never mixed with synthetic.</p>
        <table className="w-full text-sm mt-3">
          <thead><tr className="text-left opacity-60 mono text-xs"><th>Model</th><th>ROC-AUC</th><th>PR-AUC</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead>
          <tbody>{row("Logistic Regression", m.logistic_regression)}{row("XGBoost (200 trees)", m.xgboost)}</tbody>
        </table>
        <div className="mono text-xs mt-3 p-2 bg-[#0f131a] rounded">XGBoost holdout @0.5 — TP {m.xgboost.confusion_matrix.tp} FN {m.xgboost.confusion_matrix.fn} FP {m.xgboost.confusion_matrix.fp} TN {m.xgboost.confusion_matrix.tn} • <Src s={m.kind} /></div>
      </Card>
      <Card>
        <div className="font-semibold text-sm">SYNTHETIC ROBUSTNESS — DEMO SIMULATION <span className="mono text-xs opacity-60">Not real banking data</span></div>
        <table className="w-full text-sm mt-3">
          <thead><tr className="text-left opacity-60 mono text-xs"><th>Dataset</th><th>Fraud rate</th><th>XGB PR-AUC</th><th>Note</th></tr></thead>
          <tbody className="mono text-xs">
            <tr className="border-t border-[#1f2733]"><td>Easy</td><td>11.5%</td><td>0.959</td><td>Too separable</td></tr>
            <tr className="border-t border-[#1f2733]"><td>1% Diluted</td><td>1.07%</td><td>0.553</td><td>Class-balanced stress</td></tr>
            <tr className="border-t border-[#1f2733] bg-amber-500/5"><td>Hard Overlap</td><td>1.10%</td><td>0.373</td><td>Feature-overlap stress — 33.9× lift</td></tr>
            <tr className="border-t border-[#1f2733] bg-emerald-500/5"><td>Real ULB</td><td>0.17%</td><td>{m.xgboost.pr_auc.toFixed(4)}</td><td>Real benchmark — 486× lift</td></tr>
          </tbody>
        </table>
        <div className="mt-3 border border-[#1f2733] rounded p-3 bg-[#0f131a] mono text-xs">
          <div className="font-semibold">Experiment story</div>
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {["Easy: separable", "→ 1% diluted: harder", "→ Hard overlap: realistic overlap", "→ Real ULB: true benchmark"].map((s, i) => (
              <span key={s} className={`px-2 py-1 rounded border ${i === 3 ? "bg-emerald-500/15 border-emerald-500/30" : "border-[#1f2733]"}`}>{s}</span>
            ))}
          </div>
          <div className="mt-2 opacity-70">PR should drop easy→diluted→hard as signals weaken. Hard PR 0.373 is intentionally harder than real ULB 0.84 to stress-test.</div>
        </div>
        {synth && Object.keys(synth).length > 0 && (
          <details className="mt-2 mono text-xs"><summary className="underline cursor-pointer">Raw synthetic metrics</summary><pre className="mt-2 p-2 bg-[#0f131a] rounded overflow-auto">{JSON.stringify(synth, null, 2)}</pre></details>
        )}
      </Card>
    </div>
  );
}
export function Architecture() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link className="underline text-xs mono" to="/">← Command Center</Link>
      <h2 className="text-xl font-bold">System Architecture</h2>
      <Card>
        <pre className="mono text-xs leading-5 overflow-x-auto">
{`                         TRANSACTION
                              │
                              ▼
                     FEATURE ENGINEERING
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
           XGBoost      Behavioral        Rules
              │              │               │
              └──────────────┼───────────────┘
                             ▼
                      ANOMALY DETECTION
                             │
                             ▼
                      GRAPH INTELLIGENCE
                             │
                             ▼
                        RISK FUSION
                             │
                             ▼
                       SHAP EVIDENCE
                             │
                             ▼
                  LLM INVESTIGATION COPILOT
                             │
                             ▼
                      INVESTIGATOR ACTION
                             │
                             ▼
                   PRIVACY IDENTITY LAYER`}
        </pre>
      </Card>
    </div>
  );
}
export function Privacy() {
  const { uid } = useParams();
  const [d, setD] = useState<any>(null);
  useEffect(() => { if (uid) api.identity(uid).then(setD).catch(() => {}); }, [uid]);
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <Link className="underline text-xs mono" to="/">← Command Center</Link>
      <h2 className="text-xl font-bold">Privacy-Preserving Identity Representation</h2>
      <div className="mono text-xs opacity-60">Prototype Identity Tokenization — NOT a zero-knowledge proof.</div>
      <Card>
        <div className="mono text-sm space-y-3">
          <div className="grid grid-cols-3 gap-2 border-b border-[#1f2733] pb-2"><span className="opacity-60">Field</span><span className="opacity-60">Raw</span><span className="opacity-60">Tokenized</span></div>
          {[
            ["User Token", d?.user_id ?? uid, d?.token ?? "a84f…91bc"],
            ["Phone", "••••••••42", d?.phone_masked ?? "••••••••42"],
            ["Identity Document", "TOKENIZED", d?.id_token ?? "tok_9f3a…"],
            ["Verification", "VERIFIED", d?.verification ?? "VERIFIED"],
          ].map(([k, raw, tok]) => (
            <div key={k} className="grid grid-cols-3 gap-2 border-b border-[#1f2733] py-2">
              <span className="opacity-60">{k}</span><span>{String(raw)}</span><span className="text-cyan-300">{String(tok)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 mono text-xs opacity-60">Raw → Salted Hash → Pseudonymous Token. {d?.method ?? "Prototype tokenization"}</div>
        <pre className="mt-3 p-2 bg-[#0f131a] rounded mono text-xs overflow-auto">{JSON.stringify(d, null, 2)}</pre>
      </Card>
    </div>
  );
}
