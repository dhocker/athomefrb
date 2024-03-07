#!/bin/bash

### Install uwsgi emperor as a daemon
### Configure athomefrb as a uwsgi vassal

# Installation steps
sudo cp uwsgi-emperorD.sh /etc/init.d/uwsgi-emperorD.sh
sudo chmod +x /etc/init.d/uwsgi-emperorD.sh
sudo update-rc.d uwsgi-emperorD.sh defaults

# Set up emperor mode for athomefrb
sudo cp emperor.ini /etc/uwsgi
sudo cp athomefrb_uwsgi_app3.ini /etc/uwsgi/vassals

# Start the daemon:
sudo service uwsgi-emperorD.sh start

exit 0
