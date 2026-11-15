RUNTIME_DIRS := tmp logs templates/cache templates/compiled uploads

.PHONY: all up down dirs help

all: up

up: dirs ## Docker compose run
	docker compose up --build -d

# Recursive chmod: subdirectories recreated by a checkout or a move must stay writable for www-data.
# Entries created by PHP belong to www-data and can't be changed from the host; they are writable already.
dirs: ## Create writable runtime directories in public_html
	mkdir -p $(addprefix public_html/,$(RUNTIME_DIRS))
	chmod -R a+rwX $(addprefix public_html/,$(RUNTIME_DIRS)) 2>/dev/null || true

down: ## Docker compose run
	docker compose down

help: ## Display available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
