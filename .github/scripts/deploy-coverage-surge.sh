#!/bin/bash

# Deploy coverage static to Surge.sh

# Check if required arguments are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <PR_NUMBER> <RUN_ID>"
    exit 1
fi

PR_NUMBER=$1
RUN_ID=$2

# Install surge globally
npm install -g surge

# Create a unique subdomain for this PR and run
DOMAIN="expensify-proposal-testing-coverage-pr${PR_NUMBER}-run${RUN_ID}.surge.sh"

# Deploy to surge with token (you'll need to add SURGE_TOKEN as a repository secret)
surge ./coverage "$DOMAIN" --token $SURGE_TOKEN

# Save the coverage URL for the next step
echo "COVERAGE_URL=https://$DOMAIN" >> "$GITHUB_ENV"
echo "Coverage report deployed to: https://$DOMAIN"
