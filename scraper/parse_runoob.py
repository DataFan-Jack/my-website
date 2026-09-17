# -*- coding: utf-8 -*-
"""从 runoob 镜像 HTML 提取网页教程数据：每页 -> {title, body, examples[]}
改进：完整抓 h1 标题；正文保留行内标签(a/strong/code...)文本；段落按块级标签分隔
"""
import re, os, json, html
from html.parser import HTMLParser

BLOCK_TAGS = {'p', 'h1', 'h2', 'h3', 'h4', 'li', 'blockquote', 'td', 'th', 'dt', 'dd', 'tr', 'ul', 'ol', 'table', 'pre', 'div'}
SKIP_PARENT = {'script', 'style', 'nav', 'aside', 'footer', 'header', 'form'}


class RunoobParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_article = 0
        self.in_example = 0        # 是否在 .example 块内
        self.in_example_code = 0   # 是否在 .example_code 内
        self.skip_depth = 0
        self.stack = []
        self.title = ''
        self.in_h1 = False
        self.cur_block = ''
        self.body_parts = []
        self.cur_code = ''
        self.examples = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        cls = attrs.get('class', '')
        if tag in SKIP_PARENT:
            self.skip_depth += 1
            return
        if self.skip_depth:
            return
        self.stack.append(tag)
        if tag == 'div' and 'article-intro' in cls:
            self.in_article += 1
        if self.in_article:
            if tag == 'h1':
                self.in_h1 = True
            if tag == 'div':
                csplit = cls.split()
                if 'example' in csplit and 'example_code' not in csplit:
                    self.in_example += 1
                if 'example_code' in csplit:
                    self.in_example_code += 1

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if tag in SKIP_PARENT:
            if self.skip_depth:
                self.skip_depth -= 1
            return
        if self.skip_depth:
            return
        if tag == 'h1' and self.in_h1:
            self.in_h1 = False
            self.title = re.sub(r'\s+', ' ', self.title).strip()
        if self.in_example_code:
            if tag == 'div':
                self.examples.append(self.cur_code.strip())
                self.cur_code = ''
                self.in_example_code -= 1
            return
        # 块级标签结束 -> flush 正文块
        if tag in BLOCK_TAGS and self.in_article:
            self.flush_block()
        if tag == 'div':
            if self.in_example:
                self.in_example -= 1
            if self.in_article:
                self.in_article -= 1
        if self.stack:
            self.stack.pop()

    def handle_data(self, data):
        if self.skip_depth:
            return
        if not self.in_article:
            return
        if self.in_example_code:
            self.cur_code += data
            return
        if self.in_h1:
            self.title += data
            return
        # 正文：收集所有文本（含行内标签内容）
        if data.strip():
            self.cur_block += data

    def flush_block(self):
        t = re.sub(r'[ \t\r\f\v]+', ' ', self.cur_block).strip()
        if t:
            self.body_parts.append(t)
        self.cur_block = ''


def parse_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    parser = RunoobParser()
    parser.feed(content)
    body = '\n'.join(parser.body_parts)
    title = parser.title or os.path.splitext(os.path.basename(path))[0]
    # 去掉标题里的重复"-"尾巴
    title = re.sub(r'\s*-\s*$', '', title)
    return {'title': title, 'body': body, 'examples': parser.examples}


if __name__ == '__main__':
    d = r'C:\Users\ch\Doubao\chats\2026-09-12\new-chat-1\runoob_mirror\www.runoob.com\html'
    files = sorted(f for f in os.listdir(d) if f.endswith('.html'))
    print('pages:', len(files))
    for f in files[:8]:
        r = parse_file(os.path.join(d, f))
        print('===', f)
        print(' title:', r['title'])
        print(' body head:', r['body'][:100].replace('\n', ' / '))
        print(' examples:', len(r['examples']))
        if r['examples']:
            print('   ex0:', r['examples'][0][:80].replace('\n', '⏎'))
