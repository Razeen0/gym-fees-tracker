.PHONY: help build up down restart logs migrate shell superuser test frontend-backend install

help:
	@echo "Available commands:"
	@echo "  make build           - Build all Docker images"
	@echo "  make up              - Start all services"
	@echo "  make down            - Stop all services"
	@echo "  make restart         - Restart all services"
	@echo "  make logs            - View logs"
	@echo "  make migrate         - Run Django migrations"
	@echo "  make shell           - Open Django shell"
	@echo "  make superuser       - Create Django superuser"
	@echo "  make test            - Run Django tests"
	@echo "  make install         - Install backend dependencies"
	@echo "  make frontend        - Install frontend dependencies"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart: down up

logs:
	docker-compose logs -f

migrate:
	docker-compose exec backend python manage.py migrate --noinput

shell:
	docker-compose exec backend python manage.py shell

superuser:
	docker-compose exec backend python manage.py createsuperuser

test:
	docker-compose exec backend python manage.py test

install:
	cd backend && pip install -r requirements.txt

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev
