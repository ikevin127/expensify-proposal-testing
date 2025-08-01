#!/bin/bash

# Run Jest coverage for changed files with focused patterns

# Read changed files and create arrays instead of string concatenation
readarray -t CHANGED_FILES_ARRAY < changed_files.txt

# Build coverage patterns array
COVERAGE_ARGS=()
for file in "${CHANGED_FILES_ARRAY[@]}"; do
  COVERAGE_ARGS+=("--collectCoverageFrom=$file")
done

# Get CPU core count with fallback to 4
echo "MAX_WORKERS environment variable: '${MAX_WORKERS}'"
WORKERS=${MAX_WORKERS:-4}
echo "Using $WORKERS workers (fallback applied if MAX_WORKERS was empty)"

echo "Running coverage with focused patterns..."
echo "Coverage patterns: ${COVERAGE_ARGS[*]}"
echo "Timeout: 60s, Workers: $WORKERS, Memory: 8GB"

# Run Jest with coverage focused on changed files only
NODE_OPTIONS="--max-old-space-size=8192 --experimental-vm-modules" npx jest \
  --coverage \
  --coverageDirectory=coverage \
  "${COVERAGE_ARGS[@]}" \
  --collectCoverageFrom="!src/**/*.d.ts" \
  --collectCoverageFrom="!src/**/*.stories.tsx" \
  --collectCoverageFrom="!src/**/*.test.{ts,tsx,js,jsx}" \
  --collectCoverageFrom="!src/**/*.spec.{ts,tsx,js,jsx}" \
  --collectCoverageFrom="!src/**/__tests__/**" \
  --collectCoverageFrom="!src/**/__mocks__/**" \
  --coverageReporters=json-summary \
  --coverageReporters=lcov \
  --coverageReporters=html \
  --coverageReporters=text-summary \
  --maxWorkers="$WORKERS" \
  --testTimeout=60000 \
  --silent
