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
        self.host = host
        self.port = port


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
            sock.connect((self.host, self.port))
            return sock
        except Exception as ex:
            logger.error("Unable to connect to server: %s %d", self.host, self.port)
            logger.error(str(ex))

        return None


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
        jr = json.loads(response)["X10Response"]

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
        # Convert the payload structure into json text.
        # Effectively this serializes the payload.
        #print "raw json:", data
        json_data = json.JSONEncoder().encode(data)

        # Create a socket connection to the server
        sock = self.connect_to_server()
        if sock is None:
            return None

        # send status request to server
        try:
            logger.debug("Sending request: %s", json_data)
            sock.sendall(json_data.encode())

            # Receive data from the server and shut down
            json_data = AHPSRequest.read_json(sock)
        except Exception as ex:
            logger.error(str(ex))
            json_data = None
        finally:
            sock.close()

        return json.loads(json_data)["X10Response"]

    # TODO Replace address and house code with device-id

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


    def define_device(self, device_name, device_location, device_type, device_address, device_selected):
        """
        Define (create) a new device
        :param device_name:
        :param device_location:
        :param device_type:
        :param device_address:
        :param device_selected:
        :return:
        """
        req = AHPSRequest.create_request("DefineDevice")
        req["args"]["device-name"] = device_name
        req["args"]["device-location"] = device_location
        req["args"]["device-type"] = device_type
        req["args"]["device-address"] = device_address
        req["args"]["device-selected"] = device_selected
        response = self.send_command(req)
        return response


    def update_device(self, device_id, device_name, device_location, device_type, device_address, device_selected):
        """
        Update an existing device
        :param device_id:
        :param device_name:
        :param device_location:
        :param device_type:
        :param device_address:
        :param device_selected:
        :return:
        """
        req = AHPSRequest.create_request("UpdateDevice")
        req["args"]["device-id"] = device_id
        req["args"]["device-name"] = device_name
        req["args"]["device-location"] = device_location
        req["args"]["device-type"] = device_type
        req["args"]["device-address"] = device_address
        req["args"]["device-selected"] = device_selected
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
