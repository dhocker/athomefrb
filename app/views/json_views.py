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

from datetime import timedelta, datetime
import json
from app import app
from flask import jsonify, request, make_response
from app.ahps.ahps_api import AHPSRequest
from app.ahps.sun_data import get_astral_data


@app.route("/devices", methods=['GET'])
def get_devices():
    api_req = AHPSRequest()
    res = api_req.get_all_devices()
    return jsonify({"data": res["devices"]})


@app.route("/devices/<id>", methods=['GET'])
def get_device(id):
    api_req = AHPSRequest()
    res = api_req.get_device(id)
    return jsonify({"data": res["device"]})


@app.route("/deviceprograms/<id>", methods=['GET'])
def get_device_programs(id):
    api_req = AHPSRequest()
    res = api_req.get_programs_for_device_id(id)

    # Build response with program summary
    for p in res["programs"]:
        p["summary"] = build_program_summary(p)

    return jsonify({"data": res["programs"]})


@app.route('/devices/<id>/state', methods=['PUT'])
def set_devices_state(id):
    """
    Change state of device to on or off
    :param roomid:
    :return:
    """
    # NOTE
    # The jQuery $.ajax call sends arguments as the data property
    # in the initiating call. The arguments show up in the
    # request.form property provided by Flask. So,
    # data: { 'state': new_state } --> request.form['state']
    arg = request.form['state']
    api_req = AHPSRequest()
    if arg == "on":
        if api_req.device_on(id, 0):
            # Return success
            pass
        else:
            # Return error
            pass
    elif arg == "off":
        if api_req.device_off(id, 0):
            # Return success
            pass
        else:
            # Return error
            pass
    else:
        # Return an error
        pass

    # We are obligated to send a json response
    resp = make_response("{}")
    resp.status_code = 200
    return resp


@app.route('/devices/<id>', methods=['PUT'])
def save_device(id):
    """
    Save an edited device definition
    :param roomid:
    :return:
    """
    # NOTE
    # The jQuery $.ajax call sends arguments as the data property
    # in the initiating call. The arguments show up in the
    # request.form property provided by Flask. So,
    # data: { 'state': new_state } --> request.form['state']
    name = request.form['name']
    location = request.form['location']
    device_type = request.form['type']
    address = request.form['address']
    selected = normalize_boolean(request.form["selected"])
    api_req = AHPSRequest()

    r = api_req.update_device(id, name, location, device_type, address, selected)

    # We are obligated to send a json response
    return jsonify(r)


@app.route('/devices', methods=['POST'])
def define_device():
    """
    Save an edited device definition
    :param roomid:
    :return:
    """
    # NOTE
    # The jQuery $.ajax call sends arguments as the data property
    # in the initiating call. The arguments show up in the
    # request.form property provided by Flask. So,
    # data: { 'state': new_state } --> request.form['state']
    name = request.form['name']
    location = request.form['location']
    device_type = request.form['type']
    address = request.form['address']
    selected = normalize_boolean(request.form["selected"])
    api_req = AHPSRequest()

    r = api_req.define_device(name, location, device_type, address, selected)

    # We are obligated to send a json response
    return jsonify(r)


@app.route('/devices/<id>', methods=['DELETE'])
def delete_device(id):
    """
    Delete a device definition
    :param roomid:
    :return:
    """
    api_req = AHPSRequest()

    r = api_req.delete_device(id)
    # r = {"message": "Success"}

    # We are obligated to send a json response
    return jsonify(r)


def build_program_summary(program):
    """
    Build a summary line (human readable) for a device timer program
    :param program:
    :return:
    """
    sun_data = get_astral_data(datetime.now())
    sunset = sun_data["sunset"]
    sunrise = sun_data["sunrise"]

    effective_start_time = "No Time"
    offset = timedelta(minutes=int(program["offset"]))
    if program["triggermethod"] == "sunset":
        effective_start_time = (sunset + offset).strftime("%I:%M%p")
    elif program["triggermethod"] == "sunrise":
        effective_start_time = (sunrise + offset).strftime("%I:%M%p")
    elif program["triggermethod"] == "clock-time":
        st = program["time"]
        start_time = datetime.strptime(program["time"], "%Y-%m-%d %H:%M:%S")
        effective_start_time = (start_time + offset).strftime("%I:%M%p")
    else:
        effective_start_time = "No Time"

    start = "{0} Method={1} Offset={2} EffectiveTime={3} Action={4}".format(
        program["daymask"],
        program["triggermethod"],
        program["offset"],
        effective_start_time, program["command"])
    return start


def normalize_boolean(str_value):
    """
    Normalize a string representation of a boolean value.
    :param str_value: 'true' or 'false'
    :return: True or False
    """
    v = False
    if str_value.lower() == "true":
        v = True
    return v
