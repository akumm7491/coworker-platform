#!/bin/sh

# Frontend health check
if [ "$SERVICE_TYPE" = "frontend" ]; then
    wget --spider http://localhost:5175 || exit 1
fi

# Backend health check
if [ "$SERVICE_TYPE" = "backend" ]; then
    wget --spider http://localhost:8000/api/health || exit 1
fi

exit 0
