FROM eclipse-temurin:21

WORKDIR /app

COPY target/users-service-0.0.1-SNAPSHOT.jar user-maangement-app.jar

EXPOSE 8082

ENTRYPOINT [ "java","-jar","user-maangement-app.jar"]