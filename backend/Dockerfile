FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml checkstyle.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline
COPY src/ src/
RUN ./mvnw -B package -DskipTests

FROM eclipse-temurin:21-jre
LABEL org.opencontainers.image.source="https://github.com/Manticore-MT/tram-forecast"
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Container-aware heap sizing so the service stays inside a 2-4 GB limit.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-jar", "app.jar"]
