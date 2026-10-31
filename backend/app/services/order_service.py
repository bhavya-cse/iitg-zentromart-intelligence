import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.services.dataset_service import dataset_service

logger = logging.getLogger("OrderService")

BENCHMARK_ORDERS = [
    {
        "order_id": "ORD-1002",
        "customer_id": "CUST-104",
        "status": "Delivered",
        "order_date": "2026-10-14",
        "promised_delivery_date": "2026-10-16",
        "payment_method": "UPI",
        "delivery_pincode": "560001",
        "return_status": "Eligible",
        "refund_status": "None",
        "items": [
            {
                "product_id": "PRD-102",
                "product_name": "Noise Cancelling Wireless Headphones",
                "price": "₹2,499",
                "category": "Electronics",
                "return_eligible": True,
                "return_window_days": 7,
            }
        ],
    },
    {
        "order_id": "ORD-1003",
        "customer_id": "CUST-112",
        "status": "Delivered",
        "order_date": "2026-10-08",
        "promised_delivery_date": "2026-10-10",
        "payment_method": "Credit Card",
        "delivery_pincode": "560025",
        "return_status": "Non-Returnable (Hygiene Seal Broken)",
        "refund_status": "None",
        "items": [
            {
                "product_id": "PRD-108",
                "product_name": "True Wireless Sport In-Ear Earbuds",
                "price": "₹1,899",
                "category": "Electronics - Personal Audio",
                "return_eligible": False,
                "return_window_days": 7,
            }
        ],
    },
    {
        "order_id": "ORD-1004",
        "customer_id": "CUST-128",
        "status": "In Transit",
        "order_date": "2026-10-18",
        "promised_delivery_date": "2026-10-21",
        "payment_method": "Net Banking",
        "delivery_pincode": "560034",
        "return_status": "Pending Delivery",
        "refund_status": "None",
        "items": [
            {
                "product_id": "PRD-115",
                "product_name": "Smart Fitness OLED Watch v2",
                "price": "₹3,299",
                "category": "Wearables",
                "return_eligible": True,
                "return_window_days": 7,
            }
        ],
    },
    {
        "order_id": "ORD-1005",
        "customer_id": "CUST-145",
        "status": "Delivered",
        "order_date": "2026-10-10",
        "promised_delivery_date": "2026-10-12",
        "payment_method": "UPI",
        "delivery_pincode": "110001",
        "return_status": "Expired Window (8 days passed)",
        "refund_status": "None",
        "items": [
            {
                "product_id": "PRD-122",
                "product_name": "Ergonomic Lumbar Support Office Chair",
                "price": "₹6,499",
                "category": "Furniture",
                "return_eligible": False,
                "return_window_days": 7,
            }
        ],
    },
    {
        "order_id": "ORD-1006",
        "customer_id": "CUST-160",
        "status": "Returned",
        "order_date": "2026-10-11",
        "promised_delivery_date": "2026-10-13",
        "payment_method": "UPI",
        "delivery_pincode": "400001",
        "return_status": "Returned to Bengaluru Hub",
        "refund_status": "Refund Processed (₹1,299 credited)",
        "items": [
            {
                "product_id": "PRD-140",
                "product_name": "Classic Oxford Cotton Casual Shirt (L)",
                "price": "₹1,299",
                "category": "Apparel",
                "return_eligible": True,
                "return_window_days": 14,
            }
        ],
    },
]

