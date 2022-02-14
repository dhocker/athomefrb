/*
    Action Anchor component
    Copyright © 2021  Dave Hocker (email: AtHomeX10@gmail.com)

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

/*
    Use this component to add a "Discover Devices" button.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {Button} from "react-bootstrap-v5";
import $ from "jquery";

export class DiscoverDevicesButton extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    // Button was clicked
    onClick() {
        const $this = this;

        if (this.props.onClick !== null) {
            this.props.onClick();
        }

        // Start the discovery process
        let url = `/discoverdevices`;
        $.ajax({
            url: url,
            success: function (response /* , status */) {
                const {onSuccess} = $this.props;
                if (onSuccess !== null) {
                    onSuccess(response);
                }
            },
            error: function (jqxhr, status, msg) {
                const response = JSON.parse(jqxhr.responseText);
                if ($this.props.onError !== null) {
                    $this.props.onError(response);
                }
            }
        });
    }

    render() {
        return (
            <Button className={this.props.className} onClick={this.onClick}>
                {this.props.label}
            </Button>
        );
    }
}

DiscoverDevicesButton.propTypes = {
    onClick: PropTypes.func,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
    className: PropTypes.string,
    label: PropTypes.string,
};

DiscoverDevicesButton.defaultProps = {
    onClick: null,
    onSuccess: null,
    onError: null,
    className: "btn btn-warning btn-sm btn-extra btn-extra-vert float-end",
    label: "Discover Devices",
};