/*
    App version React component
    Copyright © 2020, 2024  Dave Hocker (email: AtHomeX10@gmail.com)

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
import $ from 'jquery';


export class VersionComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {version: "2020.99.99.99"};
    }
    // This will load the version when the component is mounted
    componentDidMount() {
        this.loadVersion();
    }

    // This can be called to initially load the version
    loadVersion() {
        const $this = this;
        $.ajax({
          url: "/version",
          method: "GET",
          success: function (response /* , status */) {
            $this.setState({version: response.version});
          },
          error: function(jqxhr, status, msg) {
          }
        });
    }

    render() {
      return (
        <span>
          <b>
            {this.state.version}
          </b>
        </span>
      );
    }
}

VersionComponent.propTypes = {
};

VersionComponent.defaultProps = {
};
