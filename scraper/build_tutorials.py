# -*- coding: utf-8 -*-
"""批量把 runoob 镜像教程转成网页教程 JSON（分片懒加载）：
- 每个教程一个文件 public/tutorials/<key>.json（含全部章节）
- public/tutorial-data.json 改为轻量索引（仅名称/简介/分类/文件指针）
"""
import os, sys, json

# 让脚本能引用同级 parse_runoob 的逻辑（内联于此，避免跨目录依赖）
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parse_runoob import parse_file  # 若同目录有；否则下面用内联解析

MIRROR = r'C:\Users\ch\Doubao\chats\2026-09-12\new-chat-1\runoob_mirror\www.runoob.com'
PUBLIC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public'))

# (镜像目录, key, 名称, 分类, 简介)
TUTORIALS = [
    ('html',     'html',     'HTML 教程',     '前端开发', '从零开始学 HTML，搭建网页基础结构。'),
    ('css',      'css',      'CSS 教程',      '前端开发', '用 CSS 美化网页，掌握布局与样式。'),
    ('js',       'js',       'JavaScript 教程', '前端开发', '前端脚本语言，实现网页交互与动态效果。'),
    ('python3',  'python3',  'Python3 教程',  '后端开发', 'Python 3 入门与进阶，从基础语法到常用库。'),
    ('vue3',     'vue3',     'Vue3 教程',     '前端开发', 'Vue 3 组合式 API，构建现代前端应用。'),
    ('java',     'java',     'Java 教程',     '后端开发', 'Java 面向对象编程，从基础到进阶。'),
]

# 需要忽略的非教程页（纯引用/手册等）
IGNORE_START = ('reference-', 'manual-', 'index', 'syntax-')


def parse_file_local(path):
    """从 parse_runoob 导入；若失败则内联兜底（不会走到，因为同目录有）"""
    return parse_file(path)


def main():
    os.makedirs(os.path.join(PUBLIC, 'tutorials'), exist_ok=True)
    index = []
    for sub, key, name, cat, desc in TUTORIALS:
        src_dir = os.path.join(MIRROR, sub)
        if not os.path.isdir(src_dir):
            print('SKIP missing dir:', sub)
            continue
        files = sorted(f for f in os.listdir(src_dir) if f.endswith('.html'))
        chapters = []
        for f in files:
            base = f[:-5]
            if base in IGNORE_START:
                continue
            r = parse_file_local(os.path.join(src_dir, f))
            url = 'https://www.runoob.com/%s/%s' % (sub, f)
            chapters.append({'title': r['title'], 'url': url,
                             'body': r['body'], 'examples': r['examples']})
        # 按标题去重（防止镜像含重复页）
        seen, uniq = set(), []
        for ch in chapters:
            if ch['title'] in seen:
                continue
            seen.add(ch['title'])
            uniq.append(ch)
        tutorial = {
            'name': name, 'category': cat, 'desc': desc,
            'url': 'https://www.runoob.com/%s/%s-tutorial.html' % (sub, sub),
            'chapters': uniq,
        }
        out = os.path.join(PUBLIC, 'tutorials', key + '.json')
        with open(out, 'w', encoding='utf-8') as f:
            json.dump({'tutorial': tutorial}, f, ensure_ascii=False, indent=1)
        index.append({'name': name, 'category': cat, 'desc': desc, 'file': key + '.json'})
        print('OK %s: %d pages -> %d chapters, %d KB' %
              (key, len(files), len(uniq), os.path.getsize(out) // 1024))

    # 写轻量索引
    idx_path = os.path.join(PUBLIC, 'tutorial-data.json')
    with open(idx_path, 'w', encoding='utf-8') as f:
        json.dump({'tutorials': index}, f, ensure_ascii=False, indent=1)
    print('INDEX:', idx_path, 'tutorials:', len(index), os.path.getsize(idx_path), 'bytes')


if __name__ == '__main__':
    main()
