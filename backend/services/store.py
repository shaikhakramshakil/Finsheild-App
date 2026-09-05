"""In-memory demo store + deterministic scenario generator."""
from __future__ import annotations

import hashlib
import itertools
import random
from datetime import datetime, timezone

from ..schemas import Transaction

_counter = itertools.count(10042)
_store: dict[str, dict] = {}


def _uid(prefix: str, n: int) -> str:
    return f"{prefix}-{n:05d}"


SCENARIOS = ("normal", "suspicious", "fraud_ring", "ambiguous")


def make_transaction(scenario: str = "normal", seed: int | None = None) -> tuple[Transaction, dict]:
    rng = random.Random(seed if seed is not None else int(next(_counter)))
    i = next(_counter)
    txn_id = f"TXN-{i}"
    if scenario == "suspicious":
        txn = Transaction(
            transaction_id=txn_id, user_id=_uid("U", rng.randint(1, 500)),
            amount=50000.0, timestamp=datetime.now(timezone.utc).isoformat(),
            merchant="High-Value Electronics", merchant_category="electronics",
            device_id="DEV-NEW-" + str(rng.randint(100, 999)), location="400km from home",
            velocity=8,
        )
        ctx = {"scenario": "suspicious", "amount_deviation": 4.2, "recent_transaction_count": 8}
    elif scenario == "fraud_ring":
        dev = "DEV-X-SHARED"
        txn = Transaction(
            transaction_id=txn_id, user_id=_uid("U", rng.randint(1, 50)),
            amount=float(rng.choice([9200, 14500, 22100])), timestamp=datetime.now(timezone.utc).isoformat(),
            merchant="Common Merchant M-7", merchant_category="retail",
            device_id=dev, location="Same city", velocity=5,
        )
        ctx = {"scenario": "fraud_ring", "amount_deviation": 2.1, "recent_transaction_count": 5,
               "shared_device_accounts": 4}
    elif scenario == "ambiguous":
        txn = Transaction(
            transaction_id=txn_id, user_id=_uid("U", rng.randint(1, 500)),
            amount=9800.0, timestamp=datetime.now(timezone.utc).isoformat(),
            merchant="Online Marketplace", merchant_category="ecommerce",
            device_id="DEV-KNOWN-" + str(rng.randint(10, 99)), location="120km away",
            velocity=4,
        )
        ctx = {"scenario": "ambiguous", "amount_deviation": 1.6, "recent_transaction_count": 4}
    else:
        txn = Transaction(
            transaction_id=txn_id, user_id=_uid("U", rng.randint(1, 2000)),
            amount=float(rng.choice([1200, 2500, 4200, 3100])), timestamp=datetime.now(timezone.utc).isoformat(),
            merchant=rng.choice(["Grocery Store", "Fuel Station", "Pharmacy", "Cafe"]),
            merchant_category="everyday", device_id="DEV-KNOWN-" + str(rng.randint(10, 99)),
            location="Home city", velocity=rng.randint(1, 2),
        )
        ctx = {"scenario": "normal", "amount_deviation": 0.3, "recent_transaction_count": txn.velocity}
    return txn, ctx


def save_scored(txn: Transaction, ctx: dict, score: dict) -> dict:
    rec = {"transaction": txn.model_dump(), "context": ctx, "score": score}
    _store[txn.transaction_id] = rec
    return rec


def get(txn_id: str) -> dict | None:
    return _store.get(txn_id)


def list_all(limit: int = 50) -> list[dict]:
    return list(reversed(list(_store.values())))[-limit:]


def reset() -> None:
    _store.clear()


def tokenize(user_id: str) -> dict:
    h = hashlib.sha256(("finsheild-salt::" + user_id).encode()).hexdigest()
    return {
        "user_token": f"{h[:4]}...{h[-4:]}",
        "phone": "••••••••42",
        "document": "TOKENIZED",
        "status": "Verified",
        "method": "Prototype identity tokenization (salted SHA-256, NOT a zero-knowledge proof)",
        "kind": "DEMO_SIMULATION",
    }


