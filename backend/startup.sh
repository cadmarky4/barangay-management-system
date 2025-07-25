#!/bin/bash

# Wait a moment for any setup
sleep 2

# Clear caches
php artisan config:clear
php artisan cache:clear 2>/dev/null || true
php artisan view:clear
php artisan route:clear

# Run migrations (this will only run new migrations)
php artisan migrate --force

# Check if cache table exists, create only if it doesn't
php artisan tinker --execute="
if (!\Illuminate\Support\Facades\Schema::hasTable('cache')) {
    \Illuminate\Support\Facades\Artisan::call('cache:table');
    echo 'Cache table created';
} else {
    echo 'Cache table already exists';
}
" 2>/dev/null || echo "Cache table check failed"

# Check if users table is empty, seed only if needed
USER_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null || echo "0")
if [ "$USER_COUNT" -eq "0" ]; then
    echo "Database is empty, seeding..."
    php artisan db:seed --force --class=DatabaseSeeder
else
    echo "Database already has $USER_COUNT users, skipping seed"
fi

# Cache configurations for production
if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Start Apache in foreground
apache2-foreground