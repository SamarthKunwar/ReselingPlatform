# Cloud-Native Reselling Platform

A full-stack cloud-native reselling platform built with Spring Boot and React, designed to be scalable and containerized.

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

## ☁️ Deployment without cloud build (Kubernetes)

This repo includes Kubernetes manifests under `infra/` for `mysql`, `backend`, `frontend`, and `backend-secrets`.

Important note: **there is no automatic init Job in the manifests** — the cluster will *not* run a DB init job. You can rely on the MySQL image's built-in initialization (it creates the DB and the user on first run if `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD` are present and the PVC is empty), or you can initialize manually (recommended when restoring from backups or when PVC already contains data).
### 1) Create GKE cluster  
```bash
gcloud container clusters create resell-cluster --num-nodes=3 --zone=europe-west3
```
### 2) Connect your local kubectl to your new cluster:
```bash
gcloud container clusters get-credentials resell-cluster --region europe-west3
```
### 3) Create/update the Secrets
Replace the values with secure ones before applying.
```bash
kubectl apply -f infra/backend-secrets.yaml
# or create from literals
kubectl create secret generic backend-secrets \
  --from-literal=DB_USERNAME=appuser \
  --from-literal=DB_PASSWORD='apppassword' \
  --from-literal=DB_ROOT_PASSWORD='rootpassword' \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 4) Deploy MySQL
```bash
kubectl apply -f infra/mysql.yaml
kubectl rollout status deployment/mysql
```

### 5) (Optional) Manual DB initialization
If the PVC already contains data, the official MySQL image will not re-run init scripts. To initialize the DB manually (one-off) you can either run a client or apply the included idempotent Job (safe to re-run):

Option A — One-off client (ephemeral pod):
```bash
# Decode root password from secret
ROOTPW=$(kubectl get secret backend-secrets -o jsonpath='{.data.DB_ROOT_PASSWORD}' | base64 --decode)
# Run a one-off client pod to create DB and user
kubectl run mysql-client --rm -i --restart=Never --image=mysql:8.0 \
  --env="MYSQL_PWD=$ROOTPW" --command -- \
  mysql -hmysql -uroot -e "CREATE DATABASE IF NOT EXISTS resell; CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED BY 'apppassword'; GRANT ALL PRIVILEGES ON resell.* TO 'appuser'@'%'; FLUSH PRIVILEGES;"
```

Option B — Apply the idempotent Job included in `infra/` (recommended for convenience):
```bash
kubectl apply -f infra/mysql-init-job.yaml
kubectl wait --for=condition=complete job/mysql-init --timeout=120s
kubectl logs job/mysql-init
# When it completes, you may delete the job: kubectl delete job/mysql-init
```

> Note: Changing secret values will not reinitialize an existing database; for a fresh init you must start with an empty PVC. The Job and one-off client use `IF NOT EXISTS` SQL so they're safe to run repeatedly.

### 6) Deploy backend & frontend
Before applying, update `infra/backend.yaml` and `infra/frontend.yaml` to include your image tags (we use placeholder `backend:TAG` and `frontend:TAG` in the manifests). Then:
```bash
kubectl apply -f infra/backend.yaml
kubectl apply -f infra/frontend.yaml
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend
```

### 7) Verify
- Port-forward to test locally:
```bash
kubectl port-forward svc/backend 8080:8080
curl http://localhost:8080/actuator/health
```

---

## 🏃‍♂️ How to Run (Docker Compose) - Recommended

The easiest way to run the entire application is using Docker Compose.

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Start the services**:
   ```bash
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
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend
1. Navigate to `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
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
