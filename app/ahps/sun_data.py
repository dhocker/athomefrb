# -*- coding: utf-8 -*-
#
# AHPS Web - web server for managing an AtHomePowerlineServer instance
# Copyright (C) 2014, 2015  Dave Hocker (email: AtHomeX10@gmail.com)
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

from astral import Astral
from configuration import Configuration


def get_astral_data(for_datetime):
    '''
    Returns the sunrise and sunset times for the given date.
    Uses the Astral package to compute sunrise/sunset for the
    configured city.
    Reference https://pythonhosted.org/astral/module.html
    :param for_datetime:
    :return: Returns a dict containing the keys sunrise and sunset.
    The values are datetime objects.
    '''
    a = Astral()
    a.solar_depression = "civil"
    # We use a city just to get a city object. Then we override the lat/long.
    # The city object can produce sunrise/sunset in local time.
    if Configuration.City() != "":
        city = a[Configuration.City()]
    else:
        # Default if no city is configured
        city = a["New York"]
    if Configuration.Latitude() != "":
        city.latitude = float(Configuration.Latitude())
    if Configuration.Longitude() != "":
        city.longitude = float(Configuration.Longitude())

    return city.sun(date=for_datetime, local=True)


def get_sun_data(for_datetime):
    '''
    Returns the sunrise and sunset times for the given date.
    Uses the Astral package to compute sunrise/sunset for the
    configured city.
    Reference https://pythonhosted.org/astral/module.html
    :param for_datetime:
    :return: Returns a dict containing the keys sunrise and sunset.
    '''

    sun_data = get_astral_data(for_datetime)

    sun_data_response = {}
    sun_data_response["sunrise"] = sun_data["sunrise"].isoformat()
    sun_data_response["sunset"] = sun_data["sunset"].isoformat()

    return sun_data_response
