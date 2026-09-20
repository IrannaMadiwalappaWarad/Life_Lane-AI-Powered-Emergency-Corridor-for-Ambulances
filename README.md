# 🚑 LifeLane

## AI-Powered Emergency Corridor for Ambulances

> **Clear the way before the ambulance arrives.**

LifeLane is an AI-powered emergency response system designed to help ambulances move through heavy traffic by providing advance alerts to vehicles along the ambulance's route.

---

## Problem

Ambulances can lose valuable time in heavy traffic because drivers may notice them only when the ambulance is already nearby.

LifeLane provides advance, location-aware warnings to help vehicles clear the path before the ambulance arrives.

---

## Features

- 🚑 Real-time ambulance tracking
- 📍 GPS-based location tracking
- 🛣️ Dynamic emergency corridor
- 🚨 Advance vehicle alerts
- 🔊 Emergency notification sound
- 🤖 AI-assisted route and traffic prediction
- 📊 Traffic monitoring dashboard
- 🚗 Simulated nearby vehicles
- 🔐 Secure authentication

---

## How It Works

Ambulance GPS
      ↓
AWS Backend
      ↓
Route & Traffic Analysis
      ↓
Dynamic Emergency Corridor
      ↓
Nearby Vehicle Detection
      ↓
Emergency Alert
🛠️ Tech Stack
Frontend
React
TypeScript
HTML
CSS
Backend
Node.js
AWS Lambda
Amazon API Gateway
AWS Services
Amazon API Gateway
AWS Lambda
Amazon DynamoDB
Amazon S3
Amazon Bedrock
Amazon Cognito
🚀 Installation
1. Clone the Repository
2. Install Dependencies
npm install
3. Configure Environment Variables

Create a .env file in the project root.

VITE_API_URL=your_api_url
VITE_AWS_REGION=your_aws_region
VITE_AWS_USER_POOL_ID=your_user_pool_id
VITE_AWS_CLIENT_ID=your_client_id


▶️ Run the Application

Start the development server:

npm run dev

Open the URL in your browser.

🎮 How to Use
1. Start the Application

Run:

npm run dev

Open the application in your browser.

2. Start Ambulance Mode

Start the ambulance simulation.

The system tracks:

Location
Speed
Direction
Destination
3. Create the Emergency Corridor

The system creates a dynamic corridor based on the ambulance's movement and predicted route.

The corridor continuously updates as the ambulance moves.

4. Add Nearby Vehicles

Use the vehicle simulation to place vehicles around the ambulance.

Vehicles located along the emergency corridor can receive alerts.

5. Emergency Alert

The simulated driver receives an alert such as:

🚨 EMERGENCY VEHICLE APPROACHING

Ambulance approaching from 500 m.

Please clear the way.

An emergency notification sound is also triggered.

6. Monitor the Dashboard

The dashboard displays:

Ambulance location
Speed
Destination
ETA
Traffic conditions
Emergency status
Number of vehicles alerted
🧠 AI Component

AI-assisted processing can be used for:

Route prediction
Traffic analysis
ETA estimation
Congestion prediction
Identifying relevant vehicles for alerts

AI supports the emergency corridor system rather than replacing the core GPS and routing functionality.

☁️ AWS Architecture
                  Ambulance
                      │
                      ▼
                  GPS Data
                      │
                      ▼
               Amazon API Gateway
                      │
                      ▼
                  AWS Lambda
                 /     |      \
                ▼      ▼       ▼
          DynamoDB  Bedrock     S3
                │
                ▼
       Emergency Corridor
                │
                ▼
          Driver Alerts
🔐 Security

The system is designed to use authentication and authorization for ambulance users.

Sensitive credentials should be stored using environment variables and must never be committed to GitHub.

🧪 Demo Mode

The project includes a simulated environment for demonstrating the system without requiring real ambulances or connected vehicles.

Ambulance
    ↓
GPS Movement
    ↓
Route Prediction
    ↓
Emergency Corridor
    ↓
Nearby Vehicles
    ↓
Driver Alerts
⚠️ Disclaimer

LifeLane is a prototype developed for demonstration and hackathon purposes.

The prototype does not directly control real traffic signals or real vehicles.

Real-world deployment would require integration with authorized ambulance operators, traffic authorities, navigation platforms, and connected-vehicle systems.

🔮 Future Scope
Navigation platform integration
Connected vehicle integration
Authorized traffic-signal integration
Hospital integration
Fire and police emergency support
Real-time traffic data
Multi-city deployment
👥 Team

Built for Bharat Builds / First Commit.

💡 Vision

A system that warns the road ahead that an ambulance is coming, before the ambulance reaches it.

📜 License

This project is developed for educational, research, and hackathon purposes.

#BharatBuilds #AWS #FirstCommit #LifeLane #AI #SmartMobility #EmergencyResponse
