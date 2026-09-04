"""Configuration and ML Core path resolution."""
from __future__ import annotations

import os
import sys
from pathlib import Path

def get_ml_repo_root() -> Path:
    """Find the FinSheild ML Core repository root."""
    # 1. Check explicit environment variable
    env_path = os.getenv("FINSHEILD_CORE_PATH")
    if env_path:
        p = Path(env_path).resolve()
        if p.exists():
            return p

    # 2. Check sibling directory ../Finsheild
    sibling = (Path(__file__).resolve().parents[2] / "Finsheild").resolve()
    if sibling.exists() and (sibling / "models").exists():
        return sibling

    # 3. Check two levels up (in case running inside monorepo)
    parent_two = Path(__file__).resolve().parents[2]
    if (parent_two / "models").exists():
        return parent_two

    # 4. Check three levels up
    parent_three = Path(__file__).resolve().parents[3]
    if (parent_three / "models").exists():
        return parent_three

    return parent_two

ML_REPO_ROOT = get_ml_repo_root()

# Ensure finsheild package is importable if present in ML repo
if (ML_REPO_ROOT / "src").exists() and str(ML_REPO_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(ML_REPO_ROOT / "src"))
