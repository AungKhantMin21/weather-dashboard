#!/bin/sh

# Inject runtime API_URL into the built JS files
if [ -n "$VITE_API_URL" ]; then
  echo "Replacing API_URL with: $VITE_API_URL"
  find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|http://localhost:3000|$VITE_API_URL|g" {} \;
fi

# Start nginx
exec nginx -g "daemon off;"
