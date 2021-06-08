# -*- coding: utf-8 -*-
#
# AtHome Control
# Copyright © 2019, 2020  Dave Hocker (email: AtHomeX10@gmail.com)
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
import time
from datetime import timedelta, datetime
import json
from http import HTTPStatus
from app import app
from flask import jsonify, request, make_response
from app.ahps.ahps_api import AHPSRequest
from app.ahps.sun_data import get_astral_data
from configuration import Configuration
from Version import get_version
import logging


logger = logging.getLogger("app")


@app.route("/version", methods=['GET'])
def get_app_version():
    response = jsonify(get_version())
    response.status_code = HTTPStatus.OK
    return response


@app.route("/devices", methods=['GET'])
def get_devices():
    api_req = AHPSRequest()
    res = api_req.get_all_devices()
    if res and "devices" in res.keys():
        return jsonify({"data": res["devices"]})
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/availabledevices/tplink", methods=['GET'])
def get_available_tplink_devices():
    api_req = AHPSRequest()
    res = api_req.get_all_available_devices("tplink")
    if res and "devices" in res.keys():
        kv = res["devices"]
        return jsonify({"data": kv})
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/availabledevices/meross", methods=['GET'])
def get_available_meross_devices():
    api_req = AHPSRequest()
    res = api_req.get_all_available_devices("meross")
    if res and "devices" in res.keys():
        kv = res["devices"]
        return jsonify({"data": kv})
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/discoverdevices", methods=['GET'])
def discover_devices():
    api_req = AHPSRequest()
    res = api_req.discover_devices()
    if res and "result-code" in res.keys() and res["result-code"] == 0:
        return jsonify({})
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/devices/<id>", methods=['GET'])
def get_device(id):
    api_req = AHPSRequest()
    res = api_req.get_device(id)
    if res:
        return jsonify({"data": res["device"]})
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/programs", methods=['POST'])
def create_new_program():
    program = {}
    program["name"] = request.form['name']
    program["day-mask"] = request.form['daymask']
    program["trigger-method"] = request.form['triggermethod']
    program["time"] = request.form['time']
    program["offset"] = request.form['offset']
    program["randomize"] = normalize_boolean(request.form["randomize"])
    program["randomize-amount"] = request.form['randomizeamount']
    program["command"] = request.form['command']
    program["color"] = request.form['color']
    program["brightness"] = request.form['brightness']

    api_req = AHPSRequest()
    res = api_req.define_device_program(program)
    if res:
        return jsonify(res)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/programs/all", methods=['GET'])
def get_all_programs():
    """
    Get all programs
    :param id:
    :return:
    """
    api_req = AHPSRequest()
    res = api_req.get_all_programs()

    # Build response with program summary
    if res:
        for p in res["programs"]:
            p["summary"] = build_program_summary(p)

        return jsonify({"data": res["programs"]})
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route('/programs/<id>', methods=['DELETE'])
def delete_program(id):
    """
    Delete a program
    :param roomid:
    :return:
    """
    api_req = AHPSRequest()

    r = api_req.delete_program(id)
    # r = {"message": "Success"}

    # We are obligated to send a json response
    if r:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
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
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/availableprograms/device/<id>", methods=['GET'])
def get_available_device_programs(id):
    """
    Get all programs available for assignment to a given device ID
    :param id: The device ID for avialable programs
    :return:
    """
    api_req = AHPSRequest()
    res = api_req.get_available_programs_for_device_id(id)

    # Build response with program summary
    if res:
        for p in res["programs"]:
            p["summary"] = build_program_summary(p)

        return jsonify({"data": res["programs"]})
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/deviceprograms/<device_id>/<program_id>", methods=['POST'])
def add_program_to_device(device_id, program_id):
    api_req = AHPSRequest()

    r = api_req.assign_program_to_device(device_id, program_id)

    if r and r["result-code"] == 0:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route('/devices/<device_id>/programs/<program_id>', methods=['DELETE'])
def delete_device_program(device_id, program_id):
    """
    Delete a program from a device
    :param id:
    :return:
    """
    api_req = AHPSRequest()

    r = api_req.delete_device_program(device_id, program_id)

    # We are obligated to send a json response
    if r:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/actiongroupprograms/<group_id>/<program_id>", methods=['POST'])
