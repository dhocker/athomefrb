/*
    AtHome Control
    Copyright © 2019, 2020  Dave Hocker (email: AtHomeX10@gmail.com)

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
import $ from "jquery";


export class NewDevice extends EditDeviceForm {
    constructor(props) {
        super(props);

        this.state = {
          ...this.state,
          ...{
            device: {
              name: "",
              location: "",
              mfg: "x10",
              type: "plug",
              address: "",
              channel: 0,
              color: "#FFFFFF",
              brightness: 100,
            },
            modalShow: false,
            modalTitle: "",
            modalSubtitle: "",
            modalText: "",
          }
        };

        this.onSave = this.onSave.bind(this);
        this.setDeviceState = this.setDeviceState.bind(this);
        this.generateTitle = this.generateTitle.bind(this);
    }

    // Override EditDevice class which loads the device
    componentDidMount() {
      this.loadDeviceLists();
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

    // change device state
    setDeviceState(new_state) {
      const $this = this;
      const url = `/newdevice/state`;
      const formData = {
        'state': new_state,
        'mfg': this.state.device.mfg,
        'address': this.state.device.address,
        'channel': this.state.device.channel,
        'name': this.state.device.name,
        'color': this.state.device.color,
        'brightness': this.state.device.brightness
      };

      $.ajax({
        method: "PUT",
        url: url,
        data: formData,
        dataType: "json",
        success: function(data, status, xhr) {
          // $this.showMessage(`Device ${rows[row_index]["name"]} turned ${new_state}`);
        },
        error: function(xhr, status, msg) {
          const response = JSON.parse(xhr.responseText);
          $this.showDialogBox(`Device ${this.state.device.name} ${new_state}`, msg, response.message)
        }
      });
    }

    generateTitle() {
      return <h2>New Device</h2>
    }
}
