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

from app import app
from flask import render_template
# from Version import GetVersion

#
# This may not look very pretty but it is simple and it works
#

@app.route("/", methods=['GET'])
@app.route("/programs", methods=['GET'])
@app.route("/groups", methods=['GET'])
def index():
    return render_template('index.html')


@app.route("/about", methods=['GET'])
def about():
    return render_template('index.html')


@app.route("/away", methods=['GET'])
def away():
    return render_template('index.html')
