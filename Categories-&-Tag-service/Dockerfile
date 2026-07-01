FROM eclipse-temurin:21

WORKDIR /app

COPY target/categories-service-1-0.0.1-SNAPSHOT.jar category-and-tags-management-app.jar

EXPOSE 8084

ENTRYPOINT [ "java","-jar","category-and-tags-management-app.jar"]