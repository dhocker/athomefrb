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
import Header from './header';
import Main from './main';

/*
Bootstrap
See: https://getbootstrap.com/docs/4.0/getting-started/webpack/
*/
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
/*
Bootstrap css customizations MUST come after Bootstrap css
*/
import '../css/bootstrap-custom.css';

/*
  The main menu using react-router-bootstrap
*/
function AppRouter() {
  return (
    <div>
      <Header />
      <Main />
    </div>
  );
}

export default AppRouter;
