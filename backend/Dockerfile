# 1. Start with a "Builder" image that has Java 17 JDK
FROM eclipse-temurin:17-jdk-jammy AS build

# 2. Create a working directory inside the container
WORKDIR /app

# 3. Copy the Maven wrapper and project file
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# 4. Download all dependencies (this is cached so it's fast on repeated builds)
RUN ./mvnw dependency:go-offline

# 5. Copy your actual source code
COPY src ./src

# 6. Build the application (skip tests to avoid DB errors)
RUN ./mvnw clean package -DskipTests


# --- Stage 2: The final lightweight runner ---

    
# 7. Start a new, smaller image with just the JRE (ignoring the heavy build tools)
FROM eclipse-temurin:17-jre-jammy

# 8. Set work dir
WORKDIR /app

# 9. Copy ONLY the built JAR file from the "build" stage
COPY --from=build /app/target/*.jar app.jar

# 10. Open port 8080 (where Spring Boot listens)
EXPOSE 8080

# 11. The command to start your app
ENTRYPOINT ["java", "-jar", "app.jar"]