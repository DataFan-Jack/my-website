# -*- coding: utf-8 -*-
"""全量把 runoob 镜像所有教程转成网站教程 JSON（懒加载分片）。
- 每个教程一个文件 public/tutorials/<key>.json（含全部章节）
- public/tutorial-data.json 轻量索引
- 名称/简介自动从教程首页抽取；分类按目录映射
"""
import os, re, sys, json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parse_runoob import parse_file

MIRROR = r'C:\Users\ch\Doubao\chats\2026-09-12\new-chat-1\runoob_mirror\www.runoob.com'
PUBLIC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public'))

# 分类映射：目录 -> 分类（未列出的归入"其他"）
CATEGORY = {
    # 前端开发
    'html': '前端开发', 'css': '前端开发', 'css3': '前端开发', 'js': '前端开发',
    'vue3': '前端开发', 'vue2': '前端开发', 'react': '前端开发', 'angularjs': '前端开发',
    'angularjs2': '前端开发', 'nextjs': '前端开发', 'typescript': '前端开发',
    'bootstrap': '前端开发', 'bootstrap4': '前端开发', 'bootstrap5': '前端开发',
    'tailwindcss': '前端开发', 'foundation': '前端开发', 'jquery': '前端开发',
    'jqueryui': '前端开发', 'jquerymobile': '前端开发', 'ajax': '前端开发',
    'dom': '前端开发', 'htmldom': '前端开发', 'json': '前端开发', 'echarts': '前端开发',
    'chartjs': '前端开发', 'highcharts': '前端开发', 'svg': '前端开发',
    'font-awesome': '前端开发', 'ionic': '前端开发', 'flutter': '前端开发',
    'web': '前端开发', 'w3c': '前端开发', 'w3cnote': '前端开发', 'pwa': '前端开发',
    # 后端开发
    'python3': '后端开发', 'python': '后端开发', 'java': '后端开发', 'go': '后端开发',
    'nodejs': '后端开发', 'php': '后端开发', 'django': '后端开发', 'flask': '后端开发',
    'fastapi': '后端开发', 'asp': '后端开发', 'aspnet': '后端开发', 'jsp': '后端开发',
    'servlet': '后端开发', 'restfulapi': '后端开发', 'webservices': '后端开发',
    'ruby': '后端开发', 'perl': '后端开发', 'scala': '后端开发', 'kotlin': '后端开发',
    'dart': '后端开发', 'swift': '后端开发', 'rust': '后端开发', 'zig': '后端开发',
    'julia': '后端开发', 'lua': '后端开发', 'electron': '后端开发', 'http': '后端开发',
    'tcpip': '后端开发', 'soap': '后端开发', 'rss': '后端开发', 'xml': '后端开发',
    'xpath': '后端开发', 'xquery': '后端开发', 'xsl': '后端开发', 'xslfo': '后端开发',
    'xslt': '后端开发', 'dtd': '后端开发', 'schema': '后端开发', 'wsdl': '后端开发',
    'rdf': '后端开发', 'xlink': '后端开发', 'vbscript': '后端开发', 'cgi': '后端开发',
    # 编程语言（基础语言归此类，与后端分开更清晰则归后端；此处归语言）
    'c': '编程语言', 'cprogramming': '编程语言', 'cplusplus': '编程语言', 'csharp': '编程语言',
    'assembly': '编程语言', 'sql': '编程语言', 'regexp': '编程语言', 'markdown': '编程语言',
    'latex': '编程语言', 'c-dsa': '编程语言', 'data-structures': '编程语言',
    'computer-organization': '编程语言', 'design-pattern': '编程语言',
    'python-design-pattern': '编程语言',
    # 数据库
    'mysql': '数据库', 'mongodb': '数据库', 'redis': '数据库', 'sqlite': '数据库',
    'postgresql': '数据库', 'memcached': '数据库', 'memcache': '数据库', 'oracle': '数据库',
    # 人工智能
    'ai': '人工智能', 'ai-agent': '人工智能', 'ai-math': '人工智能', 'ml': '人工智能',
    'nlp': '人工智能', 'numpy': '人工智能', 'pandas': '人工智能', 'matplotlib': '人工智能',
    'pytorch': '人工智能', 'tensorflow': '人工智能', 'sklearn': '人工智能', 'scipy': '人工智能',
    'langchain': '人工智能', 'ollama': '人工智能', 'opencv': '人工智能', 'pillow': '人工智能',
    'claude-code': '人工智能', 'codex': '人工智能', 'deepseek-harness': '人工智能',
    'hermes-agent': '人工智能', 'pi-agent': '人工智能', 'opencode': '人工智能',
    'vibe-coding': '人工智能', 'appml': '人工智能',
    # 工具与运维
    'git': '工具与运维', 'svn': '工具与运维', 'docker': '工具与运维', 'linux': '工具与运维',
    'vscode': '工具与运维', 'eclipse': '工具与运维', 'pycharm': '工具与运维',
    'maven': '工具与运维', 'cmake': '工具与运维', 'powershell': '工具与运维',
    'jupyter-notebook': '工具与运维', 'obsidian': '工具与运维', 'hosting': '工具与运维',
    'browsers': '工具与运维', 'quiz': '工具与运维', 'quality': '工具与运维',
    'googleapi': '工具与运维', 'swagger': '工具与运维', 'playwright': '工具与运维',
    'selenium': '工具与运维', 'npm': '工具与运维', 'np': '工具与运维',
}

