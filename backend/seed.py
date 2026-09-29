"""
BazarCycle BD — Database Seed Script
Populates demo categories, markets, users, waste batches, and impact records.
All demo data is explicitly marked with '[DEMO]'.
"""
import sys
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
from datetime import datetime, date, timedelta, timezone
from decimal import Decimal
from app.database import SessionLocal, init_db
from app.models.profiles import Profile
from app.models.markets import Market
from app.models.waste import WasteCategory, WasteRecord
from app.models.pickup import PickupRequest
from app.models.impact import ImpactRecord
from app.core.security import get_password_hash
from app.services.sustainability_score_service import calculate_market_sustainability_score

def seed():
    print("🌱 Initializing database schema...")
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_admin = db.query(Profile).filter(Profile.email == "admin@bazarcycle.bd").first()
        if existing_admin:
            print(" Database already seeded. Skipping initial seed.")
            return

        print("👤 Creating demo users for all three roles...")
        hashed_pw = get_password_hash("BazarCycle2026!")

        admin_user = Profile(
            name="Rahim Ahmed (Admin)",
            email="admin@bazarcycle.bd",
            phone="+8801711000001",
            role="ADMIN",
            hashed_password=hashed_pw
        )
        db.add(admin_user)
        db.flush()

        manager_user = Profile(
            name="Tariqul Islam (Karwan Bazar Manager)",
            email="manager@bazarcycle.bd",
            phone="+8801711000002",
            role="MARKET_MANAGER",
            hashed_password=hashed_pw
        )
        db.add(manager_user)
        db.flush()

        manager_user2 = Profile(
            name="Nasreen Akhter (Jatrabari Manager)",
            email="manager2@bazarcycle.bd",
            phone="+8801711000003",
            role="MARKET_MANAGER",
            hashed_password=hashed_pw
        )
        db.add(manager_user2)
        db.flush()

        collector_user = Profile(
            name="Salam Miah (Green Cycle Logistics)",
            email="collector@bazarcycle.bd",
            phone="+8801711000004",
            role="COLLECTOR",
            hashed_password=hashed_pw
        )
        db.add(collector_user)
        db.flush()

        collector_user2 = Profile(
            name="Faruk Hossain (Dhaka Bio-Recyclers)",
            email="collector2@bazarcycle.bd",
            phone="+8801711000005",
            role="COLLECTOR",
            hashed_password=hashed_pw
        )
        db.add(collector_user2)
        db.flush()

        print("📦 Creating standard waste categories...")
        categories_data = [
            {
                "name": "Vegetable Waste",
                "description": "Surplus greens, root discards, cabbage leaves, cauliflower stalks, and vegetable peelings from market stalls.",
                "waste_type": "Organic",
                "resource_pathway": "Composting",
                "estimated_value_per_kg": Decimal("15.00"),
                "recyclable": False,
                "organic": True
            },
            {
                "name": "Fruit Waste",
                "description": "Overripe, damaged, or unmarketable fruits (mango, banana, papaya, jackfruit scraps) suitable for bio-fermentation.",
                "waste_type": "Organic",
                "resource_pathway": "Composting",
                "estimated_value_per_kg": Decimal("12.00"),
                "recyclable": False,
                "organic": True
            },
            {
                "name": "Fish Waste",
                "description": "Fish scales, entrails, fins, and heads from market fish-mongering stalls for specialized fish-meal and bio-organic fertilizer.",
                "waste_type": "Organic",
                "resource_pathway": "Organic/Fertilizer Pathway",
                "estimated_value_per_kg": Decimal("25.00"),
                "recyclable": False,
                "organic": True
            },
            {
                "name": "Plastic",
                "description": "Rigid packaging, PET beverage bottles, polythene wraps, and bulk HDPE vegetable crates.",
                "waste_type": "Recyclable",
                "resource_pathway": "Recycling",
                "estimated_value_per_kg": Decimal("35.00"),
                "recyclable": True,
                "organic": False
            },
            {
                "name": "Paper/Cardboard",
                "description": "Corrugated produce transport cartons, paper liners, and clean packaging boards.",
                "waste_type": "Recyclable",
                "resource_pathway": "Paper Recycling",
                "estimated_value_per_kg": Decimal("18.00"),
                "recyclable": True,
                "organic": False
            },
            {
                "name": "Other",
                "description": "Mixed or unclassified market residuals requiring secondary sorting before authorized sanitary disposal.",
                "waste_type": "Mixed",
                "resource_pathway": "Responsible Disposal",
                "estimated_value_per_kg": Decimal("5.00"),
                "recyclable": False,
                "organic": False
            }
        ]

        cat_map = {}
        for cdata in categories_data:
            cat = WasteCategory(**cdata)
            db.add(cat)
            db.flush()
            cat_map[cat.name] = cat

        print("🏪 Creating demo markets in Dhaka...")
        market1 = Market(
            name="Karwan Bazar Demo Market",
            location="Tejgaon, Dhaka 1215",
            area="Karwan Bazar / Central Dhaka",
            manager_id=manager_user.id,
            contact_phone="+8801711000002",
            status="ACTIVE"
        )
        db.add(market1)
        db.flush()

        market2 = Market(
            name="Jatrabari Krishi Bazar Demo Market",
            location="Jatrabari, Dhaka 1204",
            area="Jatrabari / South Dhaka",
            manager_id=manager_user2.id,
            contact_phone="+8801711000003",
            status="ACTIVE"
        )
        db.add(market2)
        db.flush()

        market3 = Market(
            name="Mirpur 1 Municipal Bazar Demo Market",
            location="Mirpur 1, Dhaka 1216",
            area="Mirpur / North Dhaka",
            manager_id=None,
            contact_phone="+8801711000099",
            status="ACTIVE"
        )
        db.add(market3)
        db.flush()

        print("📊 Creating realistic demo waste records, pickups, and impact...")
        now = datetime.now(timezone.utc)
        today = date.today()

        # 1. Collected vegetable waste batch (Already recovered)
        w1 = WasteRecord(
            market_id=market1.id,
            category_id=cat_map["Vegetable Waste"].id,
            quantity_kg=Decimal("280.00"),
            description="Morning fresh vegetable trimmings and cabbage leaves from shed 4.",
            record_date=today - timedelta(days=2),
            status="COLLECTED",
            recommended_pathway="Composting",
            estimated_value=Decimal("4200.00"), # 280 * 15
            created_by=manager_user.id
        )
        db.add(w1)
        db.flush()

        p1 = PickupRequest(
            waste_record_id=w1.id,
            market_id=market1.id,
            collector_id=collector_user.id,
            status="COLLECTED",
            requested_at=now - timedelta(days=2),
            accepted_at=now - timedelta(days=2, hours=-1),
            collected_at=now - timedelta(days=2, hours=-3),
            notes="Collected via motorized van for Dhaka Composting Plant."
        )
        db.add(p1)
        db.flush()

        i1 = ImpactRecord(
            market_id=market1.id,
            waste_record_id=w1.id,
            quantity_recovered_kg=Decimal("280.00"),
            quantity_recycled_kg=Decimal("0.00"),
            quantity_composted_kg=Decimal("280.00"),
            estimated_value=Decimal("4200.00"),
            co2_impact_estimate=Decimal("126.00"), # 280 * 0.45
            recorded_at=now - timedelta(days=2, hours=-3)
        )
        db.add(i1)

        # 2. Collected plastic bottles & packaging
        w2 = WasteRecord(
            market_id=market1.id,
            category_id=cat_map["Plastic"].id,
            quantity_kg=Decimal("65.00"),
            description="Sorted HDPE vegetable crates and clear PET bottles from produce unloading dock.",
            record_date=today - timedelta(days=1),
            status="COLLECTED",
            recommended_pathway="Recycling",
            estimated_value=Decimal("2275.00"), # 65 * 35
            created_by=manager_user.id
        )
        db.add(w2)
        db.flush()

        p2 = PickupRequest(
            waste_record_id=w2.id,
            market_id=market1.id,
            collector_id=collector_user.id,
            status="COLLECTED",
            requested_at=now - timedelta(days=1),
            accepted_at=now - timedelta(days=1, hours=-1),
            collected_at=now - timedelta(days=1, hours=-2),
            notes="Plastic bails collected for mechanical shredding and washing."
        )
        db.add(p2)
        db.flush()

        i2 = ImpactRecord(
            market_id=market1.id,
            waste_record_id=w2.id,
            quantity_recovered_kg=Decimal("65.00"),
            quantity_recycled_kg=Decimal("65.00"),
            quantity_composted_kg=Decimal("0.00"),
            estimated_value=Decimal("2275.00"),
            co2_impact_estimate=Decimal("78.00"), # 65 * 1.2
            recorded_at=now - timedelta(days=1, hours=-2)
        )
        db.add(i2)

        # 3. Accepted fish waste batch (Currently in transit by collector)
        w3 = WasteRecord(
            market_id=market1.id,
            category_id=cat_map["Fish Waste"].id,
            quantity_kg=Decimal("95.00"),
            description="Afternoon fish market cleaning discards packed in insulated barrels.",
            record_date=today,
            status="ACCEPTED",
            recommended_pathway="Organic/Fertilizer Pathway",
            estimated_value=Decimal("2375.00"), # 95 * 25
            created_by=manager_user.id
        )
        db.add(w3)
        db.flush()

        p3 = PickupRequest(
            waste_record_id=w3.id,
            market_id=market1.id,
            collector_id=collector_user.id,
            status="ACCEPTED",
            requested_at=now - timedelta(hours=3),
            accepted_at=now - timedelta(hours=1),
            notes="En route to collection point at Gate 2."
        )
        db.add(p3)

        # 4. Available cardboard batch ready for pickup demonstration!
        w4 = WasteRecord(
            market_id=market1.id,
            category_id=cat_map["Paper/Cardboard"].id,
            quantity_kg=Decimal("120.00"),
            description="Flattened fruit cartons and wholesale packaging boxes stacked at gate 3.",
            record_date=today,
            status="AVAILABLE",
            recommended_pathway="Paper Recycling",
            estimated_value=Decimal("2160.00"), # 120 * 18
            created_by=manager_user.id
        )
        db.add(w4)
        db.flush()

        p4 = PickupRequest(
            waste_record_id=w4.id,
            market_id=market1.id,
            status="AVAILABLE",
            requested_at=now - timedelta(minutes=45),
            notes="Dry bundled boxes ready for direct van loading."
        )
        db.add(p4)

        # 5. Jatrabari demo waste record (Collected)
        w5 = WasteRecord(
            market_id=market2.id,
            category_id=cat_map["Fruit Waste"].id,
            quantity_kg=Decimal("190.00"),
            description="Summer seasonal fruit waste (papaya and melon skins).",
            record_date=today - timedelta(days=1),
            status="COLLECTED",
            recommended_pathway="Composting",
            estimated_value=Decimal("2280.00"), # 190 * 12
            created_by=manager_user2.id
        )
        db.add(w5)
        db.flush()

        p5 = PickupRequest(
            waste_record_id=w5.id,
            market_id=market2.id,
            collector_id=collector_user2.id,
            status="COLLECTED",
            requested_at=now - timedelta(days=1),
            accepted_at=now - timedelta(days=1, hours=-1),
            collected_at=now - timedelta(days=1, hours=-3),
            notes="Transferred to Jatrabari community vermi-compost plant."
        )
        db.add(p5)
        db.flush()

        i5 = ImpactRecord(
            market_id=market2.id,
            waste_record_id=w5.id,
            quantity_recovered_kg=Decimal("190.00"),
            quantity_recycled_kg=Decimal("0.00"),
            quantity_composted_kg=Decimal("190.00"),
            estimated_value=Decimal("2280.00"),
            co2_impact_estimate=Decimal("76.00"),
            recorded_at=now - timedelta(days=1, hours=-3)
        )
        db.add(i5)

        db.commit()

        # Compute initial sustainability scores
        calculate_market_sustainability_score(db, market1.id)
        calculate_market_sustainability_score(db, market2.id)

        print("✨ Demo data seeding completed successfully!")
        print("--------------------------------------------------")
        print("Demo Credentials:")
        print("Admin:          admin@bazarcycle.bd      / BazarCycle2026!")
        print("Market Manager: manager@bazarcycle.bd    / BazarCycle2026!")
        print("Collector:      collector@bazarcycle.bd  / BazarCycle2026!")
        print("--------------------------------------------------")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
