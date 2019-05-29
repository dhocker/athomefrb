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
from configuration import Configuration
import logging


logger = logging.getLogger("app")


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


@app.route("/devices/<id>/program", methods=['POST'])
def create_new_device_program(id):
    program = {}
    program["name"] = request.form['name']
    program["device-id"] = id
    program["day-mask"] = request.form['daymask']
    program["trigger-method"] = request.form['triggermethod']
    program["time"] = request.form['time']
    program["offset"] = request.form['offset']
    program["randomize"] = normalize_boolean(request.form["randomize"])
    program["randomize-amount"] = request.form['randomizeamount']
    program["command"] = request.form['command']
    program["dimamount"] = request.form['dimamount']
    program["args"] = request.form['args']

    api_req = AHPSRequest()
    res = api_req.define_device_program(program)
    # return jsonify({"data": res["device"]})
    return jsonify(res)


@app.route("/deviceprograms/<id>", methods=['GET'])
def get_device_programs(id):
    """
    Get all programs for a given device ID
    :param id:
    :return:
    """
    api_req = AHPSRequest()
    res = api_req.get_programs_for_device_id(id)

    # Build response with program summary
    for p in res["programs"]:
        p["summary"] = build_program_summary(p)

    return jsonify({"data": res["programs"]})


@app.route('/deviceprograms/<id>', methods=['DELETE'])
def delete_device_program(id):
    """
    Delete a device program
    :param id:
    :return:
    """
    api_req = AHPSRequest()

    r = api_req.delete_device_program(id)

    # We are obligated to send a json response
    return jsonify(r)


@app.route("/deviceprogram/<id>", methods=['GET'])
def get_device_program(id):
    """
    Get the device program for progran ID
    :param id:
    :return:
    """
    api_req = AHPSRequest()
    res = api_req.get_program_by_id(id)

    return jsonify({"data": res["program"]})


@app.route('/deviceprogram/<id>', methods=['PUT'])
def save_device_program(id):
    """
    Save an edited device program
    :param roomid:
    :return:
    """
    program = {"id": id}
    program["name"] = request.form['name']
    program["device-id"] = request.form['deviceid']
    program["day-mask"] = request.form['daymask']
    program["trigger-method"] = request.form['triggermethod']
    program["time"] = request.form['time']
    program["offset"] = request.form['offset']
    program["randomize"] = normalize_boolean(request.form["randomize"])
    program["randomize-amount"] = request.form['randomizeamount']
    program["command"] = request.form['command']
    program["dimamount"] = request.form['dimamount']
    program["args"] = request.form['args']

    api_req = AHPSRequest()

    # TODO Implement update device program API
    r = api_req.update_device_program(program)
    # r = {"message": "Not implemented"}
    logger.debug("Update device program: %s", json.dumps(program, indent=4))

    # We are obligated to send a json response
    return jsonify(r)


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


@app.route('/location', methods=['GET'])
def get_location():
    """
    Returns the location as configured
    :return:
    """
    resp = {
        "latitude": Configuration.Latitude(),
        "longitude": Configuration.Longitude()
    }
    return jsonify(resp)


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
