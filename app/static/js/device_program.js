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
import { Form, Button, Dropdown, DropdownButton, Col, Row, ButtonToolbar, Card } from "react-bootstrap";
import $ from 'jquery';
import { BaseComponent } from './base_component';
// Reference: https://github.com/wojtekmaj/react-time-picker
import TimePicker from 'react-time-picker';
// Reference: https://github.com/udivankin/sunrise-sunset
import { getSunrise, getSunset } from 'sunrise-sunset-js';

export class DeviceProgram extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
          ...this.state,
          ...{
            program: {
              id: "",
              name: "",
              deviceid: "",
              daymask: ".......",
              triggermethod: "none",
              offset: 0,
              randomize: 0,
              randomizeamount: 0,
              dimamount: 0,
              command: "none",
              args: "",
            },
            days: [0,0,0,0,0,0,0],
            clocktime: "00:00:00",
            effectivetime: "00:00:00",
            modalShow: false,
            modalTitle: "",
            modalSubtitle: "",
            modalText: "",
          }
        };

        this.sunrise = Date.now();
        this.sunset = Date.now();

        this.getSunriseSunset = this.getSunriseSunset.bind(this);
        this.calculate_effective_time = this.calculate_effective_time.bind(this);
        this.onControlChange = this.onControlChange.bind(this);
        this.marshalProgram = this.marshalProgram.bind(this);
        this.onSave = this.onSave.bind(this);
        this.generateTitle = this.generateTitle.bind(this);
        this.daysToDaymask = this.daysToDaymask.bind(this);
        this.onActionChanged = this.onActionChanged.bind(this);
        this.onCheckWeekdays = this.onCheckWeekdays.bind(this);
        this.onCheckWeekend = this.onCheckWeekend.bind(this);
        this.onTriggerMethodClick = this.onTriggerMethodClick.bind(this);
        this.clockTimeControl = this.clockTimeControl.bind(this);
        this.onRandomizeChanged = this.onRandomizeChanged.bind(this);
        this.onClockChange = this.onClockChange.bind(this);
        this.loadForm = this.loadForm.bind(this);
        this.modalClose = this.modalClose.bind(this);
        this.onGoBack = this.onGoBack.bind(this);
    }

    // This will load the table when the component is mounted
    componentDidMount() {
        this.getSunriseSunset();
        this.loadForm(this.props.match.params.id);
    }

    // This can be called to initially load or refresh the form
    // after inserts, updates or deletes
    loadForm(programid) {
        const $this = this;
        const url = `/programs/${programid}`;
        $.get(url, function (response /* , status */) {
            // We only want the time portion. This will ignore any date.
            const ct = response.data.time.substring(response.data.time.length - 8);
            $this.setState({
              program: response.data,
              days: $this.daymaskToDays(response.data.daymask),
              clocktime: ct,
            });
            $this.calculate_effective_time(parseInt(response.data.offset));
        });
    }

    // Get sunrise/sunset for the configured location
    getSunriseSunset() {
        const $this = this;
        const url = '/location';
        $.get(url, function (response /* , status */) {
          const latitude = parseFloat(response.latitude);
          const longitude = parseFloat(response.longitude);
          $this.sunrise = getSunrise(latitude, longitude);
          $this.sunset = getSunset(latitude, longitude);
          // Calc effective time
          $this.calculate_effective_time($this.state.program.offset);
        });
    }

    calculate_effective_time(offset) {
        // This is an on-demand calculation because it is extremely
        // difficult to control the React state offset variable.
        if (this.state.program.triggermethod === "sunset") {
            const sunset_offset = new Date(this.sunset.getTime() + offset * 60 * 1000);
            this.setState({
              effectivetime: sunset_offset.toLocaleTimeString()
            });
        }
        else if (this.state.program.triggermethod === "sunrise") {
            const sunrise_offset = new Date(this.sunrise.getTime() + offset * 60 * 1000);
            this.setState({
              effectivetime: sunrise_offset.toLocaleTimeString()
            });
        }
        else {
            // Clock time is a string hh:mm:ss
            const ctd = this.convert_time(this.state.clocktime);
            ctd.setMinutes(ctd.getMinutes() + offset);
            this.setState({
              effectivetime: ctd.toLocaleTimeString()
            });
         }
    }

    // Convert a time string hh:mm:ss to a Date instance
    convert_time(timetext) {
        var pat = /(\d{1,2}):(\d{1,2}):(\d{1,2})/i;
        var m = pat.exec(timetext);
        var hr = parseInt(m[1]);
        var min = parseInt(m[2]);
        var sec = parseInt(m[3]);
        const dt = new Date();
        dt.setHours(hr);
        dt.setMinutes(min);
        dt.setSeconds(sec);
        return dt;
    };

    daymaskToDays(mask) {
      let days = []
      for (let d = 0; d < mask.length; d++) {
        days[days.length] = mask.substring(d, d + 1) !== ".";
      }
      return days;
    }

    daysToDaymask() {
      let daymask = "";
      const daysofweek = ["M", "T", "W", "T", "F", "S", "S"];

      for (let d = 0; d < this.state.days.length; d++) {
        daymask = daymask + (this.state.days[d] ? daysofweek[d] : ".");
      }
      return daymask;
    }

    generateTitle() {
      return <h2>Edit Device ID {this.state.program.deviceid} Program ID {this.state.program.id}</h2>
    }

    clockTimeControl() {
      // The clock time control only shows when that is the trigger method
      if (this.state.program.triggermethod === "clock-time") {
        return (
          <>
            <Form.Group controlId="formClockTime">
              <Form.Label>Clock Time</Form.Label>
              <div>
              <TimePicker
                value={this.state.clocktime}
                maxDetail="second"
                format="hh:mm a"
                onChange={this.onClockChange}
                disableClock={true}
              />
              </div>
            </Form.Group>
          </>
        );
      }
      return "";
    }

    randomizeAmountControl() {
      // Show the control if randomize is checked
      if (this.state.program.randomize) {
        return (
          <>
            <Form.Group controlId="formGroupRandomizeAmount">
              <Form.Label>Randomize Amount</Form.Label>
              <Form.Control
                name="randomizeamount"
                placeholder="Amount"
                value={this.state.program.randomizeamount}
                onChange={this.onControlChange}
              />
            </Form.Group>
          </>
        );
      }
      return "";
    }

    marshalProgram() {
      // Marshal everything back to a program
      let program = this.state.program;
      // Date format ISO
      // This is only the time portion of an ISO datetime
      program.time = this.state.clocktime;
      // Daymask MTWTFSS
      program.daymask = this.daysToDaymask();
    }

    onGoBack() {
        this.props.history.goBack();
    }

    onSave() {
      // Marshal everything back to a program
      this.marshalProgram();
      // PUT program back to server
      const url = `/programs/${this.state.program.id}`;
      this.saveProgram("PUT", url, this.state.program)
    }

    onControlChange(event) {
      let fieldName = event.target.name;
      let fieldVal = event.target.value;
      switch (fieldName) {
        case "offset":
          if (fieldVal !== "-" && fieldVal !== "") {
            fieldVal = parseInt(fieldVal);
            this.calculate_effective_time(fieldVal);
          }
          break;
        case "randomizeamount":
          if (fieldVal !== "-" && fieldVal !== "") {
            fieldVal = parseInt(fieldVal);
          }
          break;
        default:
          break;
      }
      this.setState({program: {...this.state.program, [fieldName]: fieldVal}});
    }

    onActionChanged(event) {
      let command = event.target.name;
      this.setState({program: {...this.state.program, "command": command}},
        function() {
          // After the state is changed...
          this.calculate_effective_time(this.state.program.offset);
        }
      );
    }

    onDayCheckChanged(day_index, event) {
      const fieldVal = event.target.checked;

      let days = this.state.days;
      days[day_index] = fieldVal;
      this.setState({days: days});
    }

    onCheckWeekdays(event) {
      let days = this.state.days;
      for (let d = 0; d < 5; d++) {
        days[d] = !days[d];
      }
      this.setState({days: days});
    }

    onCheckWeekend(event) {
      let days = this.state.days;
      for (let d = 5; d < 7; d++) {
        days[d] = !days[d];
      }
      this.setState({days: days});
    }

    onTriggerMethodClick(event) {
      let triggerMethod = event.target.name;
      this.setState({program: {...this.state.program, "triggermethod": triggerMethod}},
        function() {
          // After the state is changed...
          this.calculate_effective_time(this.state.program.offset);
        }
      );
    }

    onRandomizeChanged(event) {
      const fieldVal = event.target.checked;
      this.setState({program: {...this.state.program, "randomize": fieldVal}});
    }

    onClockChange(value) {
      const newValue = value;
      // There are times when the new clock value is null
      if (newValue) {
        this.setState({clocktime: newValue},
          function(){
            // After the state is updated...
            this.calculate_effective_time(this.state.program.offset);
          }
        );
      }
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

    render() {
        return (
            <>
              {this.generateTitle()}
              {this.generateMessage()}
              <Form>
                <Form.Group controlId="formGroupDeviceName">
                  <Form.Label>Program Name</Form.Label>
                  <Form.Control
                    style={{ width: '30rem' }}
                    as="input"
                    type="text"
                    name="name"
                    placeholder="Name"
                    defaultValue={this.state.program.name}
                    onChange={this.onControlChange}
                  />
                </Form.Group>
                <Form.Group controlId="formGroupAction">
                  <Form.Label>Action</Form.Label>
                  <DropdownButton id="action" size="sm" title={this.state.program.command}>
                    <Dropdown.Item name="none" onClick={this.onActionChanged}>none</Dropdown.Item>
                    <Dropdown.Item name="on" onClick={this.onActionChanged}>on</Dropdown.Item>
                    <Dropdown.Item name="off" onClick={this.onActionChanged}>off</Dropdown.Item>
                  </DropdownButton>
                </Form.Group>

                <Row>
                  <Col md="auto">
                      <Card>
                        <Card.Header>
                          Days of Week
                        </Card.Header>

                        <Card.Body>
                          <div className="checkbox">
                            <label>
                              <input name="Monday" type="checkbox"
                                checked={!!this.state.days[0]}
                                onChange={this.onDayCheckChanged.bind(this, 0)}/>
                                Monday
                            </label>
                          </div>
                          <div className="checkbox">
                            <label>
                              <input name="Tuesday" type="checkbox"
                                checked={!!this.state.days[1]}
                                onChange={this.onDayCheckChanged.bind(this, 1)}/>
                                Tuesday
                            </label>
                          </div>
                          <div className="checkbox">
                            <label>
                              <input name="Wednesday" type="checkbox"
                                checked={!!this.state.days[2]}
                                onChange={this.onDayCheckChanged.bind(this, 2)}/>
                                Wednesday
                            </label>
                          </div>
                          <div className="checkbox">
                            <label>
                              <input name="Thursday" type="checkbox"
                                checked={!!this.state.days[3]}
                                onChange={this.onDayCheckChanged.bind(this, 3)}/>
                                Thursday
                            </label>
                          </div>
                          <div className="checkbox">
                            <label>
                              <input name="Friday" type="checkbox"
                                checked={!!this.state.days[4]}
                                onChange={this.onDayCheckChanged.bind(this, 4)}/>
                                Friday
                            </label>
                          </div>
                          <div className="checkbox">
                            <label>
                              <input name="Saturday" type="checkbox"
                                checked={!!this.state.days[5]}
                                onChange={this.onDayCheckChanged.bind(this, 5)}/>
                                Saturday
                            </label>
                          </div>
                          <div className="checkbox">
                            <label>
                              <input name="Sunday" type="checkbox"
                                checked={!!this.state.days[6]}
                                onChange={this.onDayCheckChanged.bind(this, 6)}/>
                                Sunday
                            </label>
                          </div>
                        </Card.Body>

                        <Card.Footer>
                          <Button
                            className="btn-extra btn-sm"
                            variant="primary"
                            onClick={this.onCheckWeekdays}
                          >
                            Weekdays
                          </Button>
                          <Button
                            className="btn-extra btn-sm"
                            variant="primary"
                            onClick={this.onCheckWeekend}
                          >
                            Weekend
                          </Button>
                        </Card.Footer>
                      </Card>
                  </Col>

                  <Col md="auto">
                    <Card>
                      <Card.Header>
                        Trigger
                      </Card.Header>
                      <Card.Body>
                        <Form.Group controlId="formGroupMethod">
                          <Form.Label>Method</Form.Label>
                          <DropdownButton id="trigger-method" size="sm" title={this.state.program.triggermethod}>
                            <Dropdown.Item name="none" onClick={this.onTriggerMethodClick}>none</Dropdown.Item>
                            <Dropdown.Item name="clock-time" onClick={this.onTriggerMethodClick}>clock-time</Dropdown.Item>
                            <Dropdown.Item name="sunrise" onClick={this.onTriggerMethodClick}>sunrise</Dropdown.Item>
                            <Dropdown.Item name="sunset" onClick={this.onTriggerMethodClick}>sunset</Dropdown.Item>
                          </DropdownButton>
                        </Form.Group>

                        {this.clockTimeControl()}

                        <Form.Group controlId="formGroupOffset">
                          <Form.Label>Offset</Form.Label>
                          <Form.Control
                            as="input"
                            type="text"
                            name="offset"
                            placeholder="Offset"
                            value={String(this.state.program.offset)}
                            onChange={this.onControlChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="formGroupRandomize">
                          <div className="checkbox">
                            <label>
                              <input name="Randomize" type="checkbox"
                                checked={!!this.state.program.randomize}
                                onChange={this.onRandomizeChanged}/>
                                Randomize
                            </label>
                          </div>
                        </Form.Group>

                        {this.randomizeAmountControl()}

                        <Form.Group controlId="formGroupEffectiveTime">
                          <Form.Label>Effective Time</Form.Label>
                          <p>{this.state.effectivetime}</p>
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <ButtonToolbar>
                      <Button className="btn-extra-vert btn-sm btn-extra btn-extra-vert" onClick={this.onSave}>
                        Save
                      </Button>
                      <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert" type="button" onClick={this.onGoBack}>
                        Cancel
                      </Button>
                    </ButtonToolbar>
                  </Col>
                </Row>
              </Form>
              {this.renderDialogBox()}
            </>
        );
    }
}
