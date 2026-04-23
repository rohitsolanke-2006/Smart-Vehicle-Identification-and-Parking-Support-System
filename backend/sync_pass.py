from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password

db = SessionLocal()
users = db.query(User).all()
for u in users:
    u.password_hash = hash_password("testpass123")
db.commit()
print("Successfully synced all passwords to 'testpass123'")
db.close()