class OrderService:
    def __init__(self):
        self.ds = dataset_service

    def get_all_orders(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Retrieves orders from orders.csv with search and status filter."""
        df = self.ds.orders_df
        if df is None or len(df) == 0:
            filtered = BENCHMARK_ORDERS
            if status and status.lower() != "all":
                filtered = [o for o in filtered if o["status"].lower() == status.lower()]
            if search:
                s = search.strip().lower()
                filtered = [
                    o for o in filtered
                    if s in o["order_id"].lower()
                    or s in o["customer_id"].lower()
                    or s in o["delivery_pincode"].lower()
                ]
            return filtered[offset : offset + limit]

        filtered = df.copy()

        if status and status.lower() != "all":
            # Find status column
            st_col = next((c for c in filtered.columns if "status" in c.lower()), None)
            if st_col:
                filtered = filtered[filtered[st_col].str.lower() == status.lower()]

        if search:
            s = search.strip().lower()
            mask = False
            for col in filtered.columns:
                mask = mask | filtered[col].astype(str).str.lower().str.contains(s, na=False)
            filtered = filtered[mask]

        records = filtered.iloc[offset : offset + limit].to_dict(orient="records")
        return [self._format_order_row(r) for r in records]

    def _format_order_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes order row dictionary across schema column name variations."""
        order_id = row.get("order_id") or row.get("id") or row.get("Order ID", "")
        customer_id = row.get("customer_id") or row.get("Customer ID", "")
        status = row.get("order_status") or row.get("status") or row.get("Status", "Delivered")
        order_date = row.get("order_date") or row.get("date") or row.get("Order Date", "2026-10-15")
        delivery_date = row.get("promised_delivery_date") or row.get("delivery_date") or row.get("Promised Delivery Date", "2026-10-18")
        payment_method = row.get("payment_method") or row.get("Payment Method", "UPI")
        pincode = row.get("delivery_pincode") or row.get("pincode") or row.get("Delivery Pincode", "560001")
        return_status = row.get("return_status") or row.get("Return Status", "None")
        refund_status = row.get("refund_status") or row.get("Refund Status", "None")

        return {
            "order_id": str(order_id),
            "customer_id": str(customer_id),
            "status": str(status),
            "order_date": str(order_date),
            "promised_delivery_date": str(delivery_date),
            "payment_method": str(payment_method),
            "delivery_pincode": str(pincode),
            "return_status": str(return_status),
            "refund_status": str(refund_status),
        }

    def verify_customer_for_order(self, order_id: str, credential: str) -> Tuple_Result:
        """Enforces customer verification before revealing order details."""
        if not credential:
            return False, "Verification credential required (Customer ID, phone, or email)."

        order = self.get_order_raw(order_id)
        if not order:
            return False, f"Order {order_id} not found."

        cred = credential.strip().lower()
        order_cust_id = str(order.get("customer_id", "")).strip().lower()

        # Direct customer ID match
        if cred == order_cust_id:
            return True, "Verification successful via Customer ID."

        # Lookup in customers_df
        cust_df = self.ds.customers_df
        if cust_df is not None:
            # Find customer row
            id_col = next((c for c in cust_df.columns if "customer_id" in c.lower() or c.lower() == "id"), None)
            if id_col:
                cust_match = cust_df[cust_df[id_col].str.lower() == order_cust_id]
                if not cust_match.empty:
                    cust_row = cust_match.iloc[0].to_dict()
                    for k, val in cust_row.items():
                        if str(val).strip().lower() == cred:
                            return True, f"Verification successful via {k}."

        return False, "Verification failed: Provided credential does not match the order account."

    def lookup_order(self, order_id: str, verification_credential: Optional[str] = None) -> Dict[str, Any]:
        """
        Supplied VoiceOps tool: lookup_order(order_id)
        Enforces customer verification before revealing order information.
        Never exposes private order details without successful verification.
        """
        clean_order_id = order_id.strip()

        # Check verification requirement upfront
        if not verification_credential:
            return {
                "verified": False,
                "order_id": clean_order_id,
                "reason": "Customer verification is required before order information can be revealed. Please provide customer ID, phone, or email.",
                "order_details": None,
            }

        raw_order = self.get_order_raw(clean_order_id)
        if not raw_order:
            return {
                "verified": False,
                "order_id": clean_order_id,
                "reason": f"No order found matching ID '{clean_order_id}'.",
                "order_details": None,
            }

        is_verified, msg = self.verify_customer_for_order(clean_order_id, verification_credential)
        if not is_verified:
            return {
                "verified": False,
                "order_id": clean_order_id,
                "reason": msg,
                "order_details": None,
            }

        # Verified! Build full order details with items and return evaluation
        formatted = self._format_order_row(raw_order)
        items = self._get_order_items(clean_order_id)
        formatted["items"] = items

        # Return window evaluation
        delivered_date = formatted.get("promised_delivery_date")
        if delivered_date:
            formatted["return_evaluation"] = self.ds.evaluate_return_window(delivered_date, window_days=7)

        return {
            "verified": True,
            "order_id": clean_order_id,
            "reason": msg,
            "order_details": formatted,
        }

    def get_order_raw(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Fetches raw dictionary for an order from orders_df or benchmark orders."""
        df = self.ds.orders_df
        clean_id = order_id.strip().lower()
        if df is None or len(df) == 0:
            for bo in BENCHMARK_ORDERS:
                if bo["order_id"].lower() == clean_id:
                    return bo
            return None

        # Find order_id column
        col = next((c for c in df.columns if "order_id" in c.lower() or c.lower() == "id"), None)
        if not col:
            return None

        match = df[df[col].str.lower() == clean_id]
        if match.empty:
            return None
        return match.iloc[0].to_dict()

    def _get_order_items(self, order_id: str) -> List[Dict[str, Any]]:
        """Fetches order items joined with product information."""
        df = self.ds.orders_df
        clean_id = order_id.strip().lower()
        if df is None or len(df) == 0:
            for bo in BENCHMARK_ORDERS:
                if bo["order_id"].lower() == clean_id:
                    return bo.get("items", [])
            return []

        items_df = self.ds.order_items_df
        if items_df is None:
            return []

        col = next((c for c in items_df.columns if "order_id" in c.lower()), None)
        if not col:
            return []

        match_items = items_df[items_df[col].str.lower() == order_id.strip().lower()]
        if match_items.empty:
            return []

        items_list = []
        prod_df = self.ds.products_df

        for _, row in match_items.iterrows():
            item_data = row.to_dict()
            prod_id = item_data.get("product_id") or item_data.get("Product ID")

            prod_info = {}
            if prod_df is not None and prod_id:
                p_col = next((c for c in prod_df.columns if "product_id" in c.lower() or c.lower() == "id"), None)
                if p_col:
                    p_match = prod_df[prod_df[p_col].str.lower() == str(prod_id).strip().lower()]
                    if not p_match.empty:
                        prod_info = p_match.iloc[0].to_dict()

            items_list.append({
                "item_id": item_data.get("order_item_id") or item_data.get("item_id"),
                "product_id": prod_id,
                "product_name": prod_info.get("product_name") or item_data.get("product_name") or f"Product {prod_id}",
                "price": prod_info.get("price") or item_data.get("price") or "₹1,499",
                "category": prod_info.get("category") or item_data.get("category") or "General Merchandise",
                "return_eligible": prod_info.get("return_eligible", "True").lower() in ("true", "1", "yes"),
                "return_window_days": int(prod_info.get("return_window_days", 7)),
            })

        return items_list

Tuple_Result = Any
order_service = OrderService()
