# Invoice Consultation System

This repository contains the full-stack codebase for the invoice consultation web application. The project is organized as a monorepo containing a React + TypeScript frontend and a Python + FastAPI backend.

---

## Repository Structure

*   `/frontend`: Single Page Application built using React, TypeScript, Vite, Axios, and CSS Modules.
*   `/backend`: REST API service built with FastAPI, SQLAlchemy, Redis caching, and background scheduled email job reporting.
*   `.github/workflows/`: CI pipelines automate code validation and test suite execution.

---

## 🚀 Setup & Execution Guide (Root Orchestration)

Instead of manually navigating and running commands in each folder, you can run all setups and execution commands directly from the repository root directory using the orchestrator scripts.

### 1. Installation
Install both frontend and backend dependencies with a single command:
```bash
npm run install:all
```
*(This command runs `pnpm install` in the frontend and creates a Python virtual environment and installs `requirements.txt` in the backend).*

### 2. Environment Configuration
* **Backend**: Create a `.env` file inside the `backend/` directory:
  ```bash
  cp backend/.env.example backend/.env
  ```
  *(Fill in any custom database, cache or SMTP configurations).*
* **Frontend**: Create a `.env` file inside the `frontend/` directory:
  ```bash
  echo "VITE_API_BASE_URL=http://localhost:8000" > frontend/.env
  ```

### 3. Running the Application
Launch both backend and frontend development servers concurrently:
```bash
npm run dev
```
* Access the React frontend at: [http://localhost:5173](http://localhost:5173)
* Access the Swagger backend API docs at: [http://localhost:8000/docs](http://localhost:8000/docs)

*Note: You can also run them individually using `npm run dev:frontend` or `npm run dev:backend`.*

---

## 🧪 Running Test Suites

You can execute tests easily from the root workspace:

### Run All Tests (Frontend + Backend)
```bash
npm run test
```

### Run All Tests with Coverage Report
```bash
npm run test:coverage
```

### Run Tests Individually
* **Backend pytest**: `npm run test:backend`
* **Frontend vitest**: `npm run test:frontend`

---

## 🤝 Local Git Hooks (Best Practices)
A local Git `pre-push` hook is automatically configured during package installation. Every time you try to run `git push`, the hook will execute `npm run test`. If any test fails, the push will be safely aborted.

---

## 🤖 CI/CD Automation Pipelines

Pipelines are orchestrated through GitHub Actions and execute automatically on pushes or Pull Requests:

*   **Backend CI Workflow** (`.github/workflows/backend-ci.yml`): Sets up the Python environment, installs dependencies, and runs the pytest suite.
*   **Frontend CI Workflow** (`.github/workflows/frontend-ci.yml`): Bootstraps Node.js, runs eslint, vitest tests, and validates production build compilation.
*   **Continuous Deployment Workflow** (`.github/workflows/deploy.yml`):
    1. Verifies if AWS production deployment secrets are loaded.
    2. Runs all frontend and backend tests in parallel.
    3. Dockerizes (builds Docker images) the frontend and backend to check image integrity.
    4. Deploys services to the AWS EC2 instance using SSH if AWS credentials exist. If credentials do not exist, it completes the pipeline cleanly without error.
