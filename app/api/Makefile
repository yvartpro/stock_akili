migrate:
	npx sequelize-cli db:migrate
migrate\:undo:
	npx sequelize-cli db:migrate:undo
migrate\:undo\:all:
	npx sequelize-cli db:migrate:undo:all
run:
	nodemon index.js
build:
	npm run migrate && npm run run

# 1. Intercepte le deuxième argument après la commande "migration"
ifeq ($(firstword $(MAKECMDGOALS)),migration)
  MIGRATE_NAME := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # Transforme l'argument en une règle "vide" pour éviter que Make ne dise "No rule to make target..."
  $(eval $(MIGRATE_NAME):;@:)
endif

# 2. La commande qui génère la migration
migration:
	@if [ -z "$(MIGRATE_NAME)" ]; then \
		echo "Erreur : Veuillez fournir un nom. Exemple : make migration add-users-table"; \
		exit 1; \
	fi
	npx sequelize-cli migration:create --name $(MIGRATE_NAME)
