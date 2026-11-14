#!/bin/sh
# Merged CSS/JS is cached by file list only, so edits need a cache reset.
# Files belong to www-data, so remove them inside the php container.
cd "$(dirname "$0")/../.." && docker compose exec -T php sh -c 'rm -f /opt/www/templates/cache/*/*'
