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
import {Form, Button, Dropdown, DropdownButton, Row, Col, Card} from "react-bootstrap";
import $ from 'jquery';
import { BaseComponent } from './base_component';
import {ChromePicker} from "react-color";


export class EditDeviceForm extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
          ...this.state,
          ...{
            device: {
              mfg: "x10",
              type: "plug",
              address: "",
              channel: 0,
              color: "#FFFFFF",
              brightness: 100,
            },
            tplink_list: [],
            meross_list: [],
            modalShow: false,
            modalTitle: "",
            modalSubtitle: "",
            modalText: "",
          }
        };

        this.active_device_list = [];

        this.onControlChange = this.onControlChange.bind(this);
        this.onDeviceMfgClick = this.onDeviceMfgClick.bind(this);
        this.onGoBack = this.onGoBack.bind(this);
        this.onSave = this.onSave.bind(this);
        this.modalClose = this.modalClose.bind(this);
        this.generateTitle = this.generateTitle.bind(this);
        this.generateAddressControl = this.generateAddressControl.bind(this);
        this.onDeviceAddressSelect = this.onDeviceAddressSelect.bind(this);
        this.generateChannelControl = this.generateChannelControl.bind(this);
        this.generateColorAndBrightness = this.generateColorAndBrightness.bind(this);
        this.onColorChanged = this.onColorChanged.bind(this);
        this.onChannelSelect = this.onChannelSelect.bind(this);
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
        $.ajax({
          url: url,
          success: function (response /* , status */) {
              $this.setState({device: response.data});
          },
          error: function(jqxhr, status, msg) {
            const response = JSON.parse(jqxhr.responseText);
            $this.showMessage(`${status}, ${msg}, ${response.message}`);
          }
        });

        // TODO Load list of available TPLink devices (or more generally WiFi devices)
        $this.loadDeviceLists();
    }

    loadDeviceLists() {
        // Load list of available TPLink devices
        const $this = this;
        let url = `/availabledevices/tplink`;
        $.ajax({
          url: url,
          success: function (response /* , status */) {
              $this.setState({tplink_list: response.data});
          },
          error: function(jqxhr, status, msg) {
            const response = JSON.parse(jqxhr.responseText);
            $this.showMessage(`${status}, ${msg}, ${response.message}`);
          }
        });

        // Load list of available Meross devices
        url = `/availabledevices/meross`;
        $.ajax({
          url: url,
          success: function (response /* , status */) {
              $this.setState({meross_list: response.data});
          },
          error: function(jqxhr, status, msg) {
            const response = JSON.parse(jqxhr.responseText);
            $this.showMessage(`${status}, ${msg}, ${response.message}`);
          }
        });
    }

    onControlChange(event) {
      let fieldName = event.target.name;
      let fieldVal = event.target.value;
      switch (fieldName) {
        default:
          break;
      }
      this.setState({device: {...this.state.device, [fieldName]: fieldVal}});
    }

    onDeviceMfgClick(event) {
      let deviceMfg = event.target.name;
      // If device manufacturer has changed, reset the address
      if (deviceMfg !== this.state.device.mfg) {
        this.setState({device: {...this.state.device, "mfg": deviceMfg, "address": ""}});
      }
      else {
        this.setState({device: {...this.state.device, "mfg": deviceMfg}});
      }

      // Note that mfg is manufacturer (X10, TPLink, Meross)
      // and type is Plug or Bulb
      // Choose the active device list based on the mfg type
      switch (deviceMfg) {
        case "x10":
          this.active_device_list = [];
          break;
        case "tplink":
          this.active_device_list = this.state.tplink_list;
          break;
        case "meross":
          this.active_device_list = this.state.meross_list;
          break;
        default:
          break;
      }
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

    onGoBack() {
        this.props.history.goBack();
    }

    modalClose() {
      // When the saved confirmation is dismissed, go back to the previous URI
      if (!this.save_error) {
        this.props.history.goBack();
      }
      else {
        this.setState({ modalShow: false });
      }
    }

    generateTitle() {
      return <h2>Edit Device ID {this.state.device.id}</h2>
    }

    generateAddressControl() {
      // Note that mfg is manufacturer (X10, TPLink, Meross)
      // and type is Plug or Bulb
      switch (this.state.device.mfg) {
        case "x10":
          return this.generateX10AddressControl();
        case "tplink":
          return this.generateDeviceAddressControl(this.state.tplink_list);
        case "meross":
          return this.generateDeviceAddressControl(this.state.meross_list);
        default:
      }

      return "";
    }

    generateX10AddressControl() {
      return (
        <Form.Group controlId="formGroupDeviceAddress">
          <Form.Label>House Device Code (A1-G16)</Form.Label>
          <Form.Control
            type="text"
            name="address"
            defaultValue={this.state.device.address}
            onChange={this.onControlChange}
            placeholder="X10 module house-device-code"
          />
        </Form.Group>
      );
    }

    generateDeviceAddressControl(device_list) {
      const $this = this;

      // Build an array of drop down items (available devices)
      let available_devices = [];
      for (var address in device_list) {
        const di = <Dropdown.Item
          eventKey={address}
          key={address}
          name={device_list[address]}
          onSelect={this.onDeviceAddressSelect}
          >
          {device_list[address].mfg} &lt;{device_list[address].label} {device_list[address].model} ({address})&gt;
        </Dropdown.Item>;

        available_devices.push(di);
      };

      // Manufacture a title for the drop down control
      let address_title = ""
      if ($this.state.device.address) {
        if ($this.state.device.address in device_list) {
          address_title = device_list[$this.state.device.address].type + " <" +
            device_list[$this.state.device.address].label + " " +
            device_list[$this.state.device.address].model +
            " (" + $this.state.device.address + ")>";
        }
        else {
          address_title = "Name Unknown (" + this.state.device.address + ")";
        }
      }

      return (
        <Form.Group controlId="formGroupDeviceAddress">
          <Form.Label>Device Address</Form.Label>
          <DropdownButton
            id="device-address"
            title={address_title}
          >
            {available_devices}
          </DropdownButton>
        </Form.Group>
      );
    }

    onDeviceAddressSelect(key, event) {
      let deviceAddress = key;
      // this.setState({device: {...this.state.device, "address": deviceAddress}});
      // Update new device address and type
      this.setState(
        {device: {
            ...this.state.device,
            "address": deviceAddress,
            "type": this.active_device_list[deviceAddress].type,
          }
        }
      );
      // this.setState({device: {...this.active_device_list[deviceAddress], "address": deviceAddress}});

    }

    generateChannelControl() {
      // A device must have been picked
      if (this.state.device.address === "") {
        return "";
      }

      // Pick the device list for the selected mfg
      switch (this.state.device.mfg) {
        case "x10":
          return "";
        default:
          break;
      }

      // Device list must be loaded
      if (Object.keys(this.active_device_list).length === 0) {
        return "";
      }

      // And, the selected device address must be multi-channel
      if (this.active_device_list[this.state.device.address].channels === 1) {
        return "";
      }

      let available_channels = [];
      for (var c = 0; c < this.active_device_list[this.state.device.address].channels; c++) {
        const di = <Dropdown.Item
          eventKey={c}
          key={c}
          name={"channel-" + c}
          onSelect={this.onChannelSelect}
          >
          {c}
        </Dropdown.Item>;

        available_channels.push(di);
      };

      return (
        <Form.Group controlId="formGroupChannel">
          <Form.Label>Channel</Form.Label>
          <DropdownButton
            id="device-channel"
            title={String(this.state.device.channel)}
          >
            {available_channels}
          </DropdownButton>
        </Form.Group>
      );
    }

    generateColorAndBrightness() {
      if (this.state.device.type.toLowerCase() !== "bulb") {
        return "";
      }

      return (
        <Col md="auto">
          <Card>
            <Card.Body>
              <Form.Group controlId="formGroupColorBrightness">
                <Form.Label>Color</Form.Label>
                <ChromePicker
                  color={this.state.device.color}
                  onChangeComplete={this.onColorChanged}
                />

                <Form.Label>Brightness</Form.Label>
                <Form.Control
                  as="input"
                  type="text"
                  name="brightness"
                  placeholder="Brightness"
                  value={this.state.device.brightness}
                  onChange={this.onControlChange}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      )
    }

    onChannelSelect(key, event) {
      let deviceChannel = key;
      this.setState({device: {...this.state.device, "channel": deviceChannel}});
    }

    onColorChanged(new_color) {
      this.setState({device:{...this.state.device, color: new_color.hex}})
    }

    validate(device) {
      if (!device.name) {
        return "Name is required";
      }
      if (!device.location) {
        return "Location is required";
      }
      const addr = device.address.toLowerCase();
      switch (device.mfg) {
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
          if (device.channel >= device.channels) {
            return "Channel is out of range"
          }
          break;
        case "meross":
          // The Meross UUID looks like a GUID without hyphens, but it fails a real GUID test
          // So we do an empirical check: 32 hex digits
          if (addr.length !== 32) {
            return "Wrong length UUID for Meross device";
          }
          if (!(/^[0-9a-f]{32}$/.test(addr))) {
            return "Invalid UUID for Meross device";
          }
          if (device.channel >= device.channels) {
            return "Channel is out of range"
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
            <Row>
              <Col md="auto">
                <Card>
                  <Card.Body>
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
                    <Form.Group controlId="formGroupDeviceMfg">
                      <Form.Label>Manufacturer</Form.Label>
                      <DropdownButton id="device-mfg" title={this.state.device.mfg}>
                        <Dropdown.Item name="x10" onClick={this.onDeviceMfgClick}>x10</Dropdown.Item>
                        <Dropdown.Item name="tplink" onClick={this.onDeviceMfgClick}>tplink</Dropdown.Item>
                        <Dropdown.Item name="meross" onClick={this.onDeviceMfgClick}>meross</Dropdown.Item>
                      </DropdownButton>
                    </Form.Group>

                    {this.generateAddressControl()}
                    {this.generateChannelControl()}
                  </Card.Body>
                </Card>
              </Col>

              {this.generateColorAndBrightness()}

            </Row>

            <Row>
              <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert" type="button" onClick={this.onSave}>
                Save
              </Button>
              <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert" type="button" onClick={this.onGoBack}>
                Cancel
              </Button>
            </Row>

          </Form>
          {this.renderDialogBox()}
        </>
      );
    };
}
