mv crime_report_nginx ~/etc/nginx/sites-available/crime_report_api

sudo ln -s /etc/nginx/sites-available/crime_report_api \
    /etc/nginx/sites-enabled/crime_report_api
