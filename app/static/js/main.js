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
import About from './about';

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
        <Route path="/about/" component={About} />
        <Route path="/deviceprograms/:id" component={DeviceProgramsTable} />
      </Switch>
      <footer className="page-footer font-small blue pt-4">
        <div className="container-fluid text-right">
          <p>Copyright &copy; 2019 by Dave Hocker</p>
        </div>
      </footer>
    </div>
  );
};

export default Main;
