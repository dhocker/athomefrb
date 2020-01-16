/*
    AtHome Control
    Copyright © 2019  Dave Hocker (email: AtHomeX10@gmail.com)

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
import {  Route, Switch } from "react-router-dom";
import { HomePage } from './home_page';
import { DeviceProgramsTable } from './device_programs';
import { DeviceProgram } from './device_program';
import { NewProgram } from './new_program';
import { ProgramsTable} from './programs_table';
import { AvailableProgramsTable } from "./available_programs";
import { ActionGroups } from "./action_groups";
import { ActionGroupDevices } from "./action_group_devices";
import About from './about';
import { VersionComponent } from './version_component';

export function NotImplemented() {
  return (
    <h2>Not Implemented</h2>
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
      <Switch>
        <Route path="/" exact component={HomePage} />
        <Route path="/editdevice" component={HomePage} />
        <Route path="/newdevice" component={HomePage} />
        <Route path="/programs" exact component={ProgramsTable} />
        <Route path="/availableprograms/device/:id" component={AvailableProgramsTable} />
        <Route path="/about/" component={About} />
        <Route path="/deviceprograms/:id" component={DeviceProgramsTable} />
        <Route path="/editprogram/:id" component={DeviceProgram} />
        <Route path="/device/:id/newprogram" component={NewProgram} />
        <Route path="/groupdevices/:id" component={ActionGroupDevices} />
        <Route path="/groups" exact component={ActionGroups} />
      </Switch>
      <footer className="page-footer font-small blue">
        <div className="container-fluid text-right">
          <p className="mb-0"><small>At Home Control <VersionComponent/></small></p>
          <p><small>Copyright &copy; 2014, 2020 by Dave Hocker</small></p>
        </div>
      </footer>
    </div>
  );
};

export default Main;
