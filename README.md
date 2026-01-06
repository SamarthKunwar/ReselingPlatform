# Cloud-Native Reselling Platform

A full-stack cloud-native reselling platform built with Spring Boot and React, designed to be scalable and containerized.

## 🚀 Features

- **User Authentication**: Secure registration and login using JWT.
- **Item Management**: Users can post items for sale and browse available items.
- **Cart System**: Add items to cart (in progress).
- **Containerized**: Fully Dockerized backend, frontend, and database.
- **Cloud-Ready**: Designed for deployment on Kubernetes (Google Cloud).

## 🛠 Built With

- **Backend**: Java 17, Spring Boot, Spring Security, Hibernate, MySQL.
- **Frontend**: React (Vite), Tailwind CSS, Axios.
- **Database**: MySQL 8.0.
- **DevOps**: Docker, Docker Compose, Kubernetes, GitHub Actions.

## ⚙️ Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) & Docker Compose
- Java 17 (for local backend dev)
- Node.js & npm (for local frontend dev)

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
