#! /bin/bash/

# Detect current LAN IP
if [[ "$OSTYPE" == "darwin"* ]]; then
  IP=$(ipconfig getifaddr en0)   # Mac Wi-Fi
else
  IP=$(hostname -I | awk '{print $1}') # Linux
fi

update_env_file () {
  local FILE=$1
  if [[ -f "$FILE" ]]; then
    if grep -q '^LOCAL_IP=' "$FILE"; then
      sed -i.bak "s/^LOCAL_IP=.*/LOCAL_IP=$IP/" "$FILE"
    else
      echo "LOCAL_IP=$IP" >> "$FILE"
    fi
    echo "Updated $FILE → LOCAL_IP=$IP"
    if grep -q '^DATABASE_URL=' "$FILE"; then
      sed -i.bak "s/^DATABASE_URL=.*/DATABASE_URL=http:\/\/$IP:5500/" "$FILE"
    else
      echo "DATABASE_URL=$IP:5500" >> "$FILE"
    fi
    if grep -q '^DATABASE_PULL_URL=' "$FILE"; then
      sed -i.bak "s/^DATABASE_PULL_URL=.*/DATABASE_PULL_URL=http:\/\/$IP:5500/" "$FILE"
    else
      echo "DATABASE_PULL_URL=$IP:5500" >> "$FILE"
    fi 
    if grep -q '^DATABASE_PUSH_URL=' "$FILE"; then
      sed -i.bak "s/^DATABASE_PUSH_URL=.*/DATABASE_PUSH_URL=http:\/\/$IP:5500/" "$FILE"
    else
      echo "DATABASE_PUSH_URL=$IP:5500" >> "$FILE"
    fi 
    if grep -q '^DATABASE_LEADERBOARDS_URL=' "$FILE"; then
      sed -i.bak "s|^DATABASE_LEADERBOARDS_URL=.*|DATABASE_LEADERBOARDS_URL=http:\/\/$IP:5500/api/leaderboards|" "$FILE"
    else
      echo "DATABASE_LEADERBOARDS_URL=http://$IP:5500/api/leaderboards" >> "$FILE"
    fi  
  else
    echo "LOCAL_IP=$IP" > "$FILE"
    echo "DATABASE_URL=http://$IP:5500" >> "$FILE"
    echo "DATABASE_PULL_URL=http://$IP:5500" >> "$FILE"
    echo "DATABASE_PUSH_URL=http://$IP:5500" >> "$FILE"
    echo "NODE_ENV=development" >> "$FILE"
    echo "DATABASE_LEADERBOARDS_URL=http://$IP:5500/api/leaderboards" >> "$FILE"
    echo "Created $FILE with LOCAL_IP=$IP"
  fi
}

# Update both .env and .env.development
update_env_file ".env"
update_env_file ".env.development"