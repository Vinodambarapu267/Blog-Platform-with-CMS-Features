FROM eclipse-temurin:21

WORKDIR /app

COPY target/Api-Gateway-0.0.1-SNAPSHOT.jar api-gateway.jar

EXPOSE 8089

ENTRYPOINT [ "java","-jar","api-gateway.jar"]