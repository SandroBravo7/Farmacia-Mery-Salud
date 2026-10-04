#!/usr/bin/env bash
set -euo pipefail

if [[ $EUID -ne 0 || -z ${SUDO_USER:-} ]]; then
  echo 'Ejecuta este script con sudo desde tu usuario normal.' >&2
  exit 1
fi

repo_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
env_file="$repo_dir/.env"

if [[ ${1:-} != --skip-java ]]; then
  apt-get update
  apt-get install -y openjdk-21-jdk
fi

mysql --protocol=socket -u root < "$repo_dir/database/schema.sql"

if [[ -e $env_file ]]; then
  echo 'La base se comprobó; se conservó el archivo .env existente.'
  exit 0
fi

mapfile -t existing_users < <(mysql --protocol=socket -u root --batch --skip-column-names \
  -e "SELECT user FROM mysql.user WHERE user REGEXP '^mery_[0-9a-f]{8}$' AND host = 'localhost'")
if [[ ${#existing_users[@]} -eq 1 ]]; then
  db_user=${existing_users[0]}
else
  db_user="mery_$(openssl rand -hex 4)"
fi
db_password=$(openssl rand -hex 24)
jwt_secret=$(openssl rand -hex 32)
admin_password=$(openssl rand -hex 16)
driver_password=$(openssl rand -hex 16)

temp_file=$(mktemp "$repo_dir/.env.XXXXXXXX")
trap 'rm -f -- "$temp_file"' EXIT
chmod 600 "$temp_file"
cat > "$temp_file" <<ENV
MERY_DB_USER=$db_user
MERY_DB_PASSWORD=$db_password
MERY_JWT_SECRET=$jwt_secret
MERY_ADMIN_PASSWORD=$admin_password
MERY_DRIVER_PASSWORD=$driver_password
MERY_SEED_DEMO=true
ENV
chown "$SUDO_USER:$(id -gn "$SUDO_USER")" "$temp_file"

mysql --protocol=socket -u root <<SQL
CREATE USER IF NOT EXISTS '$db_user'@'localhost' IDENTIFIED BY '$db_password';
ALTER USER '$db_user'@'localhost' IDENTIFIED BY '$db_password';
GRANT ALL PRIVILEGES ON merysalud_db.* TO '$db_user'@'localhost';
SQL

mv -- "$temp_file" "$env_file"
trap - EXIT

echo 'MySQL y el entorno local quedaron configurados.'
echo 'Las claves están en .env (privado e ignorado por Git).'
