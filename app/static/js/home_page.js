/*
    AtHome Control
    Copyright © 2019, 2024  Dave Hocker (email: AtHomeX10@gmail.com)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, version 3 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
    See the LICENSE file for more details.

    You should have received a copy of the GNU General Public License
    along with this program (the LICENSE file).  If not, see <http://www.gnu.org/licenses/>.
*/

import React from "react";
import {  Route, Routes } from "react-router-dom";
import { DevicesTable } from './devices_table';
import { EditDeviceForm } from './edit_device';
import { NewDevice } from './new_device';

/*
  Renders the home page of the app. This is the list of all devices.
*/
export class HomePage extends React.Component {
  render() {
    return (
      <div>
        <Routes>
          <Route path="*" exact element={<DevicesTable />} />
          <Route path="/editdevice/:deviceid/*" element={<EditDeviceForm />} />
          <Route path="/newdevice/*" exact element={<NewDevice />} />
        </Routes>
      </div>
    );
  }
}
