# AtHome Control Using Flask, React, Bootstrap and Webpack

## Overview
This is the newest iteration of AtHome Control developed using 
Pyathon 3, Flask, React, Booststrap and Webpack.

## Set Up
Install node and npm. On macOS this can be done in one action
using brew.

    brew install node

On Raspbian versions prior to Buster, 
installing nodejs a little more complicated. Detailed information
can be found here:

[http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/](http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/)

[https://github.com/nodesource/distributions](https://github.com/nodesource/distributions)

This sequence of commands updates the Debian apt package system to
include the latest NodeSource releases. Then, it installs Version 12
of nodejs.

    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt-get install -y nodejs

Raspbian Buster ships with nodejs v10.15.2 and npm 5.8.0 available. 
Install these using apt.

```bash
sudo apt-get install nodejs npm
```

Once nodejs and npm are available, you can create a 
venv using the requirements.txt file.

    mkvirtualenv -p python3 -r requirements.txt athomefrb3

Install Webpack and various dependencies called out in package.json. On a system 
like a Raspberry Pi this can take a long, long time.

    npm install

**NOTE:** npm tends to complain about the version of nodejs you have installed.
For example, Raspbian Buster, initially shipped with nodejs 10. However, 
## Development Build
Run a one time build based on webpack.config.js

    npm run build
    
Or, run build watcher

    npm run build-w

## Production/Deployment Build
Run a one time build based on production.webpack.config.js

    npm run build-p
    
This build uglifies and compresses the compiled output.

## Debug and Test
Use PyCharm.

## Run Test Server from Root Directory

    python server.py

## Using NGINX and uWSGI
**This needs to be rewritten.**

NGINX with uWSGI makes a good "production" environment.

### NGINX
The stock version of nginx that installs through apt-get is usually adequate. This app does not
present a heavy load.

NGINX likes to run under a non-root user like www-data. Keep this in mind as you build your configuration.
Using the same user with uWSGI greatly simplifies things. For example, make sure the directory where you put
your unix socket file is owned and accessible by www-data (or whatever user you choose).

### uWSGI
The stock version of uWSGI that is currently installed under Raspbian is usually out of date and
it is built for Python 2 only.
It is recommended that you install the most current version of uWSGI
by [building uWSGI from source](https://uwsgi-docs.readthedocs.io/en/latest/Install.html).
Then, modify the init.d script to use the version you built/installed.
The uwsgi-emperor script file described above does exactly that.


## Run NGINX with uWSGI Non-Emperor Mode

### susannas_nginx_site
nginx configuration file for the app. This file should go in /etc/nginx/sites-available.
To activate the site, put a symbolic link to the file in /etc/nginx/sites-enabled.
Edit this file based on your nginx server installation. If Susanna's Library is the only web app running
under nginx, you might not need to make any changes. This configuration uses port 5005 to route
traffic to the app.

### susannas_uwsgi_app3.ini
uwsgi configuration file for the app. For non-Emperor mode,
this file should go in /etc/uwsgi/apps-available.
To activate the app for non-Emperor mode, put a symbolic link in /etc/uwsgi/apps-enabled.
Edit this file based on how you set up your virtualenv. If you rename the file, make sure it ends
with .ini otherwise uwsgi will not recognize it.

## Run NGINX with uWSGI Emperor Mode
###susannas_nginx_site
nginx configuration file for the app. This file should go in /etc/nginx/sites-available.
To activate the site, put a symbolic link to the file in /etc/nginx/sites-enabled.
Edit this file based on your nginx server installation. If Susanna's Library is the only web app running
under nginx, you might not need to make any changes. This configuration uses port 5005 to route
traffic to the app.

### uwsgi-emperor
If you want to use emperor mode, put this file in /etc/init.d and register it as
a start up daemon using update-rc.d. Remove any other uwsgi init.d script.

### susannas_uwsgi_app3.ini
uwsgi configuration file for the app.
For Emperor mode, put this file in /etc/uwsgi/vassals.
Edit this file based on how you set up your virtualenv. If you rename the file, make sure it ends
with .ini otherwise uwsgi will not recognize it.

## Additional References
