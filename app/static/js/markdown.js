/*
  Markdown to HTML to JSX React Component
  © 2020, 2024 Dave Hocker (AtHomeX10@gmail.com)

  Takes markdown formatted text and renders it using GitHub flavored
  markdown styling.

  Usage
    <Markdown text="markdown text..."/>

  References
    Markdown to HTML: https://github.com/showdownjs/showdown
    HTML to JSX: https://github.com/wrakky/react-html-parser
    GitHub flavored styling: https://github.com/sindresorhus/github-markdown-css
*/

import React from "react";
import showdown from 'showdown';
import ReactHtmlParser from 'react-html-parser';

// This stylesheet produces GitHub-like output
import "github-markdown-css/github-markdown.css";
import "../css/markdown.scss";

export function Markdown(props) {
    // This is an example of rendering Markdown to HTML
    // and then converting the HTML to JSX.
    const converter = new showdown.Converter();
    converter.setFlavor('github');
    // See https://github.com/showdownjs/showdown for more on these options
    converter.setOption("tables", true);
    // We don't want a line break for every newline in the Markdown file
    converter.setOption("simpleLineBreaks", false);

    const html = converter.makeHtml(props.text);

    return (
        <div className="markdown-body">
            {ReactHtmlParser(html)}
        </div>
    );
}
