# ── Stage 1: Build the JAR with pre-installed Maven ──
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY .mvn ./.mvn
COPY pom.xml .
COPY src ./src

# Use Google Cloud mirror for Maven Central to bypass Sonatype 429 IP rate limits on Render build runners
RUN mvn clean package -DskipTests -s .mvn/settings.xml

# ── Stage 2: Minimal runtime image ──
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT} -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar app.jar"]