def add_program_to_group_devices(group_id, program_id):
    api_req = AHPSRequest()

    r = api_req.assign_program_to_group_devices(group_id, program_id)

    if r and r["result-code"] == 0:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
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
    response.status_code = HTTPStatus.BAD_REQUEST
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
    program["day-mask"] = request.form['daymask']
    program["trigger-method"] = request.form['triggermethod']
    program["time"] = request.form['time']
    program["offset"] = request.form['offset']
    program["randomize"] = normalize_boolean(request.form["randomize"])
    program["randomize-amount"] = request.form['randomizeamount']
    program["command"] = request.form['command']
    program["color"] = request.form['color']
    program["brightness"] = request.form['brightness']

    api_req = AHPSRequest()

    r = api_req.update_device_program(program)
    if r:
        logger.debug("Update device program: %s", json.dumps(program, indent=4))

        # We are obligated to send a json response
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route('/devices/state', methods=['PUT'])
def set_all_devices_state():
    """
    Change state of all devices to on or off
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
        res = api_req.all_devices_on()
    elif arg == "off":
        res = api_req.all_devices_off()
    else:
        # Return an error
        res = None

    # We are obligated to send a json response
    if res:
        resp = jsonify(res)
        if res["result-code"]:
            resp.status_code = HTTPStatus.BAD_REQUEST
        else:
            resp.status_code = HTTPStatus.OK
        return resp

    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
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
        if "color" in request.form.keys():
            color = request.form['color']
        else:
            color = None
        if "brightness" in request.form.keys():
            brightness = request.form['brightness']
        else:
            brightness = None
        res = api_req.device_on(id, color=color, brightness=brightness)
    elif arg == "off":
        res = api_req.device_off(id)
    else:
        # Return an error
        res = None

    # We are obligated to send a json response
    if res:
        resp = jsonify(res)
        if res["result-code"]:
            resp.status_code = HTTPStatus.BAD_REQUEST
        else:
            resp.status_code = HTTPStatus.OK
        return resp

    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route('/newdevice/state', methods=['PUT'])
def set_new_device_state():
    """
    Change state of a new device to on or off
    :return:
    """
    # NOTE
    # The jQuery $.ajax call sends arguments as the data property
    # in the initiating call. The arguments show up in the
    # request.form property provided by Flask. So,
    # data: { 'state': new_state } --> request.form['state']
    state = request.form['state']
    mfg = request.form['mfg']
    address = request.form['address']
    channel = request.form['channel']
    name = request.form['name'] if "name" in request.form.keys() else "new device"

    api_req = AHPSRequest()
    if state == "on":
        color = request.form['color'] if "color" in request.form.keys() else ""
        brightness = request.form['brightness'] if "brightness" in request.form.keys() else 100
        res = api_req.new_device_on(mfg, address, channel, name, color, brightness)
    elif state == "off":
        res = api_req.new_device_off(mfg, address, channel, name)
    else:
        # Return an error
        res = None

    # We are obligated to send a json response
    if res:
        resp = jsonify(res)
        if res["result-code"]:
            resp.status_code = HTTPStatus.BAD_REQUEST
        else:
            resp.status_code = HTTPStatus.OK
        return resp

    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route('/devices/<id>', methods=['PUT'])
def save_device(id):
    """
    Save an edited device definition
    :param roomid:
    :return:
    """
    # NOTE
    # The jQuery $.ajax call sends arguments as the data property[TPLink Python Library](https://github.com/GadgetReactor/pyHS100)
    # 5.  [Meross Python Library](https://github.com/albertogeniola/MerossIot)
    # in the initiating call. The arguments show up in the
    # request.form property provided by Flask. So,
    # data: { 'state': new_state } --> request.form['state']
    name = request.form['name']
    location = request.form['location']
    device_mfg = request.form['mfg']
    address = request.form['address']
    channel = int(request.form["channel"])
    color = request.form["color"]
    brightness = request.form["brightness"]

    api_req = AHPSRequest()

    r = api_req.update_device(id, name, location, device_mfg, address, channel, color, brightness)

    # We are obligated to send a json response
    if r:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
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
                                  device["address"])
        if not r:
            response = jsonify(api_req.last_error)
            response.status_code = HTTPStatus.BAD_REQUEST
            return response

    # We are obligated to send a json response
    if r:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
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
    device_mfg = request.form['mfg']
    address = request.form['address']
    channel = int(request.form["channel"])
    color = request.form["color"]
    brightness = request.form["brightness"]

    api_req = AHPSRequest()

    r = api_req.define_device(name, location, device_mfg, address, channel, color, brightness)

    # We are obligated to send a json response
    if r:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
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
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/actiongroups", methods=['GET'])
def get_action_groups():
    api_req = AHPSRequest()
    res = api_req.get_all_action_groups()
    if res and "groups" in res.keys():
        return jsonify({"data": res["groups"]})
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route('/actiongroups', methods=['POST'])
def define_action_group():
    """
    Save an new action group definition
    :param roomid:
    :return:
    """
    # NOTE
    # The jQuery $.ajax call sends arguments as the data property
    # in the initiating call. The arguments show up in the
    # request.form property provided by Flask. So,
    # data: { 'state': new_state } --> request.form['state']
    name = request.form['name']
    api_req = AHPSRequest()

    r = api_req.define_action_group(name)

    # We are obligated to send a json response
    if r and r["result-code"] == 0:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/actiongroups/<group_id>", methods=['DELETE'])
def delete_action_group(group_id):
    api_req = AHPSRequest()
    res = api_req.delete_action_group(group_id)
    if res:
        return jsonify(res)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/actiongroups/<group_id>", methods=['GET'])
def get_action_group(group_id):
    api_req = AHPSRequest()
    res = api_req.get_action_group(group_id)
    if res and "group" in res.keys():
        return jsonify({"data": res["group"]})
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route('/actiongroups/<id>', methods=['PUT'])
def save_action_group(id):
    """
    Save an edited action group
    :param roomid:
    :return:
    """
    group = {
        "group-id": id,
        "group-name": request.form['name']
    }

    api_req = AHPSRequest()

    r = api_req.update_action_group(group)
    if r:
        logger.debug("Update action group: %s", json.dumps(group, indent=4))

        # We are obligated to send a json response
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/actiongroups/<group_id>/devices", methods=['GET'])
def get_action_group_devices(group_id):
    api_req = AHPSRequest()
    res = api_req.get_action_group_devices(group_id)
    if res and "devices" in res.keys():
        return jsonify({"data": res["devices"]})
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/availabledevices/group/<id>", methods=['GET'])
def get_available_group_devices(id):
    """
    Get all devices available for assignment to a given group ID
    :param id: The group ID for avialable devices
    :return:
    """
    api_req = AHPSRequest()
    res = api_req.get_available_devices_for_group_id(id)

    # Build response with program summary
    if res and "devices" in res.keys():
        return jsonify({"data": res["devices"]})
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route("/groupdevices/<group_id>/<device_id>", methods=['POST'])
def add_device_to_group(group_id, device_id):
    api_req = AHPSRequest()

    r = api_req.assign_device_to_group(group_id, device_id)

    if r and r["result-code"] == 0:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route('/actiongroups/<group_id>/state', methods=['PUT'])
def set_groups_state(group_id):
    """
    Change state of all devices in group to on or off
    :param groupid:
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
        res = api_req.group_on(group_id)
    elif arg == "off":
        res = api_req.group_off(group_id)
    else:
        # Return an error
        res = None

    # We are obligated to send a json response
    if res:
        resp = jsonify(res)
        if res["result-code"]:
            resp.status_code = HTTPStatus.BAD_REQUEST
        else:
            resp.status_code = HTTPStatus.OK
        return resp

    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
    return response


@app.route('/actiongroups/<group_id>/devices/<device_id>', methods=['DELETE'])
def delete_action_group_device(group_id, device_id):
    """
    Delete a from from an action group
    :param group_id:
    :param device_id:
    :return:
    """
    api_req = AHPSRequest()

    r = api_req.delete_action_group_device(group_id, device_id)

    # We are obligated to send a json response
    if r and r["result-code"] == 0:
        return jsonify(r)
    response = jsonify(api_req.last_error)
    response.status_code = HTTPStatus.BAD_REQUEST
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
