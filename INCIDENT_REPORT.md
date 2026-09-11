# Incident Report: Bad Gateway Error (502) for jains.es
**Date:** 2026-05-26  
**Time:** 04:49:48 UTC  
**Domain:** jains.es  
**Error Code:** 502 Bad Gateway  

## Root Cause Analysis
The 502 Bad Gateway error was caused by a port mismatch in the Cloudflare Tunnel configuration:

1. **Docker Container Status:** The jains.es service was running correctly in a Docker container, listening on port 8088 (mapped to host port 8088)
2. **Cloudflare Tunnel Configuration:** The tunnel was configured to forward traffic to `http://localhost:8083` 
3. **Port Mismatch:** No service was listening on port 8083 inside the container, causing Cloudflare to receive connection refused errors
4. **Result:** Cloudflare returned 502 Bad Gateway errors to clients attempting to access jains.es

## Evidence Collected
- Docker container `jains-site` was healthy and running: `0.0.0.0:8088->8080/tcp`
- Cloudflare Tunnel logs showed repeated connection attempts to localhost:8083 with no response
- Local testing confirmed service was accessible on port 8088: `curl -s http://localhost:8088` returned HTTP 200
- Configuration file `/Users/webserver/.cloudflared/config.yml` showed incorrect port 8083

## Impact
- **Service Availability:** jains.es was completely inaccessible to users via Cloudflare
- **User Experience:** All visitors received 502 Bad Gateway errors
- **Business Impact:** Complete loss of web traffic and potential revenue during outage period
- **Duration:** Outage persisted until configuration was corrected

## Remediation Steps Taken
1. **Identified Misconfiguration:** Compared Docker port mapping (8088) with tunnel config (8083)
2. **Backup Configuration:** Created backup of original tunnel configuration
3. **Corrected Configuration:** Updated `/Users/webserver/.cloudflared/config.yml`:
   ```yaml
   tunnel: jains-es
   credentials-file: /Users/webserver/.cloudflared/684463c5-719c-489d-a7ab-d9afb85d78a5.json

   ingress:
     - hostname: jains.es
       service: http://localhost:8088  # Changed from 8083 to 8088
     - service: http_status:404
   ```
4. **Applied Fix:** Restarted Cloudflare Tunnel container (`cf-tunnel-coco`) to load new configuration
5. **Verified Resolution:** 
   - Confirmed tunnel established successful connections
   - Verified HTTP 200 responses from service via tunnel
   - Monitored logs for absence of connection errors

## Validation
- Post-fix testing showed successful HTTP 200 responses
- Cloudflare Tunnel logs showed successful connection establishment
- No further 502 errors reported after fix application
- Service remains accessible and stable

## Lessons Learned
1. Always verify port mappings between Docker containers and reverse proxy/tunnel configurations
2. Implement automated validation of service connectivity as part of deployment processes
3. Use health checks that validate end-to-end connectivity, not just container status