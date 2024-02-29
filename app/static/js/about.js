/*
    AgentMPDFRB - web app for controlling an mpd instance
    Copyright © 2022, 2024  Dave Hocker (email: AtHomeX10@gmail.com)

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
import { useState } from "react";
import {ajaxGet} from "./ajax_utils";
import {Markdown} from "./markdown";

export function About () {
    // We're using async/await and this is the best way to deal with it
    const [md_text, setText] = useState("");

    // Get the contents of the about.md file (Markdown)
    async function loadAbout() {
        // The response is markdown text in an object
        const response = await ajaxGet("/markdown/about");
        const text = await response.markdown;
        // Trigger a re-render
        setText(text);
        return response;
    }

    loadAbout().then();

    return (
        <div className="panel panel-default">
            <div className="jumbotron text-center h-25 p-1 my-2">
                <h1 className="text-primary">About (about.md)</h1>
            </div>
            <div className="card my-5">
                <div className="card-body">
                    <Markdown text={md_text}/>
                </div>
            </div>
        </div>
    )
}
