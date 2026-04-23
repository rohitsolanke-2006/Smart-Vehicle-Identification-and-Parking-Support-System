import os

os.makedirs("d:/SY B.Tech/SEM 4/SE CP/diagrams/plantuml", exist_ok=True)

class_puml = """@startuml
skinparam classAttributeIconSize 0

class User {
  - userId: int
  - name: String
  - email: String
  - passwordHash: String
  - role: String
  + login(): boolean
  + logout(): void
}

class Student {
  - studentId: int
  + viewAvailability(): List
  + getRecommendation(): String
}

class SecurityGuard {
  - guardId: int
  - shift: String
  + recordEntry(regNo, zone): void
  + recordExit(regNo): void
  + searchVehicle(regNo): Vehicle
  + markMisParked(regNo): void
}

class Manager {
  - managerId: int
  - department: String
  + viewLogs(): List
  + analyzeTraffic(): Report
  + monitorMisParked(): List
}

class Vehicle {
  - vehicleId: int
  - regNumber: String
  - zoneName: String
  - entryTime: DateTime
  - isMisParked: boolean
  + markMisParked(): void
  + getDetails(): String
}

class ParkingZone {
  - zoneId: int
  - zoneName: String
  - capacity: int
  - occupied: int
  - isActive: boolean
  + getAvailableSpace(): int
  + getOccupancyPercent(): float
  + getStatus(): String
}

class ParkingLog {
  - logId: int
  - zoneName: String
  - regNumber: String
  - action: String
  - timestamp: DateTime
  + getLogDetails(): String
}

class RecommendationEngine {
  - zones: List<ParkingZone>
  + calculateFreeSpace(): Map
  + getBestZone(): String
  + getMessage(): String
}

class Database {
  - connection: String
  - dbName: String
  + saveRecord(): void
  + fetchData(): ResultSet
  + deleteRecord(): void
}

User <|-- Student
User <|-- SecurityGuard
User <|-- Manager

Student ..> Vehicle : uses
SecurityGuard ..> Vehicle : uses
Manager ..> ParkingLog : views

ParkingZone "1" -- "*" Vehicle : contains
ParkingZone "1" -- "*" ParkingLog : has

RecommendationEngine ..> ParkingZone : reads
Vehicle ..> Database : stores
ParkingZone ..> Database : stores
ParkingLog ..> Database : stores
@enduml"""


object_puml = """@startuml
object "student1: Student" as S1 {
  userId = 201
  name = "Riya Patel"
  email = "riya@vit.edu"
  role = "student"
}

object "guard1: SecurityGuard" as G1 {
  userId = 301
  name = "Suresh Kumar"
  email = "guard@vit.edu"
  shift = "Morning"
}

object "manager1: Manager" as M1 {
  userId = 401
  name = "Dr. Anita Desai"
  department = "Administration"
}

object "zone1: ParkingZone" as Z1 {
  zoneId = 1
  zoneName = "Main Gate Parking"
  capacity = 50
  occupied = 28
  status = "GREEN"
}

object "zone2: ParkingZone" as Z2 {
  zoneId = 2
  zoneName = "Auditorium Parking"
  capacity = 30
  occupied = 26
  status = "RED"
}

object "vehicle1: Vehicle" as V1 {
  regNumber = "MH12AB1234"
  zoneName = "Main Gate Parking"
  entryTime = "09:15 AM"
  isMisParked = false
}

object "vehicle2: Vehicle" as V2 {
  regNumber = "MH12CD5678"
  zoneName = "Auditorium Parking"
  entryTime = "10:30 AM"
  isMisParked = true
}

object "rec1: RecommendationEngine" as R1 {
  bestZone = "Main Gate Parking"
  freeSpace = 22
  message = "Plenty of space available"
}

object "log1: ParkingLog" as L1 {
  action = "ENTRY"
  regNumber = "MH12AB1234"
  timestamp = "09:15 AM"
}

S1 --> Z2 : views availability
S1 --> R1 : gets recommendation
G1 --> Z1 : records entry into
G1 --> V2 : marks mis-parked
M1 --> L1 : views logs
M1 --> V2 : monitors
Z1 --> V1 : contains
Z2 --> V2 : contains
R1 --> Z1 : reads zone
L1 --> V1 : logs
@enduml
"""


