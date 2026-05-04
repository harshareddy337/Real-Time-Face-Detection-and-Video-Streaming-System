# 🎯 Real-Time Face Detection Video Streaming System

## 🚀 Overview

This project implements a real-time face detection pipeline using WebSockets, FastAPI, and React.

The system:

* Accepts live video frames
* Detects faces using OpenCV Haar Cascades
* Draws ROI bounding boxes
* Stores ROI data in PostgreSQL (in containerized environment) or SQLite (locally)
* Streams processed video back to client

---

## 🏗️ Architecture

Client → `/ws/upload` → Face Detection → Database
↓
`/ws/stream` → Processed Frames → Client

---

## 📡 API Endpoints

| Endpoint     | Description              |
| ------------ | ------------------------ |
| `/ws/upload` | Receives video frames    |
| `/ws/stream` | Streams processed frames |
| `/api/rois`  | Returns ROI data         |

---

## 🧠 Tech Stack

* FastAPI
* WebSockets
* OpenCV (Face Detection)
* Pillow (Image Processing)
* PostgreSQL / SQLite
* React.js
* Docker

---

## ⚙️ Setup (Run in 5 Minutes)

```bash
# For containerized deployment with PostgreSQL
docker compose up --build

# For local development with SQLite
cd Backend
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000

cd ../Frontend
npm install
npm start
```
docker-compose up
```

Open:
👉 http://localhost:3000

---

## 📊 Features

* Real-time face detection
* Bounding box ROI rendering
* Database persistence
* Live streaming via WebSockets
* Containerized architecture

---

## 🤖 AI Usage Disclosure

AI tools (ChatGPT) were used for:

* Code scaffolding
* Architecture guidance
* Debugging assistance

All implementation decisions and integration were validated and tested manually.

---

## 📌 Assumptions

* Only one face per frame
* Real-time webcam input
* Axis-aligned bounding box

---

## ✅ Evaluation Mapping

✔ API Design → 3 endpoints
✔ Architecture → separated layers
✔ DB Design → normalized schema
✔ Docker → containerized
✔ Error Handling → basic safeguards
✔ Documentation → complete setup guide

---
