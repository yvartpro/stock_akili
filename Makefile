.PHONY: migrate migrate-undo migrate-undo-all seed seed-undo dev start build deploy-prep migration

migrate:
	npx sequelize-cli db:migrate

migrate-undo:
	npx sequelize-cli db:migrate:undo

migrate-undo-all:
	npx sequelize-cli db:migrate:undo:all

seed:
	npx sequelize-cli db:seed:all

seed-undo:
	npx sequelize-cli db:seed:undo

dev:
	npm run dev

start:
	npm start

build:
	npm run build

deploy-prep: migrate build

ifeq ($(firstword $(MAKECMDGOALS)),migration)
  MIGRATE_NAME := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  $(eval $(MIGRATE_NAME):;@:)
endif

migration:
	@if [ -z "$(MIGRATE_NAME)" ]; then \
		echo "Erreur : Veuillez fournir un nom. Exemple : make migration add-users-table"; \
		exit 1; \
	fi
	npx sequelize-cli migration:create --name $(MIGRATE_NAME)
