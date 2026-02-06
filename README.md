# Cloud-Native Reselling Platform

A full-stack cloud-native reselling platform built with Spring Boot and React, designed to be scalable and containerized.

## 👥 Author

- **Samarth Kunwar**
-**Matriculation Number-890849**

## 🚀 Features

- **User Authentication**: Secure registration and login using JWT.
- **Item Management**: Users can post items for sale and browse available items.
- **Dynamic Dashboard**: Automatically filters out **purchased/sold items** for a cleaner browsing experience.
- **Cart**: Users can add items to their cart and purchase them.
- **Cloud storage**: Users can upload images for their items which are stored in Google Cloud Storage.
- **Admin Panel**: Dedicated dashboard for administrators to manage users and items.
- **Bootstrap Admin**: Automatically promote any user to Admin via environment variables.
- **Containerized**: Fully Dockerized backend, frontend, and database.
- **Cloud-Ready**: Optimized for deployment on Kubernetes (Google Cloud GKE).

## 🛠 Built With

- **Backend**: Java 17, Spring Boot, Spring Security, Hibernate, MySQL.
- **Frontend**: React (Vite), Tailwind CSS, Axios.
- **Database**: MySQL 8.0.
- **DevOps**: Docker, Docker Compose, Google Cloud Build, GKE , github actions  .

## ⚙️ Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) & Docker Compose
- Java 17 (for local backend dev)
- Node.js & npm (for local frontend dev)
- `kubectl` (if deploying to Kubernetes)

---

## ☁️ Complete GKE Deployment Guide

### 📋 Prerequisites

Before starting, ensure you have:
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and configured
- `kubectl` CLI installed
- Active GCP project with billing enabled
- Docker images built and pushed to Artifact Registry (or ready to build)

---

## 🚀 Step-by-Step Deployment

### Step 1: Set Your GCP Project

```powershell
# Set your project ID (replace with your actual project ID)
gcloud config set project resellplatform

# Verify project is set correctly
gcloud config get-value project
```

### Step 2: Enable Required GCP APIs

```powershell
# Enable necessary Google Cloud APIs
gcloud services enable container.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable storage.googleapis.com
```

### Step 3: Create Artifact Registry Repositories

```powershell
# Create repository for backend images
gcloud artifacts repositories create backend `
  --repository-format=docker `
  --location=europe-west3 `
  --description="Backend Docker images"

# Create repository for frontend images
gcloud artifacts repositories create frontend `
  --repository-format=docker `
  --location=europe-west3 `
  --description="Frontend Docker images"
```

### Step 4: Create Google Cloud Storage Bucket

```powershell
# Create bucket for storing item images
gcloud storage buckets create gs://resellplatform-images-v2 `
  --location=europe-west3 `
  --uniform-bucket-level-access

# Verify bucket creation
gcloud storage buckets list
```

### Step 5: Create Service Account for Storage Access

```powershell
# Create service account for backend to access GCS
gcloud iam service-accounts create storage-uploader `
  --display-name="Storage Uploader Service Account" `
  --description="Service account for backend to upload images to GCS"

# Grant Storage Object Admin role to the service account
gcloud storage buckets add-iam-policy-binding gs://resellplatform-images-v2 `
  --member=serviceAccount:storage-uploader@resellplatform.iam.gserviceaccount.com `
  --role=roles/storage.objectAdmin

# Verify IAM policy
gcloud storage buckets get-iam-policy gs://resellplatform-images-v2
```

### Step 6: Create GKE Cluster

```powershell
# Create a GKE cluster with Workload Identity enabled
gcloud container clusters create resell-cluster `
  --num-nodes=3 `
  --zone=europe-west3-a `
  --workload-pool=resellplatform.svc.id.goog `
  --enable-ip-alias `
  --machine-type=e2-medium

# Wait for cluster creation (this may take 5-10 minutes)
```

### Step 7: Connect kubectl to Cluster

```powershell
# Get credentials for your cluster
gcloud container clusters get-credentials resell-cluster `
  --zone=europe-west3-a

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### Step 8: Configure Workload Identity

```powershell
# Create Kubernetes service account
kubectl apply -f infra/service-account.yaml

# Bind Kubernetes service account to GCP service account
gcloud iam service-accounts add-iam-policy-binding `
  storage-uploader@resellplatform.iam.gserviceaccount.com `
  --role=roles/iam.workloadIdentityUser `
  --member="serviceAccount:resellplatform.svc.id.goog[default/backend-sa]"

# Annotate Kubernetes service account
kubectl annotate serviceaccount backend-sa `
  iam.gke.io/gcp-service-account=storage-uploader@resellplatform.iam.gserviceaccount.com
```

### Step 9: Create Kubernetes Secrets

```powershell
# Option 1: Apply the secrets file (update infra/backend-secrets.yaml first!)
kubectl apply -f infra/backend-secrets.yaml

# Option 2: Create secrets from command line (recommended for security)
kubectl create secret generic backend-secrets `
  --from-literal=DB_USERNAME=appuser `
  --from-literal=DB_PASSWORD='yourSecurePassword123' `
  --from-literal=DB_ROOT_PASSWORD='yourRootPassword123' `
  --from-literal=JWT_SECRET='your-very-long-secure-jwt-secret-key-at-least-256-bits'

# Verify secrets were created
kubectl get secrets
```

### Step 10: Deploy MySQL Database

```powershell
# Deploy MySQL with persistent storage
kubectl apply -f infra/mysql.yaml

# Wait for MySQL to be ready
kubectl rollout status deployment/mysql

# Check MySQL pod is running
kubectl get pods -l app=mysql
```

### Step 11: Initialize Database (Recommended)

```powershell
# Apply the database initialization job
kubectl apply -f infra/mysql-init-job.yaml

# Wait for job to complete
kubectl wait --for=condition=complete job/mysql-init --timeout=120s

# Check job logs to verify success
kubectl logs job/mysql-init

# Clean up the job (optional)
kubectl delete job/mysql-init
```

### Step 12: Build and Push Docker Images

```powershell
# Configure Docker to authenticate with Artifact Registry
gcloud auth configure-docker europe-west3-docker.pkg.dev

# Build and push backend image
cd backend
docker build -t europe-west3-docker.pkg.dev/resellplatform/backend/backend:latest .
docker push europe-west3-docker.pkg.dev/resellplatform/backend/backend:latest

# Build and push frontend image
cd ../frontend
docker build -t europe-west3-docker.pkg.dev/resellplatform/frontend/frontend:latest .
docker push europe-west3-docker.pkg.dev/resellplatform/frontend/frontend:latest

cd ..
```

### Step 13: Deploy Backend Application

```powershell
# Verify backend.yaml has correct image reference
# Should be: image: europe-west3-docker.pkg.dev/resellplatform/backend/backend:latest

# Deploy backend
kubectl apply -f infra/backend.yaml

# Wait for backend to be ready
kubectl rollout status deployment/backend

# Check backend logs for successful startup
kubectl logs -l app=backend --tail=50
```

### Step 14: Deploy Frontend Application

```powershell
# Deploy frontend
kubectl apply -f infra/frontend.yaml

# Wait for frontend to be ready
kubectl rollout status deployment/frontend

# Check all pods are running
kubectl get pods
```

### Step 15: Verify Deployment

```powershell
# Check all deployments
kubectl get deployments

# Check all services
kubectl get services

# Check backend health endpoint
kubectl port-forward svc/backend 8080:8080
# In another terminal: Invoke-WebRequest http://localhost:8080/actuator/health

# Get external IP for frontend (if LoadBalancer)
kubectl get svc frontend
# Access the application using the EXTERNAL-IP
```

---

## 🔄 Quick Restart Guide (For Tomorrow)

If you need to restart everything from scratch:

```powershell
# 1. Set project
gcloud config set project resellplatform

# 2. Connect to cluster
gcloud container clusters get-credentials resell-cluster --zone=europe-west3-a

# 3. Check cluster status
kubectl get all

# 4. If cluster doesn't exist, recreate from Step 6 above
# If cluster exists but pods are down, restart deployments:
kubectl rollout restart deployment/mysql
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend

# 5. Verify all pods are running
kubectl get pods

# 6. Check backend logs
kubectl logs -l app=backend --tail=100
```

---

## 🛠️ Troubleshooting Commands

```powershell
# View pod details
kubectl describe pod <pod-name>

# View pod logs
kubectl logs <pod-name> --tail=100

# View all events
kubectl get events --sort-by='.lastTimestamp'

# Restart a deployment
kubectl rollout restart deployment/<deployment-name>

# Delete and recreate a deployment
kubectl delete -f infra/backend.yaml
kubectl apply -f infra/backend.yaml

# Access MySQL database directly
kubectl exec -it <mysql-pod-name> -- mysql -uroot -p
```

---

## 📊 Monitoring & Management

```powershell
# View resource usage
kubectl top nodes
kubectl top pods

# Scale deployments
kubectl scale deployment/backend --replicas=3

# View deployment history
kubectl rollout history deployment/backend

