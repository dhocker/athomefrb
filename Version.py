# coding=utf-8
#
# Susanna's Library - for tracking authors and books
# Copyright © 2016, 2024  Dave Hocker (email: AtHomeX10@gmail.com)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, version 3 of the License.
#
# See the LICENSE file for more details.
#
#######################################################################

from app import app

def GetVersion():
  """
  Returns the current app version
  """
  return "2024.3.0.1"


@app.context_processor
def get_version():
    '''
    Exposes the variable version to jinga2 template renderer.
    :return:
    '''
    return dict(version = GetVersion())
