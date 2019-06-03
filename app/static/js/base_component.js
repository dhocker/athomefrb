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
import $ from 'jquery';

/*
  The BaseComponent contains methods and functions that are
  usefull to derived classes. For example:

  timed message line - after 10 seconds the message is taken down
  save (PUT) device
  create (POST) device
*/
export class BaseComponent extends React.Component {
    constructor(props) {
        super(props);

        this.messageTimer = null

        // Initial state with empty rows
        this.state = {
            messageText: "",
        };

        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.generateMessage = this.generateMessage.bind(this);
        this.messageTimerHandler = this.messageTimerHandler.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.generateMessage = this.generateMessage.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.saveDevice = this.saveDevice.bind(this);
        this.createDevice = this.createDevice.bind(this);
        this.removeDevice = this.removeDevice.bind(this);
        this.saveProgram = this.saveProgram.bind(this);
    }

    componentWillUnmount() {
      // Cancel timer
      if (this.messageTimer) {
        clearInterval(this.messageTimer);
        this.messageTimer = null;
      }
    }

    generateMessage() {
      // Conditionally generates the message element
      let msg = "";
      if (this.state.messageText) {
        msg = <p className="alert alert-info" role="alert">{this.state.messageText}</p>;
      }
      return msg;
    }

    showMessage(text) {
      // Dispatch with an existing message
      this.messageTimerHandler();

      this.setState({messageText: text});

      // This will clear the message after 10 sec
      this.messageTimer = setInterval(this.messageTimerHandler, 10 * 1000);
    }

    messageTimerHandler() {
      // Conditionally clear the message timer
      if (this.messageTimer) {
        clearInterval(this.messageTimer);
        this.messageTimer = null;
      }
      this.setState({messageText: ""});
    }

    saveDevice(device) {
      const url = `/devices/${device.id}`;
      const $this = this;

      $.ajax({
        method: "PUT",
        url: url,
        data: device,
        dataType: "json",
        success: function(data, status, xhr) {
          $this.showMessage(data.message);
        },
        error: function(xhr, status, msg) {
          const response = JSON.parse(xhr.responseText);
          $this.showMessage(`Save failed: ${status} ${msg} ${response}`);
        }
      });
    }

    createDevice(device) {
      const url = `/devices`;
      const $this = this;

      $.ajax({
        method: "POST",
        url: url,
        data: device,
        dataType: "json",
        success: function(data, status, xhr) {
          const msg = `${data.message}: Device ID ${data['device-id']} created`
          $this.showMessage(msg);
        },
        error: function(xhr, status, msg) {
          const response = JSON.parse(xhr.responseText);
          $this.showMessage(`Create failed: ${status} ${msg} ${response}`);
        }
      });
    }

    removeDevice(device) {
      const url = `/devices/${device.id}`;
      const $this = this;

      $.ajax({
        method: "PUT",
        url: url,
        data: device,
        dataType: "json",
        success: function(data, status, xhr) {
          $this.showMessage(data.message);
        },
        error: function(xhr, status, msg) {
          const response = JSON.parse(xhr.responseText);
          $this.showMessage(`Save failed: ${status} ${msg} ${response}`);
        }
      });
    }

    saveProgram(html_method, url, program) {
      const $this = this;

      $.ajax({
        method: html_method,
        url: url,
        data: program,
        dataType: "json",
        success: function(data, status, xhr) {
          var msg;
          if (html_method === "PUT") {
            msg = `${data.message}: Program ID ${program.id} updated`;
          }
          else {
            msg = `${data.message}: Program ${data.id} created`;
          }
          $this.showMessage(msg);
        },
        error: function(xhr, status, msg) {
          const response = JSON.parse(xhr.responseText);
          $this.showMessage(`Save failed: ${status} ${msg} ${response}`);
        }
      });
    }
}

BaseComponent.propTypes = {
};

BaseComponent.defaultProps = {
};
