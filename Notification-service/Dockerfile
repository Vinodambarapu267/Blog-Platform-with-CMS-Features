FROM eclipse-temurin:21

WORKDIR /app

COPY target/Notification-service-0.0.1-SNAPSHOT.jar notification-service.jar


EXPOSE 8085


ENTRYPOINT [ "java","-jar","notification-service.jar"]