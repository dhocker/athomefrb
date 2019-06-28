#!/bin/bash

### Uninstall (remove) athomefrbD.sh as a daemon

# Uninstall steps
sudo service athomefrbD.sh stop
sudo rm /etc/init.d/athomefrbD.sh
sudo update-rc.d -f athomefrbD.sh remove

exit 0

