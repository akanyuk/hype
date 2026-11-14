# Display settings verification tools

Screenshot, diff and browser tests for the dark theme / large font feature
(see `docs/superpowers/specs/2026-11-14-display-settings-design.md`).

Setup:

    npm install
    # local test user (the dump's MySQL 9 has no MD5(), so pass the hash)
    docker compose exec -T mysql mysql -uroot -proot hype \
      -e "UPDATE user SET user_password='098f6bcd4621d373cade4e832627b4f6' WHERE user_login='nyuk'"
    docker compose exec -T php sh -c 'rm -rf /opt/www/tmp/*'   # drop cached user object

Login/password default to `nyuk` / `test` (`HYPE_TEST_LOGIN`, `HYPE_TEST_PASSWORD`).

Usage:

    ./clear-cache.sh                      # after any CSS/JS/skin config change
    node shoot.mjs <label> [--skin desktop|mobile] [--role guest|user] [--theme light|dark] [--font normal|large] [--only <pageId>] [--dynamic]
    node diff.mjs <labelA> <labelB>
    npm test
