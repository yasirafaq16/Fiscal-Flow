import json
import sys


def safe_sum(items):
    total = 0.0
    for item in items:
        try:
            total += float(item.get("amount", 0) or 0)
        except Exception:
            pass
    return total


def top_categories(items, limit=3):
    agg = {}
    for item in items:
        cat = (item.get("category") or "Uncategorized").strip() or "Uncategorized"
        try:
            amt = float(item.get("amount", 0) or 0)
        except Exception:
            amt = 0.0
        agg[cat] = agg.get(cat, 0.0) + amt
    ranked = sorted(agg.items(), key=lambda x: x[1], reverse=True)
    return ranked[:limit]


def fallback_insights(payload):
    earnings = payload.get("earnings", [])
    savings = payload.get("savings", [])
    expenditures = payload.get("expenditures", [])
    target = float(payload.get("targetSavingsRate", 0.25) or 0.25)

    total_earnings = safe_sum(earnings)
    total_savings = safe_sum(savings)
    total_exp = safe_sum(expenditures)
    savings_rate = 0.0 if total_earnings <= 0 else total_savings / total_earnings

    insights = []
    if total_earnings <= 0:
        insights.append("Add earning entries first so the model can estimate realistic savings behavior.")
    else:
        if savings_rate < target:
            need = max(0.0, (target * total_earnings) - total_savings)
            insights.append(
                f"Your estimated savings rate is {round(savings_rate * 100)}%. To reach {round(target * 100)}%, save about {round(need, 2)} more."
            )
        else:
            insights.append(
                f"Great work: your estimated savings rate is {round(savings_rate * 100)}%, meeting your {round(target * 100)}% target."
            )

    top_exp = top_categories(expenditures, 2)
    if len(top_exp) > 0 and total_exp > 0:
        cat, amt = top_exp[0]
        share = amt / total_exp if total_exp > 0 else 0
        insights.append(
            f"Highest spending category is {cat} (~{round(share * 100)}% of expenses). Reducing it by 10% can improve monthly balance."
        )

    if len(insights) == 0:
        insights.append("Add more earning, savings, and expenditure records for stronger model insights.")

    return insights


def run_xgboost(payload):
    try:
        import xgboost as xgb  # noqa: F401
        import numpy as np
    except Exception:
        return {
            "insights": fallback_insights(payload),
            "model": "fallback",
            "note": "Install Python packages: pip install xgboost numpy"
        }

    earnings = payload.get("earnings", [])
    savings = payload.get("savings", [])
    expenditures = payload.get("expenditures", [])
    target = float(payload.get("targetSavingsRate", 0.25) or 0.25)

    total_earnings = safe_sum(earnings)
    total_savings = safe_sum(savings)
    total_exp = safe_sum(expenditures)
    savings_rate = 0.0 if total_earnings <= 0 else total_savings / total_earnings

    # Tiny synthetic training set for behavior scoring. This keeps the endpoint
    # self-contained while still using a real XGBoost model.
    X_train = np.array(
        [
            [2000, 600, 1100, 0.30],
            [5000, 800, 3900, 0.16],
            [7000, 2200, 3500, 0.31],
            [3200, 400, 2500, 0.12],
            [4500, 1500, 2200, 0.33],
            [6000, 600, 5000, 0.10],
        ],
        dtype=float,
    )
    y_train = np.array([1, 0, 1, 0, 1, 0], dtype=float)

    dtrain = xgb.DMatrix(X_train, label=y_train)
    params = {
        "max_depth": 3,
        "eta": 0.2,
        "objective": "binary:logistic",
        "eval_metric": "logloss",
        "verbosity": 0,
    }
    booster = xgb.train(params, dtrain, num_boost_round=18)

    X_pred = np.array([[total_earnings, total_savings, total_exp, savings_rate]], dtype=float)
    pred = booster.predict(xgb.DMatrix(X_pred))[0]

    insights = []
    if total_earnings <= 0:
        insights.append("Add earning records to enable accurate XGBoost predictions.")
    else:
        if pred >= 0.5:
            insights.append(
                f"XGBoost estimates healthy saving behavior (score {round(float(pred), 2)}). Maintain current earning-to-saving ratio."
            )
        else:
            needed = max(0.0, (target * total_earnings) - total_savings)
            insights.append(
                f"XGBoost flags risk of under-saving (score {round(float(pred), 2)}). Try saving about {round(needed, 2)} more this cycle."
            )

    top_exp = top_categories(expenditures, 3)
    if top_exp:
        cat, amt = top_exp[0]
        insights.append(f"Top expense category is {cat} ({round(amt, 2)}). Consider reducing this first for best impact.")

    if not insights:
        insights = fallback_insights(payload)

    return {"insights": insights, "model": "xgboost"}


def main():
    raw = sys.stdin.read()
    payload = json.loads(raw or "{}")
    result = run_xgboost(payload)
    sys.stdout.write(json.dumps(result))


if __name__ == "__main__":
    main()
