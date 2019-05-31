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
import { Nav, Navbar, NavItem, NavbarBrand } from "react-bootstrap";
import { LinkContainer, IndexLinkContainer } from "react-router-bootstrap";

function Header() {
  return (
    <header>
      <Navbar className="navbar navbar-expand-lg navbar-light bg-light" role="navigation">
        <NavbarBrand className="navbar-brand">
          <img src="static/AtHomeBolt.png" alt="AtHomeBolt" className=""/>
        </NavbarBrand>
        <Nav className="navbar-nav mr-auto">
          <IndexLinkContainer to="/" className="nav-link">
            <NavItem className="nav-item">Home</NavItem>
          </IndexLinkContainer>
          <LinkContainer to="/newdevice" className="nav-link">
            <NavItem className="nav-item">New Device</NavItem>
          </LinkContainer>
          <LinkContainer to="/about" className="nav-link">
            <NavItem className="nav-item">About</NavItem>
          </LinkContainer>
        </Nav>
      </Navbar>
    </header>
)};

export default Header;
