import csv
import random
from pathlib import Path
from datetime import date, timedelta

random.seed(20261031)

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "Capstone_Project_Dataset_FTTT_2026" / "data"

if OUT.parent.exists():
    raise SystemExit(
        "Dataset folder already exists. Stopping to protect existing files."
    )

OUT.mkdir(parents=True)

def save(name, rows):
    path = OUT / name
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Created {name}: {len(rows)} rows")

first_names = [
    "Aarav", "Vivaan", "Aditya", "Arjun", "Ishaan", "Rohan",
    "Ananya", "Diya", "Isha", "Meera", "Aanya", "Saanvi",
    "Priya", "Kavya", "Neha", "Rahul", "Kiran", "Aditi"
]
last_names = [
    "Sharma", "Patel", "Reddy", "Nair", "Iyer", "Gupta",
    "Verma", "Rao", "Das", "Mehta", "Singh", "Joshi"
]

pincodes_list = [
    "560001", "560002", "560003", "560004", "560005", "560006",
    "560007", "560008", "560009", "560010", "560011", "560012",
    "560013", "560014", "560015", "560016", "560017", "560018",
    "560019", "560020", "560021", "560022", "560023", "560024",
    "560025", "560026", "560027", "560028", "560029", "560030",
    "560034", "560036", "560037", "560038", "560040", "560041"
]

pincodes = [
    {
        "pincode": p,
        "city": "Bengaluru",
        "state": "Karnataka",
        "serviceable": random.choice(["True", "True", "True", "False"]),
        "cod_available": random.choice(["True", "False"]),
        "express_available": random.choice(["True", "False"])
    }
    for p in pincodes_list
]

customers = []
for i in range(1, 301):
    name = random.choice(first_names) + " " + random.choice(last_names)
    customers.append({
        "customer_id": f"CUST{i:04d}",
        "name": name,
        "phone": f"9{random.randint(100000000, 999999999)}",
        "email": f"customer{i}@example.com",
        "pincode": random.choice(pincodes_list),
        "is_plus": random.choice(["True", "False"]),
        "preferred_language": random.choice(["English", "Hindi", "Kannada"])
    })

products = []
categories = [
    "Electronics", "Home & Kitchen", "Fashion",
    "Beauty", "Books", "Grocery"
]
for i in range(1, 71):
    category = random.choice(categories)
    price = random.choice([299, 499, 799, 999, 1499, 1999, 2499, 3999, 5999])
    products.append({
        "sku": f"SKU{i:04d}",
        "product_id": f"SKU{i:04d}",
        "product_name": f"{category} Product {i:02d}",
        "category": category,
        "price_inr": str(price),
        "price": str(price),
        "fulfilled_by": random.choice(["ZentroMart", "Seller"]),
        "assured": random.choice(["True", "False"]),
        "warranty_months": str(random.choice([0, 3, 6, 12, 24])),
        "return_eligible": random.choice(["True", "False"]),
        "return_window_days": "7"
    })

orders = []
order_items = []
statuses = ["Delivered", "Shipped", "Processing", "Cancelled", "Returned"]
payments = ["UPI", "Credit Card", "Debit Card", "Cash on Delivery", "Net Banking"]
base_date = date(2026, 7, 1)

for i in range(1, 1001):
    order_id = f"ORD{i:05d}"
    customer = random.choice(customers)
    order_date = base_date + timedelta(days=random.randint(0, 110))
    promised = order_date + timedelta(days=random.randint(2, 7))
    status = random.choice(statuses)

    orders.append({
        "order_id": order_id,
        "customer_id": customer["customer_id"],
        "status": status,
        "order_status": status,
        "order_date": order_date.isoformat(),
        "promised_date": promised.isoformat(),
        "promised_delivery_date": promised.isoformat(),
        "payment": random.choice(payments),
        "payment_method": random.choice(payments),
        "delivery_pincode": customer["pincode"],
        "return_status": "Requested" if status == "Returned" else "None",
        "refund_status": random.choice(["Pending", "Completed"]) if status == "Returned" else "None"
    })

    # Distribute exactly 1,783 line items across 1,000 orders.
    item_count = 2 if i <= 783 else 1

    for line in range(1, item_count + 1):
        product = random.choice(products)
        order_items.append({
            "order_id": order_id,
            "line_no": str(line),
            "order_item_id": f"{order_id}-L{line}",
            "item_id": f"{order_id}-L{line}",
            "sku": product["sku"],
            "product_id": product["product_id"],
            "qty": str(random.randint(1, 3)),
            "unit_price_inr": product["price_inr"],
            "price": product["price_inr"],
            "return_category": random.choice(["", "Damaged", "Wrong item", "Not needed"])
        })

holidays = [
    {"date": "2026-08-15", "name": "Independence Day"},
    {"date": "2026-08-28", "name": "Regional Holiday"},
    {"date": "2026-10-02", "name": "Gandhi Jayanti"},
    {"date": "2026-10-20", "name": "Festival Holiday"}
]

intents = [
    "Order Status", "Delivery Delay", "Return Request",
    "Refund Status", "Payment Issue", "Product Information"
]
resolutions = [
    "Information provided",
    "Issue escalated",
    "Customer guided through process",
    "Request resolved"
]

support_logs = []
for i in range(1, 245):
    order = random.choice(orders)
    support_logs.append({
        "log_id": f"LOG{i:04d}",
        "customer_id": order["customer_id"],
        "order_id": order["order_id"],
        "intent": random.choice(intents),
        "transcript": "Synthetic demo support conversation for testing.",
        "resolution": random.choice(resolutions),
        "context": "SYNTHETIC DEMO DATA"
    })

save("customers.csv", customers)
save("orders.csv", orders)
save("order_items.csv", order_items)
save("products.csv", products)
save("pincodes.csv", pincodes)
save("holidays.csv", holidays)
save("support_logs.csv", support_logs)

notice = ROOT / "SYNTHETIC_DATA_NOTICE.txt"
notice.write_text(
    "SYNTHETIC DEMO DATA\n"
    "Generated randomly for local website and dashboard testing.\n"
    "Not official VoiceOps capstone data. Not valid for official evaluation.\n",
    encoding="utf-8"
)

print("\nSynthetic dataset created successfully.")
print("Notice saved to:", notice)
