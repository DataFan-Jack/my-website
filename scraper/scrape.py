# -*- coding: utf-8 -*-
"""
菜鸟教程爬虫 —— 本地学习 Demo
演示完整链路：抓取目录 -> 抓取章节 -> 解析 -> 存 JSON
边界（请遵守）：
  1. 尊重 robots.txt（不访问被禁路径）
  2. 限速抓取（每请求间隔 1 秒），不打扰目标网站
  3. 只抓少量页面（前 30 章），不整站
  4. 内容仅用于本地学习，不得公开发布
运行：.venv\\Scripts\\python.exe scrape.py
"""
import json
import time
import requests
from bs4 import BeautifulSoup

BASE = "https://www.runoob.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.9",
}
SLEEP = 1  # 请求间隔（秒）
MAX_CHAPTERS = 30  # 每个教程最多抓的章节数（测试目录滚动用）

# 要抓的教程（本地学习 demo，限少量）
TUTORIALS = [
    {"name": "HTML 教程", "category": "前端开发", "desc": "从零开始学 HTML，搭建网页基础结构。",
     "url": f"{BASE}/html/html-tutorial.html"},
    {"name": "CSS 教程", "category": "前端开发", "desc": "用 CSS 美化网页，掌握布局与样式。",
     "url": f"{BASE}/css/css-tutorial.html"},
    {"name": "JavaScript 教程", "category": "前端开发", "desc": "前端脚本语言，实现网页交互与动态效果。",
     "url": f"{BASE}/js/js-tutorial.html"},
]


def get(url):
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    time.sleep(SLEEP)  # 限速
    return resp.text


def parse_toc(html):
    """解析章节目录 -> [{title, url}]"""
    soup = BeautifulSoup(html, "html.parser")
    links = soup.select('a[data-p="par"]')
    return [{"title": a.get("title", "").strip(), "url": BASE + a["href"]} for a in links]


def parse_article(html):
    """解析正文 -> {title, body, examples}"""
    soup = BeautifulSoup(html, "html.parser")
    content = soup.select_one(".article-intro") or soup.select_one("#content")
    if not content:
        return None
    h1 = content.find("h1")
    title = h1.get_text(" ", strip=True) if h1 else ""
    body = "\n".join(p.get_text(" ", strip=True) for p in content.find_all("p"))
    examples = [pre.get_text() for pre in content.select(".example_code .hl-main")]
    return {"title": title, "body": body, "examples": examples}


def main():
    data = {"tutorials": []}
    for conf in TUTORIALS:
        print(f"[1/3] 抓取目录页: {conf['url']}")
        try:
            chapters = parse_toc(get(conf["url"]))
        except Exception as e:
            print(f"      目录页失败，跳过（{e}）")
            continue
        print(f"      目录共 {len(chapters)} 章，演示只取前 {MAX_CHAPTERS} 章")

        tutorial = {**conf, "chapters": []}
        for i, ch in enumerate(chapters[:MAX_CHAPTERS], 1):
            print(f"[2/3] 抓取章节 {i}/{min(len(chapters), MAX_CHAPTERS)}: {ch['title']}")
            try:
                article = parse_article(get(ch["url"]))
                if article:
                    tutorial["chapters"].append({**ch, **article})
            except Exception as e:
                print(f"      跳过（{e}）")
        data["tutorials"].append(tutorial)

    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[3/3] 完成：{len(data['tutorials'])} 个教程已保存到 data.json")


if __name__ == "__main__":
    main()
