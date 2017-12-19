import { Worker } from './worker';

export class Jira2MdWorker extends Worker {

  pipeline() {
    return [
      // Code Block
      'handleCodeBlocks',
      // Quotes
      'handleQuotes',
      // Ordered Lists
      'handleOrederedLists',
      // Un-Ordered Lists
      'handleUnorderedLists',
      // Headers 1-6
      'handleHeaders',
      // Bold
      'handleBolds',
      // Italic
      'handleItalics',
      // Monospaced text
      'handleMonospaced',
      // Citations
      'handleCitations',
      // Inserts
      'handleInserts',
      // Superscript
      'handleSuperscripts',
      // Subscript
      'handleSubscripts',
      // Strikethrough
      'handleStrikethroughs',
      // Pre-formatted text
      'handlePreFormatted',
      // Un-named Links
      'handleUnNamedLinks',
      // Named Links
      'handleNamedLinks',
      // Single Paragraph Blockquote
      'handleSingleParagraphBlockquotes',
      // Colors
      'handleColors',
      // table with no header
      'handleTableWithNoHeaders',
      // panel into table
      'handlePanels',
      // table with header
      'handleTableHeaders',
      // remove leading-space of table headers and rows
      'handleTableHeadersLeadingSpaces',
      // handle all trailing spaces (add 2 spaces so that it renders as line breaks)
      'handleTrailingSpaces',
      // replace all intermediary mappings 
      'handleReplaceMap'
    ];
  }

  handleOrederedLists(str) {
    return str.replace(/^[ \t]*(\*+)\s+/gm, (match, stars) => {
      return new Array(stars.length).join('  ') + '* ';
    });
  }

  handleUnorderedLists(str) {
    return str.replace(/^[ \t]*(#+)\s+/gm, (match, nums) => {
      return new Array(nums.length).join('  ') + '1. ';
    });
  }

  handleHeaders(str) {
    return str.replace(/^h([0-6])\.(.*)$/gm, (match, level, content) => {
      return new Array(parseInt(level) + 1).join('#') + content;
    });
  }

  handleBolds(str) {
    return str.replace(/(^|\s|_)\*(\S.*)(\S)\*/g, '$1**$2$3**');
  }

  handleItalics(str) {
    return str.replace(/(^|\s|\*)\_(\S.*)(\S)\_/g, '$1*$2$3*');
  }

  handleMonospaced(str) {
    return str.replace(/(^|\s)\{\{([^}]+)\}\}($|\s)/g, '$1`$2`$3');
  }

  handleCitations(str) {
    return str.replace(/(^|\s)\?\?((?:.[^?]|[^?].)+)\?\?/g, '$1*&mdash; $2*');
  }

  handleInserts(str) {
    return str.replace(/(^|\s)\+([^+]*)(\S)\+/g, '$1<ins>$2$3</ins>');
  }

  handleSuperscripts(str) {
    return str.replace(/(^|\s)\^([^^]*)(\S)\^/g, '$1<sup>$2$3</sup>');
  }

  handleSubscripts(str) {
    return str.replace(/(^|\s)~([^~]*)(\S)~/g, '$1<sub>$2$3</sub>');
  }

  handleStrikethroughs(str) {
    return str.replace(/(^|\s)-(\S+.*?\S)-($|\s)/g, '$1~~$2~~$3');
  }

  handleCodeBlocks(str) {
    let result = '';
    let currentWord = '';
    let collecting = false;
    
    let index = -1;
    for (let i = 0; i < str.length; i++) {
      let ch = str[i];
      if (' \t\n\r\v'.indexOf(ch) === -1 && i < str.length - 1) {
        currentWord += ch;
      } else {
        if (i === str.length - 1) { currentWord += ch; ch = '';}
        // evaluate currentWord - if it's {code*} pattern, start collecting or stop collecting
        const codeRegEx = /\{code(:([a-z]+))?([:|]?(title|borderStyle|borderColor|borderWidth|bgColor|titleBGColor)=.+?)*\}/;
        const match = currentWord.match(codeRegEx);
        if (match) {
          result += '```' + (match[2] ? match[2] : '' ) + ch;
          collecting = !collecting;
          if (collecting) {
            index++;
          }
        } else {
          if (collecting) {
            const key = '@code_(' + index + ')_code@';
            if (this.replace_map[key]) {
              this.replace_map[key] += currentWord + ch;
            } else {
              this.replace_map[key] = currentWord + ch;
              result += key;
            }
          } else {
            result += currentWord + ch;
          }
        }
        currentWord = '';
      }
    }
    return result;
  }

  handleQuotes(str) {
    return str.replace(/\{quote\}([^]*)\{quote\}/gm, (match, lines) => {
        return lines.split('\n').map(line => { 
            if (line.trim().length) {
                return '> ' + line + '\n';
            } 
            return '\n';
        }).join('').trim() + '\n';
    });
  }

  handlePreFormatted(str) {
    return str.replace(/{noformat}/g, '```');
  }

  handleUnNamedLinks(str) {
    return str.replace(/\[((www\.|(https?|ftp):\/\/)[^\s/$.?#].[^\s]*)\]/g, '<$1>');
  }

  handleNamedLinks(str) {
    return str.replace(/\[(.+?)\|((www\.|(https?|ftp):\/\/)[^\s/$.?#].[^\s]*)\]/g, '[$1]($2)');
  }

  handleSingleParagraphBlockquotes(str) {
    return str.replace(/^bq\.\s+/gm, '> ');
  }

  handleColors(str) {
    return str.replace(
      /\{color:([^}]+)\}([^]*)\{color\}/gm,
      '<span style="color:$1" class="text-color-$1">$2</span>'
    );
  }

  handlePanels(str) {
    return str.replace(
      /\{panel:title=([^}]*)\}\n?([^]*?)\n?\{panel\}/gm,
      '\n| $1 |\n| --- |\n| $2 |'
    );
  }

  handleTableHeaders(str) {
    return str.replace(/^[ \t]*((?:\|\|.*?)+\|\|)[ \t]*$/gm, (match, headers) => {
      const singleBarred = headers.replace(/\|\|/g, '|');
      return '\n' + singleBarred + '\n' + singleBarred.replace(/\|[^|]+/g, '| --- ');
    });
  }

  handleTableWithNoHeaders(str) {
    return str.replace(/^[ \t]*((?:\|{1}[^\|\n]+)+\|)[ \t]*$/gm, (match, row, offset) => {
      let lookupOffset = offset - 1;
      let breaksCount = 0;
      while (lookupOffset > 0 && 
          (str[lookupOffset] === ' ' || str[lookupOffset] === '\n' || str[lookupOffset] === '\t') && 
          breaksCount < 2) {
        if (str[lookupOffset] === '\n') { breaksCount++; }
        lookupOffset--;
      }
      if (lookupOffset > 0 && str[lookupOffset] === '|') {
        return match.trim();
      }
      const emptyHeaders = row.trim().replace(/\|[^|]+/g, '| ');
      return emptyHeaders + '\n' + row.trim().replace(/\|[^|]+/g, '| --- ') + '\n' + row.trim();
    });
  }

  handleTableHeadersLeadingSpaces(str) {
    return str.replace(/^[ \t]*\|/gm, '|');
  }

  handleTrailingSpaces(str) {
    return str.replace(/([^\|\s])(\r)/g, '$1   $2');
  }
}
