#!/bin/bash

### Install athomefrbD.sh as a daemon

# nginx installation steps
sudo cp athomefrbD.sh /etc/init.d/athomefrbD.sh
sudo chmod +x /etc/init.d/athomefrbD.sh
sudo update-rc.d athomefrbD.sh defaults

# Enable the athomefrb site
sudo cp athomefrb_nginx_site /etc/nginx/sites-enabled

# Start the nginx daemon:
sudo service athomefrbD.sh start

exit 0
