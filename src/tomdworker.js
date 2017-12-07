export class ToMdWorker {
  constructor(str) {}

  pipeline(str) {
    return [
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
      // Code Block
      'handleCodeBlocks',
      // Quotes
      'handleQuotes',
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
      // panel into table
      'handlePanels',
      // table header
      'handleTableHeaders',
      // remove leading-space of table headers and rows
      'handleTeableHeadersLeadingSpaces',
      // handle all trailing spaces (add 2 spaces so that it renders as line breaks)
      'handleTrailingSpaces'
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
    return str.replace(/(^|\s|_)\*(\S.*)\*/g, '$1**$2**');
  }

  handleItalics(str) {
    return str.replace(/(^|\s|\*)\_(\S.*)\_/g, '$1*$2*');
  }

  handleMonospaced(str) {
    return str.replace(/(^|\s)\{\{([^}]+)\}\}($|\s)/g, '$1`$2`$3');
  }

  handleCitations(str) {
    return str.replace(/(^|\s)\?\?((?:.[^?]|[^?].)+)\?\?/g, '$1*&mdash; $2*');
  }

  handleInserts(str) {
    return str.replace(/(^|\s)\+([^+]*)\+/g, '$1<ins>$2</ins>');
  }

  handleSuperscripts(str) {
    return str.replace(/(^|\s)\^([^^]*)\^/g, '$1<sup>$2</sup>');
  }

  handleSubscripts(str) {
    return str.replace(/(^|\s)~([^~]*)~/g, '$1<sub>$2</sub>');
  }

  handleStrikethroughs(str) {
    return str.replace(/(^|\s)-(\S+.*?\S)-($|\s)/g, '$1~~$2~~$3');
  }

  handleCodeBlocks(str) {
    return str.replace(
      /\{code(:([a-z]+))?([:|]?(title|borderStyle|borderColor|borderWidth|bgColor|titleBGColor)=.+?)*\}([^]*)\{code\}/gm,
      '```$2$5```'
    );
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

  handleTeableHeadersLeadingSpaces(str) {
    return str.replace(/^[ \t]*\|/gm, '|');
  }

  handleTrailingSpaces(str) {
    return str.replace(/(\S)\r/g, '$1  \r');
  }
}
