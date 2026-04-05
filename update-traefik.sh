#!/bin/bash

# Update Traefik config with current nginx IP

NGINX_CONTAINER="open-acordesai_nginx_1"
TRAEFIK_CONFIG="/etc/easypanel/traefik/config/main.yaml"

# Get nginx IP in easypanel network
NGINX_IP=$(docker inspect $NGINX_CONTAINER --format '{{json .NetworkSettings.Networks}}' | jq -r '.easypanel.IPAddress')

if [ -z "$NGINX_IP" ] || [ "$NGINX_IP" = "null" ]; then
    echo "Error: Could not get nginx IP"
    exit 1
fi

echo "Updating Traefik config with nginx IP: $NGINX_IP"

# Update the IP in Traefik config
sed -i "s|\"url\": \"http://[0-9.]*:80\"|\"url\": \"http://$NGINX_IP:80\"|g" "$TRAEFIK_CONFIG"

# Restart Traefik
TRAEFIK_CONTAINER=$(docker ps --filter "name=traefik" --format "{{.Names}}" | head -1)
if [ -n "$TRAEFIK_CONTAINER" ]; then
    docker restart $TRAEFIK_CONTAINER
    echo "Traefik restarted"
fi

echo "Done!"
