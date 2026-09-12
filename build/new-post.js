// npm run post "Some title"  ->  content/posts/some-title.md, dated today.
// Exists so the daily habit is one command and the front matter is never typed
// from memory. The build validates what this scaffolds; both are needed.

import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { CATEGORIES } from './site.js';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('usage: npm run post "The title of the post"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const path = resolve(import.meta.dirname, '..', 'content/posts', `${slug}.md`);
if (existsSync(path)) {
  console.error(`content/posts/${slug}.md already exists`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

writeFileSync(
  path,
  `---
title: ${title}
description:
ogTitle:
ogDescription:
date: ${today}
category:
# category must be one of: ${Object.keys(CATEGORIES).join(' | ')}
# sources: one per line, "tier | publisher | date | title | url"
# tier is primary (the regulator, vendor, paper or survey itself)
#      or reported (a named outlet reporting a fact first)
sources:
  - primary |  | ${today} |  | https://
---

Lead with the development and why it matters, in one paragraph a busy reader
could stop after. Attribute inline: according to the FCA's June 2026 guidance.

## Then the detail

## What to do about it
`
);

console.log(`content/posts/${slug}.md`);
