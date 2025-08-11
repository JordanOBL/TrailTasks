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
  else
    echo "LOCAL_IP=$IP" > "$FILE"
    echo "Created $FILE with LOCAL_IP=$IP"
  fi
}

# Update both .env and .env.development
update_env_file ".env"
update_env_file ".env.development"