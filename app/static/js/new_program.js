/*
    AtHome Control - Create a new device program
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
import { DeviceProgramClass } from './device_program';
import {Button, ButtonToolbar} from "react-bootstrap-v5";
import { useNavigate } from 'react-router-dom';

// Shell function to field id URL parameter
export function NewProgram() {
  const navigate = useNavigate();

  return (
    <NewProgramClass
      navigate={navigate}
    >
    </NewProgramClass>
  );
}

export class NewProgramClass extends DeviceProgramClass {
    constructor(props) {
        super(props);

        this.generateTitle = this.generateTitle.bind(this);
        this.onSave = this.onSave.bind(this);
        this.buttons = this.buttons.bind(this);
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

    buttons() {
      return (
        <ButtonToolbar>
          <Button className="btn-extra-vert btn-sm btn-extra btn-extra-vert" onClick={this.onSave}>
            Save
          </Button>
          <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert" type="button" onClick={this.onGoBack}>
            Cancel
          </Button>
        </ButtonToolbar>
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
