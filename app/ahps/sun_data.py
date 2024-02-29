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

import datetime
from zoneinfo import ZoneInfo
import astral
from astral import LocationInfo
from astral.sun import sun
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
    astral.Depression = 6  # equivalent to "civil"

    city_name = "New York"  # Default city
    if Configuration.City() != "":
        city_name = Configuration.City()

    state_name = Configuration.State()
    timezone_name = Configuration.Timezone()

    city_latitude = 0.0
    city_longitude = 0.0
    if Configuration.Latitude() != "":
        city_latitude = float(Configuration.Latitude())
    if Configuration.Longitude() != "":
        city_longitude = float(Configuration.Longitude())

    city_location = LocationInfo(city_name, state_name, timezone_name, city_latitude, city_longitude)

    for_date = datetime.date(for_datetime.year, for_datetime.month, for_datetime.day)
    s = sun(city_location.observer, date=for_date, tzinfo=city_location.timezone)

    return s


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
