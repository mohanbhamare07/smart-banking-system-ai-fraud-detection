import csv
import random
from pathlib import Path

TOTAL_RECORDS = 2000

OUTPUT_FILE = Path(__file__).parent / "fraud_transactions.csv"

locations = [
    "Mumbai",
    "Pune",
    "Nashik",
    "Dhule",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Ahmedabad"
]

transaction_types = [
    "PAYMENT",
    "TRANSFER",
    "WITHDRAWAL",
    "DEPOSIT"
]

devices = [
    "DEVICE001",
    "DEVICE002",
    "DEVICE003",
    "DEVICE004",
    "DEVICE005",
    "DEVICE006",
    "DEVICE007",
    "DEVICE008"
]


def generate_transaction():

    amount = round(random.uniform(100, 50000), 2)

    transaction_type = random.choice(transaction_types)

    location = random.choice(locations)

    device_id = random.choice(devices)

    transaction_hour = random.randint(0, 23)

    previous_transactions = random.randint(0, 30)

    is_new_device = random.choice([
        0, 0, 0, 1
    ])

    is_international = random.choice([
        0, 0, 0, 0, 1
    ])

    fraud_probability = 0.05

    # High transaction amount
    if amount > 40000:
        fraud_probability += 0.30

    # Late night / early morning transaction
    if transaction_hour <= 4:
        fraud_probability += 0.20

    # New device
    if is_new_device == 1:
        fraud_probability += 0.20

    # International transaction
    if is_international == 1:
        fraud_probability += 0.25

    # Very few previous transactions
    if previous_transactions <= 2:
        fraud_probability += 0.15

    # Transfer transactions
    if transaction_type == "TRANSFER":
        fraud_probability += 0.05

    # Random variation
    fraud_probability += random.uniform(-0.05, 0.05)

    fraud_probability = max(
        0.01,
        min(fraud_probability, 0.95)
    )

    fraud = 1 if random.random() < fraud_probability else 0

    return [
        amount,
        transaction_type,
        location,
        device_id,
        transaction_hour,
        previous_transactions,
        is_new_device,
        is_international,
        fraud
    ]


def generate_dataset():

    headers = [
        "amount",
        "transaction_type",
        "location",
        "device_id",
        "transaction_hour",
        "previous_transactions",
        "is_new_device",
        "is_international",
        "fraud"
    ]

    with open(
        OUTPUT_FILE,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow(headers)

        for _ in range(TOTAL_RECORDS):
            writer.writerow(
                generate_transaction()
            )

    print("======================================")
    print("Fraud Detection Dataset Generated")
    print("======================================")
    print(f"Total records : {TOTAL_RECORDS}")
    print(f"Output file   : {OUTPUT_FILE}")
    print("======================================")


if __name__ == "__main__":
    generate_dataset()