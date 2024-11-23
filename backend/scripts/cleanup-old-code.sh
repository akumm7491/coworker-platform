#!/bin/bash

# Directories to clean up after confirming migration is complete
OLD_DIRS=(
  "backend/packages/shared/src/events"
  "backend/packages/shared/src/database/repositories"
  "backend/packages/shared/src/database/entities"
  "backend/packages/shared/src/types"
)

# First, create a backup
echo "Creating backup..."
BACKUP_DIR="backend/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

for dir in "${OLD_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    # Create the directory structure in the backup
    mkdir -p "$BACKUP_DIR/$(dirname ${dir#backend/})"
    # Copy the directory
    cp -r "$dir" "$BACKUP_DIR/$(dirname ${dir#backend/})"
    echo "Backed up $dir"
  fi
done

# Function to check if migration is complete
check_migration() {
  # Check if new files exist
  [ -d "backend/packages/shared-kernel/src/domain/events" ] || return 1
  [ -d "backend/packages/shared-kernel/src/domain/entities" ] || return 1
  [ -d "backend/packages/infrastructure/src/database/repositories" ] || return 1
  [ -d "backend/packages/contracts/src/events" ] || return 1
  
  return 0
}

# Only proceed if migration is complete
if check_migration; then
  echo "Migration appears complete. Proceeding with cleanup..."
  
  for dir in "${OLD_DIRS[@]}"; do
    if [ -d "$dir" ]; then
      echo "Removing $dir"
      rm -rf "$dir"
    fi
  done
  
  echo "Cleanup complete. Backup stored in $BACKUP_DIR"
else
  echo "Migration does not appear complete. Aborting cleanup."
  echo "Please ensure all code has been migrated to the new structure."
  exit 1
fi
