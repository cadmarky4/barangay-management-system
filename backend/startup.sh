#!/bin/bash

# Wait a moment for any setup
sleep 2

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Cache configurations for production
if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Run migrations
php artisan migrate --force

# Start Apache in foreground
apache2-foreground