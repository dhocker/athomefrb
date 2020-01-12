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

import React from 'react';
import { DeviceProgram } from './device_program';

export class NewProgram extends DeviceProgram {
    constructor(props) {
        super(props);

        this.generateTitle = this.generateTitle.bind(this);
        this.onSave = this.onSave.bind(this);
    }

    // This will load the table when the component is mounted
    componentDidMount() {
      this.getSunriseSunset();
  }

    generateTitle() {
      return (
        <h2>New Program</h2>
      );
    }

    onSave() {
      // Marshal everything back to a program
      this.marshalProgram();
      // POST program back to server
      const url = "/programs";
      this.saveProgram("POST", url, this.state.program)
    }
}
