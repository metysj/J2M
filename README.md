# jira2md

## JIRA to MarkDown text format converter
Convert from JIRA text formatting to GitHub Flavored MarkDown and back again.

## Credits
This module was heavily inspired by the jira2md project which was in turn forked from the J2M project by Fokke Zandbergen (http://j2m.fokkezb.nl/). 
Major credit to Fokke (and other contributors) for establishing a lot of the fundamental RexExp patterns for this module to work.

## Installation
```
npm install jira2markdown
```

## Supported Conversions
NOTE: All conversion work bi-directionally (from jira to markdown and back again).

* Headers (H1-H6)
* Bold
* Italic
* Bold + Italic
* Un-ordered lists
* Ordered lists
* Programming Language-specific code blocks (with help from herbert-venancio)
* Inline preformatted text spans
* Un-named links
* Named links
* Monospaced Text
* Citations
* Strikethroughs
* Inserts
* Superscripts
* Subscripts
* Single-paragraph blockquotes
* Tables
* Panels


## How to Use

### Markdown String

We'll refer to this as the `md` variable in the examples below.

```
**Some bold things**
*Some italic stuff*
## H2
<http://google.com>
```

### Atlassian Wiki Syntax

We'll refer to this as the `jira` variable in the examples below.

```
*Some bold things**
_Some italic stuff_
h2. H2
[http://google.com]
```

### Examples (CommonJS)

```javascript
// Include the module
var jira2markdown = require('jira2markdown');

// Instantiate the converter
var j2m = new jira2markdown.Converter();

// If converting from Mardown to Jira Wiki Syntax:
var jira = j2m.toJira(md);

// If converting from Jira Wiki Syntax to Markdown:
var md = j2m.toMarkdown(jira);
```

### Examples (ES2015+)
```javascript 
// Include the module
import { Converter } from 'jira2markdown';

// Instantiate the converter
const j2m = new Converter();

// If converting from Mardown to Jira Wiki Syntax:
const jira = j2m.toJira(md);

// If converting from Jira Wiki Syntax to Markdown:
const md = j2m.toMarkdown(jira);
```