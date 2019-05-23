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
import { Form, Button, Dropdown, DropdownButton } from "react-bootstrap";
import $ from 'jquery';
import { BaseComponent } from './base_component';


export class EditDeviceForm extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
          device: {
            type: "x10"
          }
        };

        this.onControlChange = this.onControlChange.bind(this);
        this.onDeviceTypeClick = this.onDeviceTypeClick.bind(this);
        this.onSave = this.onSave.bind(this);
        this.generateTitle = this.generateTitle.bind(this);
    }

    // This will load the table when the component is mounted
    componentDidMount() {
        this.loadForm(this.props.match.params.deviceid);
    }

    // This can be called to initially load or refresh the form
    // after inserts, updates or deletes
    loadForm(deviceid) {
        const $this = this;
        const url = `/devices/${deviceid}`;
        $.get(url, function (response /* , status */) {
            $this.setState({device: response.data});
        });
    }

    onControlChange(event) {
      let fieldName = event.target.name;
      let fieldVal = event.target.value;
      switch (fieldName) {
        case "selected":
          fieldVal = event.target.checked;
          break;
        default:
          break;
      }
      this.setState({device: {...this.state.device, [fieldName]: fieldVal}});
    }

    onDeviceTypeClick(event) {
      let deviceType = event.target.name;
      this.setState({device: {...this.state.device, "type": deviceType}});
    }

    onSave() {
      const validate_msg = this.validate(this.state.device);
      if (validate_msg) {
        this.showMessage(validate_msg);
      }
      else {
        this.saveDevice(this.state.device);
      }
    }

    generateTitle() {
      return <h2>Edit Device ID {this.state.device.id}</h2>
    }

    validate(device) {
      const addr = device.address.toLowerCase();
      switch (device.type) {
        case "x10":
          // An X10 address is A1...A16 through L1...L16 (A-L with 1-16)
          if (addr.length < 2) {
            return "Invalid address: must be 2 or 3 characters";
          }
          if (addr.substring(0, 1) < 'a' || addr.substring(0, 1) > 'l') {
            return "Invalid address: First character must be a-l";
          }
          if (addr.substring(1, 2) < '1') {
            return "Invalid address: Must be (A-L)(1-16)";
          }
          const dc = parseInt(addr.substring(1), 10);
          if (isNaN(dc) || dc < 0 || dc > 16) {
            return "Invalid address: Must be (A-L)(1-16)"
          }
          break;
        case "tplink":
          // Address must be an IP address
          if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(addr)) {
            return "Invalid IP address";
          }
          break;
        default:
          break;
      }
      return null
    }

    render() {
      return (
        <>
          {this.generateTitle()}
          {this.generateMessage()}
          <Form>
            <Form.Group controlId="formGroupDeviceName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                as="input"
                type="text"
                name="name"
                placeholder="Name"
                defaultValue={this.state.device.name}
                onChange={this.onControlChange}
              />
            </Form.Group>
            <Form.Group controlId="formGroupDeviceLocation">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                defaultValue={this.state.device.location}
                onChange={this.onControlChange}
              />
            </Form.Group>
            <Form.Group controlId="formGroupDeviceType">
              <Form.Label>Type</Form.Label>
              <DropdownButton id="device-type" title={this.state.device.type}>
                <Dropdown.Item name="x10" onClick={this.onDeviceTypeClick}>x10</Dropdown.Item>
                <Dropdown.Item name="tplink" onClick={this.onDeviceTypeClick}>tplink</Dropdown.Item>
              </DropdownButton>
            </Form.Group>
            <Form.Group controlId="formGroupDeviceAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                defaultValue={this.state.device.address}
                onChange={this.onControlChange}
                placeholder="X10 house-device-code or IP address"
              />
            </Form.Group>
            <Form.Group controlId="formGroupDeviceSelected">
              <Form.Label>Selected</Form.Label>
              <Form.Check
                name="selected"
                checked={!!this.state.device.selected}
                onChange={this.onControlChange}
              />
            </Form.Group>

            <Button variant="primary" type="button" onClick={this.onSave}>
              Save
            </Button>
          </Form>
        </>
      );
    };
}