def graph_for(txn_id: str) -> dict:
    rec = _store.get(txn_id)
    ctx = (rec or {}).get("context", {})
    txn = (rec or {}).get("transaction", {})
    score = (rec or {}).get("score", {})
    scenario = ctx.get("scenario", "normal")

    u = str(txn.get("user_id") or "USER-8926")
    dev_id = str(txn.get("device_id") or "DEV-01")
    merch = str(txn.get("merchant") or "Cashfree Payment Rail")
    merch_cat = str(txn.get("merchant_category") or "digital_gateway")
    amt = float(txn.get("amount") or 100.0)
    channel = str(txn.get("channel") or "UPI")
    gateway = str(txn.get("gateway") or "Cashfree")
    risk_level = str(score.get("risk_level") or ("CRITICAL" if amt >= 100000 else "LOW"))
    risk_score = float(score.get("risk_score") or (0.89 if amt >= 100000 else 0.035))
    is_new = bool(ctx.get("is_new_device") or ("NEW" in dev_id) or ("CF" in dev_id))
    velocity = int(txn.get("velocity") or 1)

    if scenario == "fraud_ring":
        return {
            "nodes": [
                {
                    "id": "acct:A",
                    "label": "ACC-MULE-8901",
                    "type": "account",
                    "role": "Recruiter Mule Account",
                    "risk": "CRITICAL",
                    "details": {
                        "bank": "ICICI Bank Ltd",
                        "mule_probability": "94.2%",
                        "inflow_velocity": "₹4,20,000 / 24h",
                        "status": "FREEZE_PENDING"
                    }
                },
                {
                    "id": "acct:B",
                    "label": "ACC-MULE-8902",
                    "type": "account",
                    "role": "Layering Mule Account",
                    "risk": "CRITICAL",
                    "details": {
                        "bank": "Axis Bank Ltd",
                        "mule_probability": "91.8%",
                        "inflow_velocity": "₹3,80,000 / 24h",
                        "status": "FREEZE_PENDING"
                    }
                },
                {
                    "id": "acct:C",
                    "label": "ACC-MULE-8903",
                    "type": "account",
                    "role": "Smurfing Node",
                    "risk": "HIGH",
                    "details": {
                        "bank": "Yes Bank Ltd",
                        "mule_probability": "86.5%",
                        "inflow_velocity": "₹2,50,000 / 24h",
                        "status": "WATCHLIST"
                    }
                },
                {
                    "id": "dev:X",
                    "label": dev_id if "EMU" in dev_id else "DEV-SHARED-EMU-99",
                    "type": "device",
                    "role": "Shared Rooted Hardware",
                    "risk": "CRITICAL",
                    "details": {
                        "fingerprint": "SHA256:7f9a8b12...c09d",
                        "os_environment": "Android 14 (Rooted Emulator)",
                        "linked_accounts": 3,
                        "ip_subnet": "103.21.244.0/24 (VPN Exit Node)"
                    }
                },
                {
                    "id": txn_id,
                    "label": f"₹{amt:,.2f}" if amt else txn_id,
                    "type": "transaction",
                    "role": "Laundering Payout Attempt",
                    "risk": "CRITICAL",
                    "details": {
                        "transaction_id": txn_id,
                        "amount": f"₹{amt:,.2f}",
                        "risk_score": risk_score,
                        "decision": "BLOCK",
                        "timestamp": txn.get("timestamp", "Just now")
                    }
                },
                {
                    "id": f"gw:{gateway}",
                    "label": f"{gateway} Switch",
                    "type": "gateway",
                    "role": "High-Throughput Rail",
                    "risk": "INFO",
                    "details": {
                        "gateway": gateway,
                        "rail": channel,
                        "routing": "NPCI IMPS Fast-Rail",
                        "latency": "16ms"
                    }
                },
                {
                    "id": "merch:M-7",
                    "label": merch if merch != "Cashfree Payment Rail" else "Offshore P2P Liquidity Escrow",
                    "type": "merchant",
                    "role": "Cashout Destination",
                    "risk": "HIGH",
                    "details": {
                        "merchant_name": merch,
                        "category": "P2P Crypto / Offshore Escrow",
                        "settlement": "Instant Automated Payout",
                        "flag": "HIGH_RISK_MCC"
                    }
                },
            ],
            "edges": [
                {"from": "acct:A", "to": "dev:X", "label": "SHARED_HARDWARE", "is_suspicious": True},
                {"from": "acct:B", "to": "dev:X", "label": "SHARED_HARDWARE", "is_suspicious": True},
                {"from": "acct:C", "to": "dev:X", "label": "SHARED_HARDWARE", "is_suspicious": True},
                {"from": "acct:A", "to": txn_id, "label": "FUNDS_DEBIT", "is_suspicious": False},
                {"from": "dev:X", "to": txn_id, "label": "EMULATED_SIGNATURE", "is_suspicious": True},
                {"from": txn_id, "to": f"gw:{gateway}", "label": "ROUTES_VIA", "is_suspicious": False},
                {"from": f"gw:{gateway}", "to": "merch:M-7", "label": "CASHOUT_SETTLE", "is_suspicious": True},
            ],
            "kind": "DEMO_SIMULATION",
            "note": "Syndicate Topology: 3 mule accounts coordinated from a single emulated device (DEV-SHARED-EMU-99).",
            "summary": {
                "topology_type": "Mule Syndicate Cluster",
                "connected_entities": 7,
                "anomalous_edges": 5,
                "shared_clique_detected": True
            }
        }

    # Suspicious / High-Value / Cashfree Anomaly
    if scenario == "suspicious" or amt >= 25000 or is_new or risk_score >= 0.5:
        return {
            "nodes": [
                {
                    "id": f"user:{u}",
                    "label": u,
                    "type": "user",
                    "role": "Primary Account Holder",
                    "risk": "SUSPICIOUS",
                    "details": {
                        "user_id": u,
                        "phone": "+91 7020968926" if "8926" in u else "••••••••42",
                        "kyc_status": "Tier 2 Verified",
                        "profile_baseline": "₹3,800 typical avg txn"
                    }
                },
                {
                    "id": f"acct:{u}",
                    "label": f"{u}@bank" if "UPI" in channel else f"A/C ••{u[-4:] if len(u)>=4 else '01'}",
                    "type": "account",
                    "role": "Funding Bank Account",
                    "risk": "SAFE",
                    "details": {
                        "bank": "HDFC Bank Ltd",
                        "vpa": f"{u.lower()}@hdfcbank",
                        "available_balance": "₹1,45,200.00",
                        "status": "ACTIVE"
                    }
                },
                {
                    "id": "dev:LEGIT-PIXEL",
                    "label": "DEV-PIXEL-BASE",
                    "type": "device",
                    "role": "Authorized Baseline Device",
                    "risk": "SAFE",
                    "details": {
                        "hardware": "Google Pixel 8 (Android 14)",
                        "pairing_age": "180 days registered",
                        "trust_score": 0.98,
                        "status": "DORMANT (Not used for this txn)"
                    }
                },
                {
                    "id": f"dev:{dev_id}",
                    "label": dev_id,
                    "type": "device",
                    "role": "Rogue Ingress Device",
                    "risk": "CRITICAL",
                    "details": {
                        "device_id": dev_id,
                        "first_seen": "12 minutes ago",
                        "burst_velocity": f"{velocity} transactions / 5min",
                        "trust_score": 0.12,
                        "status": "UNRECOGNIZED_FINGERPRINT"
                    }
                },
                {
                    "id": txn_id,
                    "label": f"₹{amt:,.2f}" if amt else txn_id,
                    "type": "transaction",
                    "role": f"Ingress Attempt ({risk_level})",
                    "risk": risk_level,
                    "details": {
                        "transaction_id": txn_id,
                        "amount": f"₹{amt:,.2f}",
                        "risk_score": risk_score,
                        "rules": ["BURST_VELOCITY", "NEW_DEVICE_HIGH_VALUE", "UPI_HIGH_VALUE_ANOMALY"],
                        "decision": "BLOCK" if risk_score > 0.7 else "STEP_UP"
                    }
                },
                {
                    "id": f"gw:{gateway}",
                    "label": f"{gateway} Gateway Switch",
                    "type": "gateway",
                    "role": "Ingress Payment Switch",
                    "risk": "INFO",
                    "details": {
                        "gateway": gateway,
                        "order_id": ctx.get("order_id", "CFPay_100K_LIVE"),
                        "cf_payment_id": ctx.get("cf_payment_id", txn_id.replace("CF-", "")),
                        "payment_status": "SUCCESS_ROUTED"
                    }
                },
                {
                    "id": f"merch:{merch[:14]}",
                    "label": merch,
                    "type": "merchant",
                    "role": "Settlement Beneficiary",
                    "risk": "LOW",
                    "details": {
                        "merchant_name": merch,
                        "category": merch_cat,
                        "settlement": "T+1 Escrow Account",
                        "verification": "Merchant KYC Passed"
                    }
                },
            ],
            "edges": [
                {"from": f"user:{u}", "to": f"acct:{u}", "label": "OWNS_ACCOUNT", "is_suspicious": False},
                {"from": f"user:{u}", "to": "dev:LEGIT-PIXEL", "label": "PAIRED_BASELINE", "is_suspicious": False},
                {"from": f"acct:{u}", "to": txn_id, "label": "DEBIT_REQUEST", "is_suspicious": False},
                {"from": f"dev:{dev_id}", "to": txn_id, "label": "ROGUE_SIGNATURE", "is_suspicious": True},
                {"from": f"dev:{dev_id}", "to": "dev:LEGIT-PIXEL", "label": "HARDWARE_MISMATCH", "is_suspicious": True},
                {"from": txn_id, "to": f"gw:{gateway}", "label": "ROUTED_VIA", "is_suspicious": False},
                {"from": f"gw:{gateway}", "to": f"merch:{merch[:14]}", "label": "SETTLES_ESCROW", "is_suspicious": False},
            ],
            "kind": "DEMO_SIMULATION",
            "note": "Ingress Anomaly: Transaction originated from unrecognized hardware (DEV-NEW-CF) bypassing authorized baseline device.",
            "summary": {
                "topology_type": "Account Takeover / New Hardware Ingress",
                "connected_entities": 7,
                "anomalous_edges": 2,
                "shared_clique_detected": False
            }
        }

    # Normal / Safe Baseline
    return {
        "nodes": [
            {
                "id": f"user:{u}",
                "label": u,
                "type": "user",
                "role": "Verified Account Holder",
                "risk": "SAFE",
                "details": {
                    "user_id": u,
                    "kyc_status": "Tier 1 Full KYC",
                    "account_age": "24 months",
                    "trust_score": 0.99
                }
            },
            {
                "id": f"acct:{u}",
                "label": f"{u}@sbi" if "UPI" in channel else f"A/C ••{u[-4:] if len(u)>=4 else '01'}",
                "type": "account",
                "role": "Primary Linked Account",
                "risk": "SAFE",
                "details": {
                    "bank": "State Bank of India",
                    "vpa": f"{u.lower()}@sbi",
                    "status": "NORMAL"
                }
            },
            {
                "id": f"dev:{dev_id}",
                "label": dev_id,
                "type": "device",
                "role": "Paired Mobile Hardware",
                "risk": "SAFE",
                "details": {
                    "hardware": "Samsung Galaxy S24 (Android 14)",
                    "first_registered": "120 days ago",
                    "trust_score": 0.97
                }
            },
            {
                "id": txn_id,
                "label": f"₹{amt:,.2f}" if amt else txn_id,
                "type": "transaction",
                "role": "Payment Ingress",
                "risk": "LOW",
                "details": {
                    "transaction_id": txn_id,
                    "amount": f"₹{amt:,.2f}",
                    "risk_score": risk_score,
                    "decision": "APPROVE"
                }
            },
            {
                "id": f"gw:{gateway}",
                "label": f"{gateway} Switch",
                "type": "gateway",
                "role": "Ingress Payment Switch",
                "risk": "INFO",
                "details": {
                    "gateway": gateway,
                    "channel": channel,
                    "protocol": "Real-time UPI"
                }
            },
            {
                "id": f"merch:{merch[:14]}",
                "label": merch,
                "type": "merchant",
                "role": "Verified Merchant Partner",
                "risk": "SAFE",
                "details": {
                    "merchant_name": merch,
                    "category": merch_cat,
                    "settlement": "Instant UPI Credit"
                }
            },
        ],
        "edges": [
            {"from": f"user:{u}", "to": f"acct:{u}", "label": "OWNS_ACCOUNT", "is_suspicious": False},
            {"from": f"user:{u}", "to": f"dev:{dev_id}", "label": "PAIRED_DEVICE", "is_suspicious": False},
            {"from": f"acct:{u}", "to": txn_id, "label": "DEBIT_ORDER", "is_suspicious": False},
            {"from": f"dev:{dev_id}", "to": txn_id, "label": "SIGNS_PAYLOAD", "is_suspicious": False},
            {"from": txn_id, "to": f"gw:{gateway}", "label": "ROUTES_VIA", "is_suspicious": False},
            {"from": f"gw:{gateway}", "to": f"merch:{merch[:14]}", "label": "SETTLES_CREDIT", "is_suspicious": False},
        ],
        "kind": "DEMO_SIMULATION",
        "note": "Clean Topology: End-to-end verified path matching customer historical baseline and hardware fingerprint.",
        "summary": {
            "topology_type": "Verified Direct Ingress",
            "connected_entities": 6,
            "anomalous_edges": 0,
            "shared_clique_detected": False
        }
    }

