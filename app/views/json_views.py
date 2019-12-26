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

"""
How to send JSON from Javascript jQuery

  $.ajax({
    method: "PUT", // or POST
    url: url,
    data: JSON.stringify(this.state.rows), // Whatever data you want to send to server
    dataType: "json", // content type being received
    contentType: "application/json", // content type being sent
    processData: false,
    success: function(data, status, xhr) {
        // Handle success
    },
    error: function(xhr, status, msg) {
        // Handle error
    }
  });
"""

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
    if res and "devices" in res.keys():
        return jsonify({"data": res["devices"]})
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


@app.route("/availabledevices/tplink", methods=['GET'])
def get_available_tplink_devices():
    api_req = AHPSRequest()
    res = api_req.get_all_available_devices("tplink")
    if res and "devices" in res.keys():
        return jsonify({"data": res["devices"]})
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response
    return ""


@app.route("/devices/<id>", methods=['GET'])
def get_device(id):
    api_req = AHPSRequest()
    res = api_req.get_device(id)
    if res:
        return jsonify({"data": res["device"]})
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


@app.route("/devices/<id>/programs", methods=['POST'])
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
    if res:
        return jsonify(res)
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


@app.route("/devices/<id>/programs", methods=['GET'])
def get_device_programs(id):
    """
    Get all programs for a given device ID
    :param id:
    :return:
    """
    api_req = AHPSRequest()
    res = api_req.get_programs_for_device_id(id)

    # Build response with program summary
    if res:
        for p in res["programs"]:
            p["summary"] = build_program_summary(p)

        return jsonify({"data": res["programs"]})
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


@app.route('/programs/<id>', methods=['DELETE'])
def delete_device_program(id):
    """
    Delete a device program
    :param id:
    :return:
    """
    api_req = AHPSRequest()

    r = api_req.delete_device_program(id)

    # We are obligated to send a json response
    if r:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


@app.route("/programs/<id>", methods=['GET'])
def get_device_program(id):
    """
    Get the device program for progran ID
    :param id:
    :return:
    """
    api_req = AHPSRequest()
    res = api_req.get_program_by_id(id)

    if res:
        return jsonify({"data": res["program"]})
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


@app.route('/programs/<id>', methods=['PUT'])
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
    if r:
        logger.debug("Update device program: %s", json.dumps(program, indent=4))

        # We are obligated to send a json response
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


@app.route('/devices/selected/state', methods=['PUT'])
def set_selected_devices_state():
    arg = request.form['state']
    api_req = AHPSRequest()
    if arg == "on":
        res = api_req.selected_devices_on()
    elif arg == "off":
        res = api_req.selected_devices_off()
    else:
        # Return an error
        res = None

    # We are obligated to send a json response
    if res:
        resp = jsonify(res)
        if res["result-code"]:
            resp.status_code = 500
        else:
            resp.status_code = 200
        return resp

    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


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
        res = api_req.device_on(id, 0)
    elif arg == "off":
        res = api_req.device_off(id, 0)
    else:
        # Return an error
        res = None

    # We are obligated to send a json response
    if res:
        resp = jsonify(res)
        if res["result-code"]:
            resp.status_code = 500
        else:
            resp.status_code = 200
        return resp

    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


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
    if r:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


@app.route('/devices', methods=['PUT'])
def save_all_devices():
    """
    Save all device definitions
    :return:
    """
    devices = request.get_json()
    api_req = AHPSRequest()

    for device in devices:
        r = api_req.update_device(device["id"],
                                  device["name"],
                                  device["location"],
                                  device["type"],
                                  device["address"],
                                  normalize_boolean(device["selected"]))
        if not r:
            response = jsonify(api_req.last_error)
            response.status_code = 500
            return response

    # We are obligated to send a json response
    if r:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


@app.route('/devices', methods=['POST'])
def define_device():
    """
    Save an new device definition
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
    if r:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


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
    if r:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = 500
    return response


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
    randomize = ""
    offset = timedelta(minutes=int(program["offset"]))
    if program["triggermethod"] == "sunset":
        effective_start_time = (sunset + offset).strftime("%I:%M%p")
    elif program["triggermethod"] == "sunrise":
        effective_start_time = (sunrise + offset).strftime("%I:%M%p")
    elif program["triggermethod"] == "clock-time":
        st = program["time"]
        start_time = datetime.strptime(program["time"], "%Y-%m-%d %H:%M:%S")
        effective_start_time = (start_time + offset).strftime("%I:%M%p")
        if program["randomize"]:
            randomize = "Randomize={0}".format(program["randomizeamount"])
    else:
        effective_start_time = "No Time"

    start = "{0} Method={1} Offset={2} {3} EffectiveTime={4} Action={5}".format(
        program["daymask"],
        program["triggermethod"],
        program["offset"],
        randomize,
        effective_start_time, program["command"])
    return start


def normalize_boolean(str_value):
    """
    Normalize a string representation of a boolean value.
    :param str_value: 'true' or 'false'
    :return: True or False
    """
    v = False
    if isinstance(str_value, int):
        v = not not str_value
    elif isinstance(str_value, str):
        v = str_value.lower() == "true"
    elif isinstance(str_value, bool):
        v = str_value
    return v
