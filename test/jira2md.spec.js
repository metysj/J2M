import fs from 'fs';
import path from 'path';
import { Converter } from '../src/index.js';

describe('J2M toMarkdown', () => {
  const j2m = new Converter();
  test('should exist', () => {
    expect(j2m.toMarkdown).toBeDefined();
  });
  test('should be a function', () => {
    expect(j2m.toMarkdown).toBeInstanceOf(Function);
  });
  test('should convert bolds properly', () => {
    const markdown = j2m.toMarkdown('*bold*');
    expect(markdown).toBe('**bold**');
  });
  test('should convert italics properly', () => {
    const markdown = j2m.toMarkdown('_italic_');
    expect(markdown).toBe('*italic*');
  });
  test('should convert monospaced content properly', () => {
    const markdown = j2m.toMarkdown('{{monospaced}}');
    expect(markdown).toBe('`monospaced`');
  });
  //test('should convert citations properly', () => {
  //    const markdown = j2m.toMarkdown('??citation??');
  //    markdown).toBe('<cite>citation</cite>');
  //});
  test('should convert strikethroughs properly', () => {
    const markdown = j2m.toMarkdown('-deleted-');
    expect(markdown).toBe('~~deleted~~');
  });
  test('should convert inserts properly', () => {
    const markdown = j2m.toMarkdown('+inserted+');
    expect(markdown).toBe('<ins>inserted</ins>');
  });
  test('should convert superscript properly', () => {
    const markdown = j2m.toMarkdown('^superscript^');
    expect(markdown).toBe('<sup>superscript</sup>');
  });
  test('should convert subscript properly', () => {
    const markdown = j2m.toMarkdown('~subscript~');
    expect(markdown).toBe('<sub>subscript</sub>');
  });
  test('should convert preformatted blocks properly', () => {
    const markdown = j2m.toMarkdown(
      '{noformat}\nso *no* further _formatting_ is done here\n{noformat}'
    );
    expect(markdown).toBe('```\nso **no** further *formatting* is done here\n```');
  });
  test('should convert language-specific code blocks properly', () => {
    const markdown = j2m.toMarkdown("{code:javascript}\nvar hello = 'world';\n{code}");
    expect(markdown).toBe("```javascript\nvar hello = 'world';\n```");
  });
  test('should convert code without language-specific and with title into code block', () => {
    const markdown = j2m.toMarkdown(
      '{code:title=Foo.java}\nclass Foo {\n  public static void main() {\n  }\n}\n{code}'
    );
    expect(markdown).toBe('```\nclass Foo {\n  public static void main() {\n  }\n}\n```');
  });
  test('should convert fully configured code block', () => {
    const markdown = j2m.toMarkdown(
      '{code:xml|title=My Title|borderStyle=dashed|borderColor=#ccc|titleBGColor=#F7D6C1|bgColor=#FFFFCE}' +
        '\n    <test>' +
        '\n        <another tag="attribute"/>' +
        '\n    </test>' +
        '\n{code}'
    );
    expect(markdown).toBe(
      '```xml' + '\n    <test>' + '\n        <another tag="attribute"/>' + '\n    </test>' + '\n```'
    );
  });
  test('should convert unnamed links properly', () => {
    const markdown = j2m.toMarkdown('[http://google.com]');
    expect(markdown).toBe('<http://google.com>');
  });
  test('should convert named links properly', () => {
    const markdown = j2m.toMarkdown('[Google|http://google.com]');
    expect(markdown).toBe('[Google](http://google.com)');
  });
  test('should convert headers properly', () => {
    const h1 = j2m.toMarkdown('h1. Biggest heading');
    const h2 = j2m.toMarkdown('h2. Bigger heading');
    const h3 = j2m.toMarkdown('h3. Big heading');
    const h4 = j2m.toMarkdown('h4. Normal heading');
    const h5 = j2m.toMarkdown('h5. Small heading');
    const h6 = j2m.toMarkdown('h6. Smallest heading');
    expect(h1).toBe('# Biggest heading');
    expect(h2).toBe('## Bigger heading');
    expect(h3).toBe('### Big heading');
    expect(h4).toBe('#### Normal heading');
    expect(h5).toBe('##### Small heading');
    expect(h6).toBe('###### Smallest heading');
  });
  test('should convert blockquotes properly', () => {
    const markdown = j2m.toMarkdown(
      'bq. This is a long blockquote type thingy that needs to be converted.'
    );
    expect(markdown).toBe('> This is a long blockquote type thingy that needs to be converted.');
  });
  test('should convert un-ordered lists properly', () => {
    const markdown = j2m.toMarkdown(
      '* Foo\n* Bar\n* Baz\n** FooBar\n** BarBaz\n*** FooBarBaz\n* Starting Over'
    );
    expect(markdown).toBe(
      '* Foo\n* Bar\n* Baz\n  * FooBar\n  * BarBaz\n    * FooBarBaz\n* Starting Over'
    );
  });
  test('should convert ordered lists properly', () => {
    const markdown = j2m.toMarkdown(
      '# Foo\n# Bar\n# Baz\n## FooBar\n## BarBaz\n### FooBarBaz\n# Starting Over'
    );
    expect(markdown).toBe(
      '1. Foo\n1. Bar\n1. Baz\n  1. FooBar\n  1. BarBaz\n    1. FooBarBaz\n1. Starting Over'
    );
  });
  test('should handle bold AND italic (combined) correctly', () => {
    const markdown = j2m.toMarkdown('This is _*emphatically bold*_!');
    expect(markdown).toBe('This is ***emphatically bold***!');
  });
  test('should handle bold within a un-ordered list item', () => {
    const markdown = j2m.toMarkdown('* This is not bold!\n** This is *bold*.');
    expect(markdown).toBe('* This is not bold!\n  * This is **bold**.');
  });
  test('should be able to handle a complicated multi-line jira-wiki string and convert it to markdown', () => {
    var jira_str = fs.readFileSync(path.resolve(__dirname, 'test.jira'), 'utf8');
    var md_str = fs.readFileSync(path.resolve(__dirname, 'test.md'), 'utf8');
    const markdown = j2m.toMarkdown(jira_str);
    expect(markdown).toBe(md_str);
  });
  test('should not recognize strikethroughs over multiple lines', () => {
    const markdown = j2m.toMarkdown(
      "* Here's an un-ordered list line\n* Multi-line strikethroughs shouldn't work."
    );
    expect(markdown).toBe(
      "* Here's an un-ordered list line\n* Multi-line strikethroughs shouldn't work."
    );
  });
  test('should use special tags for color attributes', () => {
    const markdown = j2m.toMarkdown(
      'A text with{color:blue} blue \n lines {color} is not necessary.'
    );
    expect(markdown).toBe(
      'A text with<span style="color:blue" class="text-color-blue"> blue \n lines </span> is not necessary.'
    );
  });
  test('should use a custom handler', () => {
    const markdown = j2m.toMarkdown('* This is not bold!\n** This is *bold*.', {
      handleBolds(str) {
        return str.replace(/(^|\s|_)\*(\S.*)\*/g, '$1{{$2}}');
      },
      postProcessing(str) {
        return str + ' post';
      }
    });
    expect(markdown).toBe('* This is not bold!\n  * This is {{bold}}. post');
  });
});
