# ==========================================
# Etapa 1: Construção (Build)
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copia apenas o pom.xml primeiro para baixar as dependências.
# Isso otimiza o cache do Docker e deixa os próximos deploys mais rápidos.
COPY pom.xml .
RUN mvn dependency:go-offline

# Copia o código fonte e faz o build
# O "-DskipTests" pula os testes para o deploy no Render ser mais rápido
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Etapa 2: Execução (Run)
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copia APENAS o arquivo .jar gerado na etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta padrão do Spring Boot
EXPOSE 8080

# Comando que o Render vai executar para iniciar a sua API
ENTRYPOINT ["java", "-jar", "app.jar"]