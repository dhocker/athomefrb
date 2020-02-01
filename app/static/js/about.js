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

export class About extends React.Component {
  render() {
    return (
      <div className="card my-5">
        <div className="card-body">
          <h5 className="card-title">About AtHome Control</h5>
          <p className="card-text">
            This is the newest iteration of AtHome Control (AtHomeFRB) developed using
            Python 3, Flask, React, Booststrap and Webpack. Essentially, AtHome Control is
            a web app front end (a client) for the AtHomePowerlineServer.
          </p>
          <p className="card-text">
            AtHomePowerlineServer supports three different types of device modules:
            <a
              className="card-link-x"
              href="https://www.smarthome.com/sc-what-is-x10-home-automation"
            >
              &nbsp;X10&nbsp;
            </a>
            ,&nbsp;
            <a
              className="card-link-x"
              href="https://www.tp-link.com/us/kasa-smart/kasa.html"
            >
              TPLink/Kasa
            </a>
            &nbsp;and&nbsp;
            <a
              className="card-link-x"
              href="https://www.meross.com/"
            >
              Meross
            </a>
            .&nbsp;
            X10 devices require an X10 power line controller to
            drive them, while TPLink/Kasa and Meross devices are WiFi based and do not require
            any controller. If you are just starting with home control, the TPLink/Kasa or Meross
            devices are probably the best choice. X10 is quite old and device
            modules get harder to find and more expensive as time passes.
          </p>
          <p className="card-text">
            Find out more about AtHome Control at
            <a
              className="card-link"
              href="https://github.com/dhocker/athomefrb"
            >
              &nbsp;https://github.com/dhocker/athomefrb
            </a>.
          </p>
          <p className="card-text">
            Find out more about AtHomePowerlineServer at
            <a
              className="card-link"
              href="https://github.com/dhocker/athomepowerlineserver"
            >
              &nbsp;https://github.com/dhocker/athomepowerlineserver
            </a>.
          </p>
        </div>
      </div>
    )
  }
}
