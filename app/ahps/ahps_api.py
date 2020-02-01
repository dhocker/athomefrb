# coding: utf-8
#
# AHPS Web - web server for managing an AtHomePowerlineServer instance
# Copyright © 2014, 2019  Dave Hocker (email: AtHomeX10@gmail.com)
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

import socket
import json
import logging
from configuration import Configuration

logger = logging.getLogger("app")


class AHPSRequest:
    def __init__(self, host=Configuration.Server(), port=Configuration.Port()):
        """
        Request instance constructor
        :param host:
        :param port:
        """
        self._host = host
        self._port = port
        # The error response from the last request
        self._last_error_msg = None
        # The successful response from the last request
        self._last_response = None


    @property
    def last_error(self):
        return self._last_error_msg


    @property
    def last_response(self):
        return self._last_response


    @staticmethod
    def create_request(command):
        """
        Create an empty server request
        This is the safe way to create an empty request.
        The json module seems to be a bit finicky about the
        format of strings that it converts.
        :param command:
        :return:
        """
        request = {}
        request["request"] = command
        # The args parameter is an dictionary.
        request["args"] = {}
        return request


    def connect_to_server(self):
        """
        Open a socket to the server
        Note that a socket can only be used for one request.
        The server seems to close the socket at when it is
        finished handling the request.
        :return:
        """

        # Create a socket (SOCK_STREAM means a TCP socket)
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        try:
            # Connect to server and check status
            sock.connect((self._host, self._port))
        except Exception as ex:
            logger.error("Unable to connect to server: %s %d", self._host, self._port)
            logger.error(str(ex))
            raise ex

        return sock


    @staticmethod
    def read_json(sock):
        """
        Read a JSON payload from a socket
        :param sock:
        :return:
        """
        depth = 0
        json_data = ""

        while (True):
            c = sock.recv(1).decode()
            json_data += c

            if (c == "{"):
                depth += 1
            if (c == "}"):
                depth -= 1
                if (depth == 0):
                    return json_data


    @staticmethod
    def display_response(response):
        """
        Display a formatted response on the console
        :param response:
        :return:
        """
        jr = json.loads(response)

        logger.debug("Response for request: %s", jr["request"])

        # Loop through all of the entries in the response dict
        for k, v in jr.items():
            if k != "request":
                print(" ", k, ":", v)
        print()


    def send_command(self, data):
        """
        Send a command to the server
        :param data:
        :return:
        """
        self._last_error_msg = None

        # Convert the payload structure into json text.
        # Effectively this serializes the payload.
        # print "raw json:", data
        json_data = json.JSONEncoder().encode(data)

        # send status request to server
        sock = None
        try:
            # Create a socket connection to the server
            sock = self.connect_to_server()

            logger.debug("Sending request: %s", json_data)
            sock.sendall(json_data.encode())

            # Receive data from the server and shut down
            json_data = AHPSRequest.read_json(sock)
            self._last_response = json.loads(json_data)
        except Exception as ex:
            logger.error(str(ex))
            self._last_error_msg = {"message": str(ex)}
            self._last_response = None
        finally:
            if sock:
                sock.close()

        return self.last_response


    def device_on(self, device_id, dim_amount):
        """
        Send device on command
        :param address:
        :param dim_amount:
        :return:
        """
        data = AHPSRequest.create_request("On")
        data["args"]["device-id"] = device_id
        data["args"]["dim-amount"] = dim_amount

        return self.send_command(data)


    def device_off(self, device_id, dim_amount):
        """
        Send device off command
        :param address:
        :param dim_amount:
        :return:
        """
        data = AHPSRequest.create_request("Off")
        data["args"]["device-id"] = device_id
        data["args"]["dim-amount"] = dim_amount

        return self.send_command(data)


    def device_dim(self, device_id, dim_amount):
        """
        Send dim device command
        :param device_id:
        :param dim_amount:
        :return:
        """
        data = AHPSRequest.create_request("Dim")
        data["args"]["device-id"] = device_id
        data["args"]["dim-amount"] = dim_amount

        return self.send_command(data)


    def device_bright(self, device_id, bright_amount):
        """
        Send brighten device command
        :param device_id:
        :param bright_amount:
        :return:
        """
        data = AHPSRequest.create_request("Bright")
        data["args"]["device-id"] = device_id
        data["args"]["bright-amount"] = bright_amount

        return self.send_command(data)


    def device_all_units_off(self):
        """
        Send all units off command
        :param house_code:
        :return:
        """
        data = AHPSRequest.create_request("AllUnitsOff")

        return self.send_command(data)


    def device_all_lights_on(self):
        """
        Send all lights on command
        :return:
        """
        data = AHPSRequest.create_request("AllLightsOn")

        return self.send_command(data)


    def device_all_lights_off(self, house_code):
        """
        Send all lights off command
        :param house_code:
        :return:
        """
        data = AHPSRequest.create_request("AllLightsOff")
        data["args"]["house-code"] = house_code

        return self.send_command(data)


    def status_request(self):
        """
        Send status request command
        :return:
        """
        data = AHPSRequest.create_request("StatusRequest")

        return self.send_command(data)


    def get_all_devices(self):
        """
        Query for all devices
        :return:
        """
        req = AHPSRequest.create_request("QueryDevices")
        response = self.send_command(req)
        return response


    def get_all_available_devices(self, manufacturer):
        """
        Query for all available devices of a given type
        :return:
        """
        req = AHPSRequest.create_request("QueryAvailableDevices")
        req["args"]["type"] = manufacturer
        response = self.send_command(req)
        return response


    def get_device(self, device_id):
        """
        Query a device by its device id
        :param device_id:
        :return:
        """
        req = AHPSRequest.create_request("QueryDevices")
        req["args"]["device-id"] = device_id
        response = self.send_command(req)
        return response


    def define_device(self, device_name, device_location, device_mfg, device_address):
        """
        Define (create) a new device
        :param device_name:
        :param device_location:
        :param device_type:
        :param device_address:
        :return:
        """
        req = AHPSRequest.create_request("DefineDevice")
        req["args"]["device-name"] = device_name
        req["args"]["device-location"] = device_location
        req["args"]["device-mfg"] = device_mfg
        req["args"]["device-address"] = device_address
        response = self.send_command(req)
        return response


    def update_device(self, device_id, device_name, device_location, device_mfg, device_address):
        """
        Update an existing device
        :param device_id:
        :param device_name:
        :param device_location:
        :param device_type:
        :param device_address:
        :return:
        """
        req = AHPSRequest.create_request("UpdateDevice")
        req["args"]["device-id"] = device_id
        req["args"]["device-name"] = device_name
        req["args"]["device-location"] = device_location
        req["args"]["device-mfg"] = device_mfg
        req["args"]["device-address"] = device_address
        response = self.send_command(req)
        return response


    def delete_device(self, device_id):
        """
        Delete a device by its device id
        :param device_id:
        :return:
        """
        req = AHPSRequest.create_request("DeleteDevice")
        req["args"]["device-id"] = device_id
        response = self.send_command(req)
        return response


    def get_all_programs(self):
        """
        Query for all programs
        :return:
        """
        req = AHPSRequest.create_request("QueryPrograms")
        response = self.send_command(req)
        return response


    def delete_program(self, program_id):
        """
        Delete a program by its ID
        :param program_id:
        :return:
        """
        req = AHPSRequest.create_request("DeleteProgram")
        req["args"]["program-id"] = program_id
        response = self.send_command(req)
        return response


    def get_programs_for_device_id(self, device_id):
        """
        Query for all programs for a given device id
        :param device_id:
        :return:
        """
        req = AHPSRequest.create_request("QueryDevicePrograms")
        req["args"]["device-id"] = device_id
        response = self.send_command(req)
        return response


    def get_available_programs_for_device_id(self, device_id):
        """
        Query for all programs available for assignment to a given device id
        :param device_id:
        :return:
        """
        req = AHPSRequest.create_request("QueryAvailablePrograms")
        req["args"]["device-id"] = device_id
        response = self.send_command(req)
        return response

    def assign_program_to_device(self, device_id, program_id):
        req = AHPSRequest.create_request("AssignProgram")
        req["args"]["device-id"] = device_id
        req["args"]["program-id"] = program_id
        response = self.send_command(req)
        return response

    def assign_program_to_group_devices(self, group_id, program_id):
        req = AHPSRequest.create_request("AssignProgramToGroup")
        req["args"]["group-id"] = group_id
        req["args"]["program-id"] = program_id
        response = self.send_command(req)
        return response


    def get_program_by_id(self, program_id):
        """
        Query for a program by its id
        :param program_id:
        :return:
        """
        req = AHPSRequest.create_request("QueryDeviceProgram")
        req["args"]["program-id"] = program_id
        response = self.send_command(req)
        return response

    def define_device_program(self, program):
        req = AHPSRequest.create_request("DefineProgram")
        req["args"] = program
        response = self.send_command(req)
        return response

    def update_device_program(self, program):
        req = AHPSRequest.create_request("UpdateProgram")
        req["args"] = program
        response = self.send_command(req)
        return response


    def delete_device_program(self, device_id, program_id):
        """
        Delete a device program from its device
        :param program_id:
        :return:
        """
        req = AHPSRequest.create_request("DeleteDeviceProgram")
        req["args"]["device-id"] = device_id
        req["args"]["program-id"] = program_id
        response = self.send_command(req)
        return response


    def get_all_action_groups(self):
        """
        Query for all action groups
        :return:
        """
        req = AHPSRequest.create_request("QueryActionGroups")
        response = self.send_command(req)
        return response


    def get_action_group(self, group_id):
        """
        Query for an action group
        :return:
        """
        req = AHPSRequest.create_request("QueryActionGroup")
        req["args"]["group-id"] = group_id
        response = self.send_command(req)
        return response


    def define_action_group(self, group_name):
        """
        Define (create) a new device
        :param group_name:
        :return:
        """
        req = AHPSRequest.create_request("DefineActionGroup")
        req["args"]["group-name"] = group_name
        response = self.send_command(req)
        return response


    def delete_action_group(self, group_id):
        """
        Delete a device group
        :param group_id:
        :return:
        """
        req = AHPSRequest.create_request("DeleteActionGroup")
        req["args"]["group-id"] = group_id
        response = self.send_command(req)
        return response


    def update_action_group(self, group):
        req = AHPSRequest.create_request("UpdateActionGroup")
        req["args"] = group
        response = self.send_command(req)
        return response


    def get_action_group_devices(self, group_id):
        """
        Query for all devices in an action group
        :return:
        """
        req = AHPSRequest.create_request("QueryActionGroupDevices")
        req["args"]["group-id"] = group_id
        response = self.send_command(req)
        return response


    def get_available_devices_for_group_id(self, group_id):
        """
        Query for all devices available for assignment to a given group id
        :param device_id:
        :return:
        """
        req = AHPSRequest.create_request("QueryAvailableGroupDevices")
        req["args"]["group-id"] = group_id
        response = self.send_command(req)
        return response

    def assign_device_to_group(self, group_id, device_id):
        req = AHPSRequest.create_request("AssignDevice")
        req["args"]["group-id"] = group_id
        req["args"]["device-id"] = device_id
        response = self.send_command(req)
        return response


    def group_on(self, group_id):
        """
        Send group on command
        :param group_id:
        :return:
        """
        data = AHPSRequest.create_request("GroupOn")
        data["args"]["group-id"] = group_id

        return self.send_command(data)


    def group_off(self, group_id):
        """
        Send group off command
        :param address:
        :param dim_amount:
        :return:
        """
        data = AHPSRequest.create_request("GroupOff")
        data["args"]["group-id"] = group_id

        return self.send_command(data)


    def delete_action_group_device(self, group_id, device_id):
        """
        Send delete device from action group
        :param group_id:
        :param device_id
        :return:
        """
        data = AHPSRequest.create_request("DeleteActionGroupDevice")
        data["args"]["group-id"] = group_id
        data["args"]["device-id"] = device_id

        return self.send_command(data)
