#!/bin/bash

### Install athomefrbD.sh as a daemon

# Installation steps
sudo cp athomefrbD.sh /etc/init.d/athomefrbD.sh
sudo chmod +x /etc/init.d/athomefrbD.sh
sudo update-rc.d athomefrbD.sh defaults

# Start the daemon: 
sudo service athomefrbD.sh start

exit 0

