# Local Development & Deployment Guide — CareerBridge AI

## Prerequisites
- Node.js 20+
- Python 3.12+ (for running native Django backend workers)
- Redis server (optional for distributed Celery tasks)
- MongoDB Atlas cluster URL or local MongoDB instance

---

## 1. Quick Start (All-in-One Full-Stack Mode)
This repository includes a unified full-stack server running Express with Vite dev middleware on port 3000, serving the complete REST API (`/api/v1/*`) alongside the React client with hot-loading.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Set your GEMINI_API_KEY in .env or via AI Studio Secrets

# 3. Launch the full-stack platform
npm run dev
```
Open `http://localhost:3000` to interact with the full dashboard, discover opportunities, generate AI messages, and track applications.

---

## 2. Running the Django Monorepo Backend
For teams deploying via Django + Celery + MongoDB Atlas:

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install Python requirements
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Seed verified opportunity feeds and mentor directories
python manage.py seed_verified_data

# Start Django development server on port 8000
python manage.py runserver 0.0.0.0:8000
```

---

## 3. Running Celery Automation Workers
```bash
# In a separate terminal with active venv:
celery -A celery_app worker --loglevel=info

# Start Celery Beat scheduler for recurring tasks
celery -A celery_app beat --loglevel=info
```

---

## 4. Docker Compose Deployment
To run MongoDB, Redis, Django API, Celery worker, and React frontend with a single command:

```bash
docker-compose up --build
```
This spins up:
- `careerbridge-web`: Frontend & Gateway (port 3000)
- `careerbridge-api`: Django REST Framework (port 8000)
- `careerbridge-worker`: Celery Background Worker
- `careerbridge-redis`: Redis Message Broker (port 6379)
- `careerbridge-mongo`: MongoDB (port 27017)
