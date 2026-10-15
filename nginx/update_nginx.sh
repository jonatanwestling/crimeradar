#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔄 Updating host Nginx configuration..."

# 1. Copy Nginx site configuration to sites-available
echo "📋 Installing site configuration to /etc/nginx/sites-available/crime_report..."
sudo cp "$SCRIPT_DIR/crime_report_nginx" /etc/nginx/sites-available/crime_report

# 2. Enable the site configuration
if [ ! -f /etc/nginx/sites-enabled/crime_report ]; then
    sudo ln -s /etc/nginx/sites-available/crime_report /etc/nginx/sites-enabled/crime_report
fi

# 3. Remove default site if present to prevent port 80 conflicts
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "Removing default site to prevent port 80 conflicts..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# 4. Test configuration syntax
echo "Testing Nginx configuration syntax..."
sudo nginx -t

# 5. Reload Nginx
sudo systemctl reload nginx
echo "✅ Host Nginx successfully updated and reloaded!"