usecase_puml = """@startuml
left to right direction
actor "Student" as student
actor "Security Guard" as guard
actor "Manager" as manager
actor "Database System" as db

rectangle "Smart Campus Vehicle Parking System" {
  usecase "Login / Authenticate" as UC1
  usecase "View Parking Availability" as UC2
  usecase "Get Parking Recommendation" as UC3
  
  usecase "Record Vehicle Entry" as UC4
  usecase "Validate Zone Capacity" as UC4a
  usecase "Update Zone Occupancy" as UC4b
  
  usecase "Record Vehicle Exit" as UC5
  usecase "Search Vehicle by Registration" as UC6
  usecase "Mark Vehicle as Mis-Parked" as UC7
  
  usecase "View Historical Logs" as UC8
  usecase "Log Entry/Exit Event" as UC9
  usecase "Analyze Traffic Pattern" as UC10
  usecase "Monitor Mis-Parked Vehicles" as UC11
}

student --> UC1
student --> UC2
student --> UC3

guard --> UC1
guard --> UC4
guard --> UC5
guard --> UC6
guard --> UC7

manager --> UC1
manager --> UC8
manager --> UC10
manager --> UC11

UC4 ..> UC4a : <<include>>
UC4 ..> UC4b : <<include>>
UC4 ..> UC9 : <<include>>
UC5 ..> UC4b : <<include>>
UC5 ..> UC9 : <<include>>

UC4a --> db
UC4b --> db
UC9 --> db
UC8 --> db
UC10 --> db
@enduml"""


sequence_puml = """@startuml
autonumber
actor "Security Guard" as Guard
participant "Frontend UI" as UI
participant "Vehicle API" as API
participant "ParkingZone DB" as ZoneDB
participant "Vehicle DB" as VehDB
participant "ParkingLog DB" as LogDB

Guard -> UI : Enters Reg No & Zone
UI -> API : POST /api/vehicles/entry
activate API

API -> ZoneDB : checkCapacity(zoneId)
activate ZoneDB
ZoneDB --> API : capacityAvailable
deactivate ZoneDB

alt If Capacity Full
    API --> UI : 400 Error: Zone Full
    UI --> Guard : Shows Error Notice
else If Capacity Available
    API -> VehDB : save(regNo, zoneId, entryTime)
    activate VehDB
    VehDB --> API : vehicleId
    deactivate VehDB
    
    API -> ZoneDB : incrementOccupancy(zoneId)
    activate ZoneDB
    ZoneDB --> API : success
    deactivate ZoneDB
    
    API -> LogDB : createLog(action="ENTRY", regNo)
    activate LogDB
    LogDB --> API : success
    deactivate LogDB
    
    API --> UI : 200 OK: Entry Recorded
    UI --> Guard : Shows Success Toast
end
deactivate API
@enduml"""


activity_puml = """@startuml
|Security Guard|
start
:Login to Guard Interface;
:Select "Vehicle Entry";
:Input Registration Number;
:Select target Parking Zone;
:Click Submit;

|Backend System|
:Receive Request;
:Query Zone Capacity;
if (Is Zone Full?) then (yes)
  :Return Capacity Error;
  |Security Guard|
  :Display "Zone Full" Error;
  :Ask to select different zone;
  stop
else (no)
  |Backend System|
  :Create Vehicle Record;
  :Increment Zone Occupied Count;
  :Generate "ENTRY" Log Event;
  :Return Success Response;
  
  |Security Guard|
  :Display Success Toast;
  :Clear Form;
  stop
endif
@enduml"""


