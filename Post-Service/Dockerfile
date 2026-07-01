FROM eclipse-temurin:21

WORKDIR /app

COPY target/posts-service-0.0.1-SNAPSHOT.jar post-maangement-app.jar

EXPOSE 8083

ENTRYPOINT [ "java","-jar","post-maangement-app.jar"]