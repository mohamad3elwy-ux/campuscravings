Campus Cravings - Project scaffold

Quick start (Linux):
1. Install dependencies:
   sudo apt-get update
   sudo apt-get install -y g++ cmake libsqlite3-dev

2. Download single-file headers:
   - nlohmann/json.hpp -> place into backend/ include path
   - httplib.h -> place into backend/ include path

   (Or put them next to main.cpp and include with #include "httplib.h" #include "json.hpp")

3. Create database:
   sqlite3 database/campus_cravings.db < database/schema.sql

4. Build server:
   cd backend
   mkdir build && cd build
   cmake ..
   make
   ./campus-server

5. Open frontend:
   Open frontend/index.html in browser (or serve with a simple static server):
   python3 -m http.server --directory frontend 8000
   Then open http://localhost:8000

Notes:
- This prototype stores plain-text passwords (for simplicity). Replace with hashing (bcrypt or salted sha256) before real use.
- Ensure CORS if you host frontend on different port (add CORS headers in server).
- For production, add HTTPS, input validation, rate limits, and sanitized queries.
