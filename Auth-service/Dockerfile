FROM eclipse-temurin:21

WORKDIR /app

COPY target/Auth-service-0.0.1-SNAPSHOT.jar auth-maangement-app.jar

EXPOSE 8081

ENTRYPOINT [ "java","-jar","auth-maangement-app.jar"]