# Vibecoding Project Tracker — one container that serves the React app AND the API.
# Same origin for both means the login cookie works without any cross-site setup.

# 1) Build the React frontend
FROM node:20-alpine AS web
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY src ./src
RUN npm run build

# 2) Build the Spring Boot backend, with the frontend bundled in as static files
FROM maven:3.9-eclipse-temurin-21 AS api
WORKDIR /build
COPY backend/pom.xml .
RUN mvn -q -B dependency:go-offline
COPY backend/src ./src
COPY --from=web /app/dist ./src/main/resources/static
RUN mvn -q -B -DskipTests package

# 3) Small runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=api /build/target/vibetracker-backend-0.1.0.jar app.jar
# Fit comfortably in a 512 MB free instance and start faster.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1"
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
