#!/bin/bash

# Self-healing script for jains.es service
# Monitors Docker container health and Cloudflare Tunnel connectivity
# Automatically restarts services when issues are detected

LOG_FILE="/Users/webserver/code/jains.es/self_heal.log"
SERVICE_NAME="jains-site"
TUNNEL_NAME="cf-tunnel-coco"
EXPECTED_PORT="8088"
CHECK_INTERVAL=300  # 5 minutes

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

check_container_health() {
    local container=$1
    local status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null)
    if [ "$status" != "running" ]; then
        log "ALERT: Container $container is not running (status: $status)"
        return 1
    fi
    return 0
}

check_port_listening() {
    local port=$1
    if ! netstat -an | grep -q "LISTEN.*:$port[[:space:]]"; then
        log "ALERT: Port $port is not listening"
        return 1
    fi
    return 0
}

check_tunnel_connectivity() {
    local tunnel=$1
    # Check if tunnel container is running
    if ! docker inspect --format='{{.State.Status}}' "$tunnel" &>/dev/null; then
        log "ALERT: Tunnel container $tunnel not found"
        return 1
    fi
    
    # Check recent logs for connection errors
    local error_count=$(docker logs "$tunnel" --since 5m 2>/dev/null | grep -i "failed\|refused\|error" | wc -l)
    if [ "$error_count" -gt 10 ]; then  # Threshold for concerning error rate
        log "ALERT: Tunnel $tunnel showing high error rate ($error_count errors in last 5m)"
        return 1
    fi
    return 0
}

check_service_endpoint() {
    local url="http://localhost:$EXPECTED_PORT"
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    if [ "$status_code" != "200" ]; then
        log "ALERT: Service endpoint returned HTTP $status_code (expected 200)"
        return 1
    fi
    return 0
}

restart_service() {
    local service=$1
    log "INFO: Restarting service $service"
    docker restart "$service" >> "$LOG_FILE" 2>&1
    sleep 10
    if check_container_health "$service"; then
        log "INFO: Service $service restarted successfully"
    else
        log "ERROR: Failed to restart service $service"
    fi
}

main() {
    log "=== Self-health check started ==="
    
    # Check jains-site container
    if ! check_container_health "$SERVICE_NAME"; then
        restart_service "$SERVICE_NAME"
    fi
    
    # Check if expected port is listening
    if ! check_port_listening "$EXPECTED_PORT"; then
        log "INFO: Expected port $EXPECTED_PORT not listening, attempting service restart"
        restart_service "$SERVICE_NAME"
    fi
    
    # Check Cloudflare tunnel
    if ! check_tunnel_connectivity "$TUNNEL_NAME"; then
        restart_service "$TUNNEL_NAME"
    fi
    
    # Check end-to-end service availability
    if ! check_service_endpoint; then
        log "INFO: End-to-end check failed, attempting tunnel restart"
        restart_service "$TUNNEL_NAME"
    fi
    
    log "=== Self-health check completed ==="
}

# Run main function
main