#!/usr/bin/env bash
set -euo pipefail

# Updates React Native env files with an API host reachable from the target.
# Defaults to LAN IP for physical devices. Pass android-emulator to use the
# Android emulator host alias: 10.0.2.2.
#
# Examples:
#   bash ./update-ip.sh                 # physical device / LAN IP
#   bash ./update-ip.sh android-emulator # Android emulator / host machine

TARGET=${1:-physical}
PORT=${API_PORT:-5500}

get_lan_ip() {
  if [[ "${OSTYPE:-}" == darwin* ]]; then
    ipconfig getifaddr en0
  else
    hostname -I | awk '{print $1}'
  fi
}

case "$TARGET" in
  android-emulator|emulator|android)
    API_HOST="10.0.2.2"
    ;;
  physical|device|lan)
    API_HOST="$(get_lan_ip)"
    ;;
  *)
    echo "Unknown target '$TARGET'. Use 'physical' or 'android-emulator'." >&2
    exit 1
    ;;
esac

API_BASE_URL="http://${API_HOST}:${PORT}"

set_or_append() {
  local file=$1
  local key=$2
  local value=$3

  if grep -q "^${key}=" "$file"; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

update_env_file() {
  local file=$1

  if [[ ! -f "$file" ]]; then
    touch "$file"
    echo "NODE_ENV=development" >> "$file"
    echo "Created $file"
  fi

  set_or_append "$file" "LOCAL_IP" "$API_HOST"
  set_or_append "$file" "DATABASE_URL" "${API_HOST}:${PORT}"
  set_or_append "$file" "DATABASE_PULL_URL" "$API_BASE_URL"
  set_or_append "$file" "DATABASE_PUSH_URL" "$API_BASE_URL"
  set_or_append "$file" "DATABASE_LEADERBOARDS_URL" "${API_BASE_URL}/api/leaderboards"

  echo "Updated $file → target=$TARGET API=$API_BASE_URL"
}

update_env_file ".env"
update_env_file ".env.development"
