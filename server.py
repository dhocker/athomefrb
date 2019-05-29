#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# AtHome Control
# Copyright © 2019  Dave Hocker (email: AtHomeX10@gmail.com)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, version 3 of the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the LICENSE file for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program (the LICENSE file).  If not, see <http://www.gnu.org/licenses/>.
#
# Create virtual env with requirements.txt
#   mkvirtualenv flask-env
#   pip install -r requirements.txt
#
# To start the web server:
#   workon flask-env            # Establish working virtual environment with Flask
#   python runserver.py

from app import app
import configuration
import Logging
import logging
import sys


if __name__ == "__main__":
    logger = logging.getLogger("app")
    logger.info(sys.version)

    try:
        # app.run('0.0.0.0', port=5001, debug=configuration.Configuration.Debug())
        # Reference: https://blog.miguelgrinberg.com/post/setting-up-a-flask-application-in-pycharm
        # Getting debugging to work with Flask. The use_reloader option is problematic.
        # If you set it to True, Pycharm debugging does not work.
        app.run('0.0.0.0', port=5001,
                debug=configuration.Configuration.Debug(),
                use_debugger=False,
                use_reloader=False,
                passthrough_errors=True)
    except Exception as ex:
        print(ex)

    logger.info("AtHomeControlFRB ended")
    logger.info("################################################################################")
    Logging.Shutdown()

    exit(0)

