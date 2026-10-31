import os
import json
import logging
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd

from app.config import DATASET_PATH, REFERENCE_DATE

logger = logging.getLogger("DatasetService")

# Expected VoiceOps Capstone Schema Counts
EXPECTED_COUNTS = {
    "customers": 300,
    "orders": 1000,
    "order_items": 1783,
    "products": 70,
    "pincodes": 36,
    "holidays": 4,
    "support_logs": 244,
}

EXPECTED_PRACTICE = {
    "questions": 52,
    "conversations": 23,
    "turns": 96,
}

class DatasetService:
    def __init__(self, dataset_path: Optional[Path] = None):
        self.dataset_path = dataset_path or DATASET_PATH
        self.reference_date = datetime.strptime(REFERENCE_DATE, "%Y-%m-%d").date()
        
        self.customers_df: Optional[pd.DataFrame] = None
        self.orders_df: Optional[pd.DataFrame] = None
        self.order_items_df: Optional[pd.DataFrame] = None
        self.products_df: Optional[pd.DataFrame] = None
        self.pincodes_df: Optional[pd.DataFrame] = None
        self.holidays_df: Optional[pd.DataFrame] = None
        self.support_logs_df: Optional[pd.DataFrame] = None
        
        self.practice_questions: List[Dict[str, Any]] = []
        self.practice_conversations: List[Dict[str, Any]] = []
        
        self.holidays_set: set = set()
        self.is_loaded = False
        self.missing_files: List[str] = []
        
        self.load_dataset()

    def load_dataset(self) -> bool:
        """Loads and indexes all CSVs and practice files from dataset folder using dtype=str."""
        if not self.dataset_path.exists():
            logger.warning(f"Dataset directory '{self.dataset_path}' does not exist.")
            self.missing_files.append(str(self.dataset_path))
            return False

        logger.info(f"Loading Capstone dataset from: {self.dataset_path}")

        csv_mappings = {
            "customers": "customers.csv",
            "orders": "orders.csv",
            "order_items": "order_items.csv",
            "products": "products.csv",
            "pincodes": "pincodes.csv",
            "holidays": "holidays.csv",
            "support_logs": "support_logs.csv",
        }

        for attr, filename in csv_mappings.items():
            file_path = self._find_file(filename)
            if file_path and file_path.exists():
                try:
                    # Enforce pandas dtype=str to preserve all IDs and pincodes as strings
                    df = pd.read_csv(file_path, dtype=str)
                    setattr(self, f"{attr}_df", df)
                    logger.info(f"Loaded {filename}: {len(df)} rows")
                except Exception as e:
                    logger.error(f"Error reading {filename}: {e}")
            else:
                self.missing_files.append(filename)

        # Build holidays set for business days computation
        if self.holidays_df is not None:
            # Look for date column in holidays.csv
            date_col = next((c for c in self.holidays_df.columns if "date" in c.lower()), None)
            if date_col:
                for val in self.holidays_df[date_col].dropna():
                    try:
                        h_date = datetime.strptime(val.strip(), "%Y-%m-%d").date()
                        self.holidays_set.add(h_date)
                    except ValueError:
                        pass

        # Load practice benchmark questions & conversations
        self._load_practice_files()

        self.is_loaded = len(self.missing_files) == 0
        return self.is_loaded

    def _find_file(self, filename: str) -> Optional[Path]:
        """Search recursively inside dataset_path for filename."""
        if not self.dataset_path.exists():
            return None
        direct = self.dataset_path / filename
        if direct.exists():
            return direct
        for p in self.dataset_path.rglob(filename):
            if p.is_file():
                return p
        return None

    def _load_practice_files(self):
        """Loads practice benchmark files (52 questions, 23 conversations)."""
        # Look for practice questions json or csv
        q_file = self._find_file("practice_questions.json") or self._find_file("questions.json")
        if q_file and q_file.exists():
            try:
                with open(q_file, "r", encoding="utf-8") as f:
                    self.practice_questions = json.load(f)
            except Exception as e:
                logger.error(f"Error reading practice questions: {e}")

        conv_file = self._find_file("practice_conversations.json") or self._find_file("conversations.json")
        if conv_file and conv_file.exists():
            try:
                with open(conv_file, "r", encoding="utf-8") as f:
                    self.practice_conversations = json.load(f)
            except Exception as e:
                logger.error(f"Error reading practice conversations: {e}")

    # --- Business Days & Calendar Rules (Section 12) ---
    def is_business_day(self, d: date) -> bool:
        """Business days run Monday to Saturday (0 to 5), excluding holidays."""
        # weekday(): Monday is 0, Sunday is 6
        if d.weekday() == 6:  # Sunday
            return False
        if d in self.holidays_set:
            return False
        return True

    def add_business_days(self, start_date: date, n_days: int) -> date:
        """Calculates expected dispatch date adding business days (Mon-Sat, excl holidays)."""
        cur = start_date
        added = 0
        while added < n_days:
            cur += timedelta(days=1)
            if self.is_business_day(cur):
                added += 1
        return cur

    def calendar_days_between(self, start_date: date, end_date: date) -> int:
        """Return windows strictly use calendar days."""
        return (end_date - start_date).days

    def evaluate_return_window(self, delivered_date_str: str, window_days: int = 7) -> Dict[str, Any]:
        """Evaluates return eligibility against the fixed reference date: 20 October 2026."""
        try:
            delivered_date = datetime.strptime(delivered_date_str.strip(), "%Y-%m-%d").date()
        except Exception:
            return {"eligible": False, "reason": "Invalid delivery date format"}

        days_passed = (self.reference_date - delivered_date).days
        is_eligible = days_passed <= window_days

        return {
            "eligible": is_eligible,
            "days_passed": days_passed,
            "window_days": window_days,
            "reference_date": str(self.reference_date),
            "delivered_date": str(delivered_date),
            "days_remaining": max(0, window_days - days_passed) if is_eligible else 0,
            "rule": f"Return window uses calendar days ({window_days} days). Reference date is {self.reference_date}.",
        }

    def validate_dataset(self) -> Dict[str, Any]:
        """Validates current dataset files against expected schema counts."""
        status = {}
        missing = []
        counts = {}

        csv_names = ["customers", "orders", "order_items", "products", "pincodes", "holidays", "support_logs"]
        for name in csv_names:
            df = getattr(self, f"{name}_df")
            if df is not None:
                counts[name] = len(df)
                status[name] = {
                    "loaded": True,
                    "rows": len(df),
                    "expected": EXPECTED_COUNTS.get(name),
                    "matches_expected": len(df) == EXPECTED_COUNTS.get(name),
                }
            else:
                missing.append(f"{name}.csv")
                status[name] = {"loaded": False, "rows": 0, "expected": EXPECTED_COUNTS.get(name)}

        all_valid = len(missing) == 0

        return {
            "all_valid": all_valid,
            "dataset_folder_exists": self.dataset_path.exists(),
            "dataset_path": str(self.dataset_path),
            "missing_requirements": missing,
            "file_status": status,
            "expected_counts": EXPECTED_COUNTS,
            "reference_date": str(self.reference_date),
        }

# Global Singleton Service
dataset_service = DatasetService()
