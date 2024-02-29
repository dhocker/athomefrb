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
import { HomePage } from './home_page';
import { DeviceProgramsTable } from './device_programs';
import { DeviceProgram } from './device_program';
import { NewProgram } from './new_program';
import { ProgramsTable} from './programs_table';
import { AvailableProgramsTable } from "./available_programs";
import { ActionGroups } from "./action_groups";
import { ActionGroupDevices } from "./action_group_devices";
import { EditActionGroupForm } from "./edit_action_group";
import { NewActionGroupForm } from "./new_action_group";
import { AvailableGroupDevices } from "./available_group_devices";
import { AvailableGroupProgramsTable} from "./available_group_programs";
import { About } from './about';
import { VersionComponent } from './version_component';

// TODO Is this function used?
export function NotImplemented() {
  let idkey = "";
  let id = "";
  if (arguments[0].match.params.id) {
    idkey = "ID";
    id = arguments[0].match.params.id;
  }
  else if (arguments[0].match.params.groupid) {
    idkey = "Group ID";
    id = arguments[0].match.params.groupid;
  }

  return (
    <div>
      <h2>Not Implemented</h2>
      <p>{idkey}: {id}</p>
    </div>
  );
}

/*
  Design Point on How React Router Works
  --------------------------------------
  Every level must pass a URL or it will be filtered out.
  Technically, we could route EVERY URL in the app at this
  point. That may or may not make sense.

  For example, /newdevice could be handled here or in HomePage.
  Since it is a function available on HomePage via DevicesTable
  it might seem to make more sense if it were handled by
  HomePage. And, that's how we've handled it here.
*/
function Main() {
  return (
    <div>
      <Routes>
        <Route path="*" exact element={<HomePage />} />
        <Route path="/editdevice" element={<HomePage />} />
        <Route path="/newdevice" element={<HomePage />} />
        <Route path="/programs" exact element={<ProgramsTable />} />
        <Route path="/availableprograms/device/:id" element={<AvailableProgramsTable />} />
        <Route path="/about/" element={<About />} />
        <Route path="/deviceprograms/:id" element={<DeviceProgramsTable />} />
        <Route path="/editprogram/:id" element={<DeviceProgram />} />
        <Route path="/device/newprogram" element={<NewProgram />} />
        <Route path="/groupdevices/:id" element={<ActionGroupDevices />} />
        <Route path="/groups" exact element={<ActionGroups />} />
        <Route path="/editactiongroup/:groupid" element={<EditActionGroupForm />} />
        <Route path="/newactiongroup" exact element={<NewActionGroupForm />} />
        <Route path="/availabledevices/group/:id" element={<AvailableGroupDevices />} />
        <Route path="/availableprograms/group/:groupid" element={<AvailableGroupProgramsTable />} />
      </Routes>
      <footer className="page-footer font-small blue">
        <div className="container-fluid text-end">
          <p className="mb-0"><small>At Home Control <VersionComponent/></small></p>
          <p><small>Copyright &copy; 2014, 2024 by Dave Hocker</small></p>
        </div>
      </footer>
    </div>
  );
};

export default Main;
