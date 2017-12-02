export class ToJiraWorker {
  pipeline() {
    return [
      // Bold, Italic, and Combined (bold+italic)
      'handleBoldItalicsCombined',
      // Headers
      'handleHeaders',
      // Ordered Lists
      'handleOrderedLists',
      // Un-Ordered Lists
      'handleUnorderedLists',
      // Citations
      'handleCitations',
      // Headers (h1 or h2) (lines "underlined" by ---- or =====)
      // Citations, Inserts, Subscripts, Superscripts, and Strikethroughs
      'handleTextEffects',
      // Other kind of strikethrough
      'handleStrikethroughs',
      // Named/Un-Named Code Block
      'handleCodeBlocks',
      // Inline-Preformatted Text
      'handlePreFormatted',
      // Named Link
      'handleNamedLinks',
      // Un-Named Link
      'handleUnNamedLinks',
      // Single Paragraph Blockquote
      'handleSingleParagraphBlockquotes',
      // tables
      'handleTables'
    ];
  }

  handleBoldItalicsCombined(str) {
    return str.replace(/([*_]+)(\S.*?)\1/g, (match, wrapper, content) => {
      switch (wrapper.length) {
        case 1:
          return '_' + content + '_';
        case 2:
          return '*' + content + '*';
        case 3:
          return '_*' + content + '*_';
        default:
          return wrapper + content * wrapper;
      }
    });
  }

  handleHeaders(str) {
    return str
      .replace(/^([#]+)(.*?)$/gm, (match, level, content) => {
        return 'h' + level.length + '.' + content;
      })
      .replace(/^(.*?)\n([=-]+)$/gm, function(match, content, level) {
        return 'h' + (level[0] === '=' ? 1 : 2) + '. ' + content;
      });
  }

  handleOrderedLists(str) {
    return str.replace(/^([ \t]*)\d+\.\s+/gm, (match, spaces) => {
      return new Array(Math.floor(spaces.length / 2 + 1)).join('#') + '# ';
    });
  }

  handleUnorderedLists(str) {
    return str.replace(/^([ \t]*)\*\s+/gm, (match, spaces) => {
      return new Array(Math.floor(spaces.length / 2 + 1)).join('*') + '* ';
    });
  }

  handleTextEffects(str) {
    const map = {
      del: '-',
      ins: '+',
      sup: '^',
      sub: '~'
    };
    return str.replace(
      new RegExp('<(' + Object.keys(map).join('|') + ')>(.*?)</\\1>', 'g'),
      (match, from, content) => {
        const to = map[from];
        return to + content + to;
      }
    );
  }

  handleCitations(str) {
    return str.replace(/\*&mdash;\s(.*?)\*/g, '??$1??').replace(/_&mdash;\s(.*?)_/g, '??$1??');
  }

  handleStrikethroughs(str) {
    return str.replace(/(^|\s+)~~(.*?)~~($|\s+)/g, '$1-$2-$3');
  }

  handleCodeBlocks(str) {
    return str.replace(/`{3,}(\w+)?((?:\n|[^`])+)`{3,}/g, (match, synt, content) => {
      let code = '{code';
      if (synt) {
        code += ':' + synt;
      }
      return code + '}' + content + '{code}';
    });
  }

  handlePreFormatted(str) {
    return str.replace(/`([^`]+)`/g, '{{$1}}');
  }

  handleNamedLinks(str) {
    return str.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]');
  }

  handleUnNamedLinks(str) {
    return str.replace(/<([^>]+)>/g, '[$1]');
  }

  handleSingleParagraphBlockquotes(str) {
    return str.replace(/^>/gm, 'bq.');
  }

  handleTables(str) {
    return str.replace(
      /^\n((?:\|.*?)+\|)[ \t]*\n((?:\|\s*?\-{3,}\s*?)+\|)[ \t]*\n((?:(?:\|.*?)+\|[ \t]*\n)*)$/gm,
      (match, headerLine, separatorLine, rowstr) => {
        const headers = headerLine.match(/[^|]+(?=\|)/g);
        const separators = separatorLine.match(/[^|]+(?=\|)/g);
        if (headers.length !== separators.length) {
          return match;
        }
        const rows = rowstr.split('\n');
        if (rows.length === 1 + 1 && headers.length === 1) {
          // panel
          return (
            '{panel:title=' +
            headers[0].trim() +
            '}\n' +
            rowstr.replace(/^\|(.*)[ \t]*\|/, '$1').trim() +
            '\n{panel}\n'
          );
        } else {
          return '||' + headers.join('||') + '||\n' + rowstr;
        }
      }
    );
  }
}
