
🚦 Indore Route Pathfinder
React Node.js MongoDB

A simple web application to plan routes between stations in Indore using Dijkstra's Algorithm

🚀 Live Demo

✨ What it does
📍 Add Stations: Create new stations/locations
🔗 Connect Stations: Link stations with distance and cost
🧭 Find Routes: Calculate shortest path by distance OR cheapest path by cost
📊 View All: See all stations and connections in one place
🛠️ Tech Stack
Frontend: React.js, Tailwind CSS
Backend: Node.js, Express.js
Database: MongoDB
Algorithm: Dijkstra's Shortest Path
🏃‍♂️ Quick Start


🎯 How to Use
Add Stations: Enter station name and click "Add Station"
Connect Stations: Select two stations, enter distance (km) and cost (₹), click "Add Connection"
Find Route: Choose start/end stations, select "Distance" or "Cost" optimization, click "Find Route"
View Results: See the optimal path with total distance and cost
📁 Project Structure
indore-route-planner/
├── frontend/          # React app
│   ├── src/
│   │   └── App.jsx    # Main component
│   └── package.json
├── backend/           # Express API
│   ├── models/        # MongoDB schemas  
│   ├── routes/        # API routes
│   ├── utils/         # Dijkstra algorithm
│   └── server.js      # Main server
└── README.md
🔌 API Endpoints
GET    /api/stations     # Get all stations
POST   /api/stations     # Add new station
GET    /api/connections  # Get all connections  
POST   /api/connections  # Add new connection
POST   /api/route        # Calculate optimal route
🧮 Algorithm
Uses Dijkstra's Algorithm to find:

Shortest Distance: Minimum total kilometers
Cheapest Cost: Minimum total rupees
