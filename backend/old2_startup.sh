#!/bin/bash

# Wait a moment for any setup
sleep 2

# Clear caches (ignore errors)
php artisan config:clear 2>/dev/null || true
php artisan cache:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true

# Run migrations
php artisan migrate --force

# Seed only if empty
php artisan db:seed --force 2>/dev/null || echo "Seeding skipped or failed"

# Cache configurations
if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Start Apache
apache2-foreground