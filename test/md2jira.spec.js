import fs from 'fs';
import path from 'path';
import { Converter } from '../src/index.js';

describe('J2M toJira', () => {
  const j2m = new Converter();
  test('should exist', () => {
    expect(j2m.toJira).toBeDefined();
  });
  test('should be a function', () => {
    expect(j2m.toJira).toBeInstanceOf(Function);
  });
  test('should convert bolds properly', () => {
    const jira = j2m.toJira('**bold**');
    expect(jira).toBe('*bold*');
  });
  test('should convert italics properly', () => {
    const jira = j2m.toJira('*italic*');
    expect(jira).toBe('_italic_');
  });
  test('should convert monospaced content properly', () => {
    const jira = j2m.toJira('`monospaced`');
    expect(jira).toBe('{{monospaced}}');
  });
  test('should convert citations properly', () => {
    const jira = j2m.toJira('*&mdash; citation*');
    expect(jira).toBe('??citation??');
  });
  test('should convert strikethroughs properly', () => {
    const jira = j2m.toJira('~~deleted~~');
    expect(jira).toBe('-deleted-');
  });
  test('should convert inserts properly', () => {
    const jira = j2m.toJira('<ins>inserted</ins>');
    expect(jira).toBe('+inserted+');
  });
  test('should convert superscript properly', () => {
    const jira = j2m.toJira('<sup>superscript</sup>');
    expect(jira).toBe('^superscript^');
  });
  test('should convert subscript properly', () => {
    const jira = j2m.toJira('<sub>subscript</sub>');
    expect(jira).toBe('~subscript~');
  });
  test('should convert preformatted blocks properly', () => {
    const jira = j2m.toJira('```\nso *no* further **formatting** is done here\n```');
    expect(jira).toBe('{code}\nso _no_ further *formatting* is done here\n{code}');
  });
  test('should convert language-specific code blocks properly', () => {
    const jira = j2m.toJira("```javascript\nvar hello = 'world';\n```");
    expect(jira).toBe("{code:javascript}\nvar hello = 'world';\n{code}");
  });
  test('should convert unnamed links properly', () => {
    const jira = j2m.toJira('<http://google.com>');
    expect(jira).toBe('[http://google.com]');
  });
  test('should convert named links properly', () => {
    const jira = j2m.toJira('[Google](http://google.com)');
    expect(jira).toBe('[Google|http://google.com]');
  });
  test('should convert headers properly', () => {
    const h1 = j2m.toJira('# Biggest heading');
    const h2 = j2m.toJira('## Bigger heading');
    const h3 = j2m.toJira('### Big heading');
    const h4 = j2m.toJira('#### Normal heading');
    const h5 = j2m.toJira('##### Small heading');
    const h6 = j2m.toJira('###### Smallest heading');
    expect(h1).toBe('h1. Biggest heading');
    expect(h2).toBe('h2. Bigger heading');
    expect(h3).toBe('h3. Big heading');
    expect(h4).toBe('h4. Normal heading');
    expect(h5).toBe('h5. Small heading');
    expect(h6).toBe('h6. Smallest heading');
  });
  test('should convert underline-style headers properly', () => {
    const h1 = j2m.toJira('Biggest heading\n=======');
    const h2 = j2m.toJira('Bigger heading\n------');
    expect(h1).toBe('h1. Biggest heading');
    expect(h2).toBe('h2. Bigger heading');
  });
  test('should convert blockquotes properly', () => {
    const jira = j2m.toJira('> This is a long blockquote type thingy that needs to be converted.');
    expect(jira).toBe('bq. This is a long blockquote type thingy that needs to be converted.');
  });
  test('should convert un-ordered lists properly', () => {
    const jira = j2m.toJira(
      '* Foo\n* Bar\n* Baz\n  * FooBar\n  * BarBaz\n    * FooBarBaz\n* Starting Over'
    );
    expect(jira).toBe('* Foo\n* Bar\n* Baz\n** FooBar\n** BarBaz\n*** FooBarBaz\n* Starting Over');
  });
  test('should convert ordered lists properly', () => {
    const jira = j2m.toJira(
      '1. Foo\n1. Bar\n1. Baz\n  1. FooBar\n  1. BarBaz\n    1. FooBarBaz\n1. Starting Over'
    );
    expect(jira).toBe('# Foo\n# Bar\n# Baz\n## FooBar\n## BarBaz\n### FooBarBaz\n# Starting Over');
  });
  test('should handle bold AND italic (combined) correctly', () => {
    const jira = j2m.toJira('This is ***emphatically bold***!');
    expect(jira).toBe('This is _*emphatically bold*_!');
  });
  test('should handle bold within a un-ordered list item', () => {
    const jira = j2m.toJira('* This is not bold!\n  * This is **bold**.');
    expect(jira).toBe('* This is not bold!\n** This is *bold*.');
  });
  test('should be able to handle a complicated multi-line markdown string and convert it to markdown', () => {
    const jira_str = fs.readFileSync(path.resolve(__dirname, 'test.jira'), 'utf8');
    const md_str = fs.readFileSync(path.resolve(__dirname, 'test.md'), 'utf8');
    const jira = j2m.toJira(md_str);
    expect(jira).toBe(jira_str);
  });
  test('should not change markup that are not links', () => {
    const jira = j2m.toJira('<span style="color:green" class="text-color-green">now with color</span>');
    expect(jira).toBe('<span style="color:green" class="text-color-green">now with color</span>');
  });
  test('should use a custom handler', () => {
    const markdown = j2m.toJira('* This is not bold!\n  * This is **bold**.', {
      preProcessing(str) {
        return 'added ' + str;
      },
      handleBoldItalicsCombined(str) {
        return str.replace(/([*_]+)(\S.*?)\1/g, (match, wrapper, content) => {
          switch (wrapper.length) {
            case 1:
              return '_' + content + '_';
            case 2:
              return '{' + content + '}';
            case 3:
              return '_*' + content + '*_';
            default:
              return wrapper + content * wrapper;
          }
        });
      }
    });
    expect(markdown).toBe('added * This is not bold!\n** This is {bold}.');
  });
});
