import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app
from app.services.waste_recommendation_service import recommendation_engine
from app.database import SessionLocal
from app.models.waste import WasteCategory, WasteRecord
from app.models.pickup import PickupRequest
from app.models.markets import Market
from app.models.profiles import Profile
from app.services.pickup_service import accept_pickup, complete_pickup_collection
from app.services.sustainability_score_service import calculate_market_sustainability_score

client = TestClient(app)

# 1. Recommendation Engine Unit Tests
def test_recommendation_vegetable_waste():
    rec = recommendation_engine.get_recommendation("Vegetable Waste", 150.0)
    assert rec["category"] == "Vegetable Waste"
    assert rec["recommended_pathway"] == "Composting"
    assert rec["unit_rate_bdt"] == 15.0
    assert rec["estimated_value"] == 2250.0 # 150 * 15
    assert "composting" in rec["explanation"].lower()
    assert rec["organic"] is True

def test_recommendation_fruit_waste():
    rec = recommendation_engine.get_recommendation("Fruit Waste", 100.0)
    assert rec["recommended_pathway"] == "Composting"
    assert rec["estimated_value"] == 1200.0

def test_recommendation_fish_waste():
    rec = recommendation_engine.get_recommendation("Fish Waste", 80.0)
    assert rec["recommended_pathway"] == "Organic/Fertilizer Pathway"
    assert rec["estimated_value"] == 2000.0 # 80 * 25

def test_recommendation_plastic():
    rec = recommendation_engine.get_recommendation("Plastic", 50.0)
    assert rec["recommended_pathway"] == "Recycling"
    assert rec["recyclable"] is True
    assert rec["estimated_value"] == 1750.0 # 50 * 35

def test_recommendation_paper_cardboard():
    rec = recommendation_engine.get_recommendation("Paper/Cardboard", 200.0)
    assert rec["recommended_pathway"] == "Paper Recycling"
    assert rec["estimated_value"] == 3600.0 # 200 * 18

def test_recommendation_other():
    rec = recommendation_engine.get_recommendation("Other", 30.0)
    assert rec["recommended_pathway"] == "Responsible Disposal"

def test_recommendation_validation_zero_negative():
    with pytest.raises(ValueError):
        recommendation_engine.get_recommendation("Vegetable Waste", 0)
    with pytest.raises(ValueError):
        recommendation_engine.get_recommendation("Vegetable Waste", -10)


# 2. Authentication API Tests
def test_login_valid_market_manager():
    response = client.post("/api/auth/login", json={
        "email": "manager@bazarcycle.bd",
        "password": "BazarCycle2026!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "MARKET_MANAGER"
    assert data["user"]["email"] == "manager@bazarcycle.bd"

def test_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "email": "manager@bazarcycle.bd",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401

def test_register_and_login_new_user():
    email = "test_collector_unit@bazarcycle.bd"
    reg_response = client.post("/api/auth/register", json={
        "name": "Test Collector",
        "email": email,
        "phone": "+8801999999999",
        "role": "COLLECTOR",
        "password": "SecurePassword123!"
    })
    # If already created, skip or verify 201/400
    assert reg_response.status_code in [201, 400]

    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    assert login_res.json()["user"]["role"] == "COLLECTOR"


# 3. Waste API & Validation Tests
def test_waste_recommend_api_endpoint():
    res = client.post("/api/waste/recommend", json={
        "category_name": "Vegetable Waste",
        "quantity_kg": 150.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["category"] == "Vegetable Waste"
    assert data["recommended_pathway"] == "Composting"
    assert data["estimated_value"] == 2250.0

def test_waste_validation_rejects_negative_or_zero():
    res_zero = client.post("/api/waste/recommend", json={
        "category_name": "Vegetable Waste",
        "quantity_kg": 0.0
    })
    assert res_zero.status_code == 422 # Pydantic gt=0 validation error

    res_negative = client.post("/api/waste/recommend", json={
        "category_name": "Vegetable Waste",
        "quantity_kg": -25.0
    })
    assert res_negative.status_code == 422


# 4. End-to-End Workflow & Concurrency Acceptance Guard Test
def test_pickup_and_concurrency_workflow():
    db = SessionLocal()
    try:
        # Get market manager & collectors
        manager = db.query(Profile).filter(Profile.role == "MARKET_MANAGER").first()
        collector1 = db.query(Profile).filter(Profile.role == "COLLECTOR").first()
        collector2 = db.query(Profile).filter(Profile.email == "collector2@bazarcycle.bd").first()
        market = db.query(Market).first()
        cat = db.query(WasteCategory).filter(WasteCategory.name == "Vegetable Waste").first()

        # Step 1: Create a test waste record (150 KG)
        waste = WasteRecord(
            market_id=market.id,
            category_id=cat.id,
            quantity_kg=Decimal("150.00"),
            description="Competition Demo 150 KG Vegetable Waste Batch",
            status="AVAILABLE",
            recommended_pathway="Composting",
            estimated_value=Decimal("2250.00"),
            created_by=manager.id
        )
        db.add(waste)
        db.commit()
        db.refresh(waste)

        # Step 2: Request pickup
        pickup = PickupRequest(
            waste_record_id=waste.id,
            market_id=market.id,
            status="AVAILABLE"
        )
        db.add(pickup)
        db.commit()
        db.refresh(pickup)

        assert pickup.status == "AVAILABLE"

        # Step 3: First collector accepts
        accepted_pickup = accept_pickup(db, pickup.id, collector1.id)
        assert accepted_pickup.status == "ACCEPTED"
        assert accepted_pickup.collector_id == collector1.id

        # Step 4: Second collector attempts to accept the SAME pickup (Must fail with 409 Conflict)
        with pytest.raises(Exception) as excinfo:
            accept_pickup(db, pickup.id, collector2.id)
        assert "409" in str(excinfo.value) or "no longer available" in str(excinfo.value).lower()

        # Step 5: Collector 1 completes collection -> Impact generated
        completed_pickup = complete_pickup_collection(db, pickup.id, collector1.id, "Demo collection completed")
        assert completed_pickup.status == "COLLECTED"
        assert completed_pickup.waste_record.status == "COLLECTED"

        # Step 6: Verify ImpactRecord was automatically generated
        assert completed_pickup.waste_record.impact_record is not None
        assert float(completed_pickup.waste_record.impact_record.quantity_recovered_kg) == 150.0
        assert float(completed_pickup.waste_record.impact_record.quantity_composted_kg) == 150.0
        assert float(completed_pickup.waste_record.impact_record.estimated_value) == 2250.0

        # Step 7: Verify Sustainability score recalculates
        score_res = calculate_market_sustainability_score(db, market.id)
        assert score_res["total_score"] > 0
        assert score_res["score_label"] in ["Needs Improvement", "Developing", "Good", "Excellent"]

    finally:
        db.close()


# 5. Public Summary API Test
def test_public_impact_summary():
    res = client.get("/api/impact/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_waste_registered_kg" in data
    assert "total_waste_recovered_kg" in data
    assert "total_estimated_value_bdt" in data
    assert "co2_disclaimer" in data