def clean_title(t):
    t = re.sub(r'\s+', ' ', t or '').strip()
    # 去掉 runoob 标题尾巴，如 "- (HTML5 标准)"、"- 4个实例"
    t = re.sub(r'\s*-\s*(\(.*?\)|[\d\uff08].*?)$', '', t)
    t = t.replace(' 教程', '')
    return t.strip() or '教程'

def home_info(d):
    """从教程首页抽 name 与 desc"""
    dpath = os.path.join(MIRROR, d)
    files = sorted(f for f in os.listdir(dpath) if f.endswith('.html'))
    if not files:
        return None, None, None
    # 优先选 *-tutorial.html 或 <dir>.html 作为首页
    home = None
    for cand in [d + '-tutorial.html', d + '.html', 'index.html']:
        if os.path.exists(os.path.join(dpath, cand)):
            home = cand
            break
    home = home or files[0]
    r = parse_file(os.path.join(dpath, home))
    name = clean_title(r['title'])
    # 名字回退：目录名
    if not name or name == '教程':
        name = {'js': 'JavaScript', 'cplusplus': 'C++', 'cprogramming': 'C语言',
                'csharp': 'C#', 'np': 'npm'}.get(d, d)
    # desc：正文首段（去 "教程"字样尾巴）
    desc = ''
    for para in r['body'].split('\n'):
        p = para.strip()
        if p and len(p) > 4:
            desc = p[:40]
            break
    return name, desc, home

def main():
    os.makedirs(os.path.join(PUBLIC, 'tutorials'), exist_ok=True)
    dirs = sorted(d for d in os.listdir(MIRROR)
                  if os.path.isdir(os.path.join(MIRROR, d)))
    index = []
    skipped = []
    for d in dirs:
        dpath = os.path.join(MIRROR, d)
        files = [f for f in os.listdir(dpath) if f.endswith('.html')]
        if not files:
            skipped.append((d, 'no html'))
            continue
        name, desc, home = home_info(d)
        if not name:
            skipped.append((d, 'no home'))
            continue
        cat = CATEGORY.get(d, '其他')
        chapters = []
        for f in sorted(files):
            r = parse_file(os.path.join(dpath, f))
            chapters.append({
                'title': r['title'], 'url': 'https://www.runoob.com/%s/%s' % (d, f),
                'body': r['body'], 'examples': r['examples'],
            })
        # 按标题去重
        seen, uniq = set(), []
        for ch in chapters:
            if ch['title'] in seen:
                continue
            seen.add(ch['title'])
            uniq.append(ch)
        tutorial = {
            'name': name, 'category': cat, 'desc': desc,
            'url': 'https://www.runoob.com/%s/' % d,
            'chapters': uniq,
        }
        out = os.path.join(PUBLIC, 'tutorials', d + '.json')
        with open(out, 'w', encoding='utf-8') as f:
            json.dump({'tutorial': tutorial}, f, ensure_ascii=False, indent=1)
        index.append({'name': name, 'category': cat, 'desc': desc, 'file': d + '.json'})
        print('OK %-16s %-6s %2d章 %4dKB  %s' %
              (d, cat, len(uniq), os.path.getsize(out) // 1024, (desc or '')[:24]))
    with open(os.path.join(PUBLIC, 'tutorial-data.json'), 'w', encoding='utf-8') as f:
        json.dump({'tutorials': index}, f, ensure_ascii=False, indent=1)
    print('\nTOTAL tutorials:', len(index), '| skipped:', len(skipped))
    for s in skipped:
        print('  skip', s)
    print('index size:', os.path.getsize(os.path.join(PUBLIC, 'tutorial-data.json')) // 1024, 'KB')

if __name__ == '__main__':
    main()