state_puml = """@startuml
[*] --> Arriving : Vehicle enters campus

state Arriving {
  [*] --> GateQueue
  GateQueue --> CheckingCredentials
}

Arriving --> Parked_Valid : Guard records Entry

state Parked_Valid {
  [*] --> OccupyingSpace
}

Parked_Valid --> MisParked_Flagged : Guard marks as Mis-parked

state MisParked_Flagged {
  [*] --> InvestigationPending
  InvestigationPending --> WarningIssued : Manager action
}

MisParked_Flagged --> Exited : Guard records Exit (clears flag)
Parked_Valid --> Exited : Guard records Exit

state Exited {
  [*] --> LogArchived
}

Exited --> [*]
@enduml"""


component_puml = """@startuml
package "Client Tier" {
  [React Frontend App] as UI
  [Axios / Fetch Client] as APIClient
  UI --> APIClient
}

package "Backend API Tier (FastAPI)" {
  [Auth Router] as Auth
  [Vehicle Router] as VehAPI
  [Zone Router] as ZoneAPI
  
  [Recommendation Engine] as RecEngine
  [JWT Auth Service] as JWTService
  
  VehAPI ..> JWTService : validates
  ZoneAPI ..> JWTService : validates
  ZoneAPI --> RecEngine : requests logic
}

package "Data Tier" {
  [SQLAlchemy ORM] as ORM
  database "MySQL / SQLite Database" as DB {
    [Users Table]
    [Zones Table]
    [Vehicles Table]
    [Logs Table]
  }
}

APIClient --> Auth : HTTP POST /login
APIClient --> VehAPI : HTTP POST/GET
APIClient --> ZoneAPI : HTTP GET

Auth --> ORM
VehAPI --> ORM
ZoneAPI --> ORM
RecEngine --> ORM

ORM --> DB : SQL Queries
@enduml"""


deployment_puml = """@startuml
node "Client Device" <<Mobile / Laptop>> {
    node "Browser" <<Execution Environment>> {
        artifact "Vite React SPA" <<artifact>>
    }
}

node "Web Server" <<Host>> {
    node "Uvicorn ASGI" <<Execution Environment>> {
        artifact "FastAPI Application" <<artifact>>
        component "Auth Module"
        component "Vehicle Module"
        component "Recommendation Engine"
    }
}

node "Database Server" <<Host>> {
    database "MySQL" <<Relational DB>> {
        artifact "campus_parking Schema" <<schema>>
    }
}

"Browser" -- "Uvicorn ASGI" : HTTPS (JSON/REST)
"Uvicorn ASGI" -- "MySQL" : TCP/IP (Port 3306)
@enduml"""


collaboration_puml = """@startuml
skinparam style strictuml
hide empty members

object ":SecurityGuard User" as guard
object ":Frontend UI" as ui
object ":Vehicle API" as api
object ":Zone Database" as zone
object ":Vehicle Database" as vdb
object ":Log Database" as ldb

guard -> ui : 1: Submit Entry (regNo, zoneId)
ui -> api : 2: POST /api/vehicles/entry
api -> zone : 3: check_capacity()
api -> vdb : 4: insert_vehicle()
api -> zone : 5: increment_occupancy()
api -> ldb : 6: create_entry_log()
api -> ui : 7: Error or Success response
ui -> guard : 8: Display Toast Notification
@enduml"""


diagrams = {
    "class.puml": class_puml,
    "object.puml": object_puml,
    "usecase.puml": usecase_puml,
    "sequence.puml": sequence_puml,
    "activity.puml": activity_puml,
    "state.puml": state_puml,
    "component.puml": component_puml,
    "deployment.puml": deployment_puml,
    "collaboration.puml": collaboration_puml,
}

for name, content in diagrams.items():
    with open(f"d:/SY B.Tech/SEM 4/SE CP/diagrams/plantuml/{name}", "w") as f:
        f.write(content)

print("Generated all 9 PlantUML files successfully!")
