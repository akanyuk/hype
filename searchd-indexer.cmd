docker compose exec -T searchd mkdir -p /var/lib/manticore/hype
docker compose exec -T searchd indexer --rotate topicsIndex
docker compose exec -T searchd indexer --rotate commentsIndex
docker compose restart searchd
