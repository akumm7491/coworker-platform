#!/bin/bash

# Function to update a file
update_file() {
    local file=$1
    # Replace the import statement
    sed -i '' 's/import { createLogger } from/import logger from/g' "$file"
    # Remove the createLogger line
    sed -i '' '/const logger = createLogger/d' "$file"
}

# List of files to update
files=(
    "routes/auth.ts"
    "services/billing/index.ts"
    "controllers/auth.ts"
    "services/analytics/index.ts"
    "services/project/index.ts"
    "routes/agents.ts"
    "index.ts"
    "routes/analytics.ts"
    "routes/projects.ts"
    "services/agent/index.ts"
    "services/identity/index.ts"
    "scripts/migrate.ts"
    "sockets.ts"
    "events/eventBus.ts"
    "repositories/user.repository.ts"
    "config/passport.ts"
    "repositories/UserRepository.ts"
    "config/database.ts"
    "sockets/index.ts"
    "middleware/error.ts"
)

# Update each file
for file in "${files[@]}"; do
    if [ -f "src/$file" ]; then
        echo "Updating $file..."
        update_file "src/$file"
    fi
done

echo "Logger updates complete!"