# Rollback to previous version
kubectl rollout undo deployment/backend
```

---

## ☁️ Deployment with Cloud Build (Automated CI/CD)

This project includes a complete Cloud Build pipeline (`cloudbuild.yaml`) that automatically builds Docker images, pushes them to Artifact Registry, and deploys to GKE.

### Prerequisites

1. **GCP Project Setup**:
   ```powershell
   # Set your project ID
   gcloud config set project resellplatform
   ```

2. **Create Artifact Registry Repositories**:
   ```powershell
   gcloud artifacts repositories create backend `
     --repository-format=docker `
     --location=europe-west3 `
     --description="Backend Docker images"

   gcloud artifacts repositories create frontend `
     --repository-format=docker `
     --location=europe-west3 `
     --description="Frontend Docker images"
   ```

3. **Grant Cloud Build Permissions**:
   ```powershell
   # Get your project number
   $PROJECT_NUMBER = gcloud projects describe resellplatform --format='value(projectNumber)'
   
   # Grant Kubernetes Engine Developer role to Cloud Build
   gcloud projects add-iam-policy-binding resellplatform `
     --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com `
     --role=roles/container.developer
   ```

### First-Time Infrastructure Setup

Before using Cloud Build for deployments, you need to set up the GKE cluster and initial resources:

1. **Create GKE Cluster**:
   ```powershell
   gcloud container clusters create resell-cluster `
     --num-nodes=3 `
     --zone=europe-west3
   ```

2. **Connect kubectl**:
   ```powershell
   gcloud container clusters get-credentials resell-cluster --region europe-west3
   ```

3. **Grant Storage Permissions** (Required for image uploads):
   ```powershell
   # Grant the service account permission to upload images to GCS bucket
   gcloud storage buckets add-iam-policy-binding gs://resellplatform-images-v2 `
     --member=serviceAccount:storage-uploader@resellplatform.iam.gserviceaccount.com `
     --role=roles/storage.objectAdmin
   ```

4. **Deploy Infrastructure** (MySQL, Secrets, Initial Deployments):
   ```powershell
   # Create ServiceAccount (required for backend Workload Identity)
   kubectl apply -f infra/service-account.yaml
   
   # Create secrets (update values first!)
   kubectl apply -f infra/backend-secrets.yaml

   # Deploy MySQL
   kubectl apply -f infra/mysql.yaml
   kubectl rollout status deployment/mysql

   # Initialize database
   kubectl apply -f infra/mysql-init-job.yaml
   kubectl wait --for=condition=complete job/mysql-init --timeout=120s

   # Deploy initial backend and frontend
   kubectl apply -f infra/backend.yaml
   kubectl apply -f infra/frontend.yaml
   ```

### Deployment Options

**Option 1: Manual Cloud Build Trigger**

Manually trigger a build and deployment:
```powershell
gcloud builds submit --config=cloudbuild.yaml .
```

**Option 2: Automated GitHub Trigger (Recommended)**

Set up automatic deployments on every push to `main`:
```powershell
gcloud builds triggers create github `
  --repo-name=ReselingPlatform `
  --repo-owner=SamarthKunwar `
  --branch-pattern="^main$" `
  --build-config=cloudbuild.yaml
```

After setup, every push to the `main` branch will automatically:
1. Build backend and frontend Docker images
2. Push images to Artifact Registry (tagged with commit SHA)
3. Update GKE deployments with new images
4. Verify rollout status

### What the Pipeline Does

The `cloudbuild.yaml` pipeline performs these steps:
- ✅ Builds backend Docker image
- ✅ Pushes backend to Artifact Registry (`europe-west3-docker.pkg.dev/resellplatform/backend/backend:$SHORT_SHA`)
- ✅ Builds frontend Docker image
- ✅ Pushes frontend to Artifact Registry (`europe-west3-docker.pkg.dev/resellplatform/frontend/frontend:$SHORT_SHA`)
- ✅ Updates backend deployment in GKE
- ✅ Updates frontend deployment in GKE
- ✅ Verifies both deployments

### Monitoring Builds

View build history and logs:
```powershell
# List recent builds
gcloud builds list --limit=10

# View specific build logs
gcloud builds log <BUILD_ID>
```

---

## 🏃‍♂️ How to Run (Docker Compose) - Recommended

The easiest way to run the entire application is using Docker Compose.

1. **Clone the repository**:
   ```powershell
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Start the services**:
   ```powershell
   docker-compose up --build
   ```
   
   This will start:
   - **MySQL Database** on port `3307` (mapped to internal `3306`)
   - **Backend API** on `http://localhost:8080`
   - **Frontend App** on `http://localhost:80`

3. **Access the application**:
   - Open your browser to [http://localhost](http://localhost)

## 🔧 Local Development

### environment variables
```powershell
# PowerShell
$env:DB_PASSWORD="yourpassword"; 
$env:MYSQL_ROOT_PASSWORD="rootpassword"; 
$env:JWT_SECRET="your-random-32-char-string";
$env:INITIAL_ADMIN_EMAIL="your@email.com" # This user will become Admin
```

### Backend
1. Navigate to `backend/`.
2. Ensure you have a MySQL instance running (or update `application.properties` to point to one).
3. Run the application:
   ```powershell
   .\mvnw spring-boot:run
   ```

### Frontend
1. Navigate to `frontend/`.
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Run the dev server:
   ```powershell
   npm run dev
   ```

## ✅ 12-Factor App Compliance

This project adheres to the 12-Factor App methodology:
- **Codebase**: Tracked in Git, one codebase for many deploys.
- **Dependencies**: Explicitly declared via `pom.xml` and `package.json`.
- **Config**: Configuration (DB details, JWT secret) is externalized via environment variables (see `docker-compose.yml`).
- **Backing Services**: Database is treated as an attached resource.
- **Build, Release, Run**: Separation of build and run stages via Docker.
- **Port Binding**: Services export HTTP on specified ports.
- **Dev/Prod Parity**: Docker ensures consistent environments.


