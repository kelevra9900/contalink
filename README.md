# Invoice Consultation System

This repository contains the full-stack codebase for the invoice consultation web application. The project is organized as a monorepo containing a React + TypeScript frontend and a Python + FastAPI backend.

---

## Repository Structure

*   `/frontend`: Single Page Application built using React, TypeScript, Vite, Axios, and CSS Modules.
*   `/backend`: REST API service built with FastAPI, SQLAlchemy, Redis caching, and background scheduled email job reporting.
*   `.github/workflows/`: CI pipelines automate code validation and test suite execution.

---

## 🚀 Setup & Execution Guide

### Prerequisite Ports
Ensure ports `8000` (FastAPI backend) and `5173` (Vite dev server) are free on your system.

---

### 1. Backend Setup (FastAPI)

1.  Navigate into the backend directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Configure Environment Variables:
    Create a `.env` file from the provided `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and fill in any required details (e.g. SMTP credentials for the daily email scheduler job). The default Postgres database parameters are already pre-configured to connect to the developer test database.

5.  Run the Backend Server:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```
    Once running, you can explore the fully documented interactive Swagger API documentation at:
    [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Setup (React + TS)

1.  Navigate into the frontend directory:
    ```bash
    cd ../frontend
    ```

2.  Install packages:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file specifying the API endpoint path:
    ```bash
    echo "VITE_API_BASE_URL=http://localhost:8000" > .env
    ```

4.  Run Vite Development Server:
    ```bash
    npm run dev
    ```
    Access the portal directly at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Test Suites

### Backend Tests
Execute unit and integration tests from the root or the `backend/` directory:
```bash
# From root workspace
PYTHONPATH=backend backend/venv/bin/pytest backend/tests/ -v
```

### Frontend Tests
Execute component unit tests from the `frontend/` directory:
```bash
# From frontend folder
npm run test
```

---

## 🤖 CI/CD Automation Pipelines

Pipelines are orchestrated through GitHub Actions and execute automatically on pushes or Pull Requests:

*   **Backend CI Workflow** (`.github/workflows/backend-ci.yml`): Setting up Python environment, installing dependencies, and running pytest suites.
*   **Frontend CI Workflow** (`.github/workflows/frontend-ci.yml`): Bootstrapping Node.js, running eslint linting, running vitest tests, and validating successful production compilation build.
