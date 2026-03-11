"""Seed script — creates demo parking zones and users for local development."""
from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.parking_zone import ParkingZone
from app.services.auth_service import hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ---- Parking Zones (from Object Diagram) ----
    zones = [
        ParkingZone(zone_name="Main Gate Parking", capacity=50, occupied=0),
        ParkingZone(zone_name="Auditorium Parking", capacity=30, occupied=0),
        ParkingZone(zone_name="Hostel Parking", capacity=40, occupied=0),
    ]
    for zone in zones:
        existing = db.query(ParkingZone).filter(
            ParkingZone.zone_name == zone.zone_name
        ).first()
        if not existing:
            db.add(zone)
            print(f"  + Zone: {zone.zone_name} ({zone.capacity} slots)")

    # ---- Demo Users ----
    demo_users = [
        {
            "name": "Riya Patel",
            "email": "student@vit.edu",
            "password": "testpass123",
            "role": "student",
            "student_id": "STU201",
        },
        {
            "name": "Suresh Kumar",
            "email": "guard@vit.edu",
            "password": "testpass123",
            "role": "guard",
            "guard_id": "GRD01",
            "shift": "Morning",
        },
        {
            "name": "Dr. Anita Desai",
            "email": "manager@vit.edu",
            "password": "testpass123",
            "role": "manager",
            "manager_id": "MGR01",
            "department": "Computer Engg",
        },
        {
            "name": "Om Soma",
            "email": "om@vit.edu",
            "password": "testpass123",
            "role": "student",
            "student_id": "STU044",
        },
    ]
    for u in demo_users:
        if not db.query(User).filter(User.email == u["email"]).first():
            user = User(
                name=u["name"],
                email=u["email"],
                password_hash=hash_password(u["password"]),
                role=u["role"],
                student_id=u.get("student_id"),
                guard_id=u.get("guard_id"),
                shift=u.get("shift"),
                manager_id=u.get("manager_id"),
                department=u.get("department"),
            )
            db.add(user)
            print(f"  + User: {u['name']} ({u['role']}) — {u['email']}")

    db.commit()
    db.close()
    print("\n[OK] Seed complete!")


if __name__ == "__main__":
    print("[RUN] Seeding database...\n")
    seed()
