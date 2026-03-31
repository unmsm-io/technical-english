.PHONY: dev test build db db-stop clean

JAVA_HOME ?= /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export JAVA_HOME
export PATH := $(JAVA_HOME)/bin:$(PATH)

db:
	docker compose up -d postgres
	@echo "PostgreSQL running on localhost:5432"

db-stop:
	docker compose down

dev: db
	cd backend && ./mvnw spring-boot:run

test:
	cd backend && ./mvnw test

build:
	cd backend && ./mvnw clean package -DskipTests

clean:
	cd backend && ./mvnw clean
