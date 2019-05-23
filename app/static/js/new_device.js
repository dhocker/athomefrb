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
import { EditDeviceForm } from "./edit_device";


export class NewDevice extends EditDeviceForm {
    constructor(props) {
        super(props);

        this.state = {
          device: {
            name: "",
            location: "",
            type: "x10",
            address: "",
            selected: false
          }
        };

        this.onSave = this.onSave.bind(this);
        this.generateTitle = this.generateTitle.bind(this);
    }

    // Override EditDevice class which loads the device
    componentDidMount() {
    }

    onSave() {
      // TODO Validity check the device definition
      const validate_msg = this.validate(this.state.device);
      if (validate_msg) {
        this.showMessage(validate_msg);
      }
      else {
        this.createDevice(this.state.device);
      }
    }

    generateTitle() {
      return <h2>New Device</h2>
    }
}
