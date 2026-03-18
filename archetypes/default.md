---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
description: ""
date: {{ .Date }}
author: ""
author_bio: ""
section: "{{ .File.Dir | path.Dir | path.Base }}"
hero_image: ""
hero_video: ""
featured: false
breaking: false
read_time: 5
location: ""
tags: []
---

Lead paragraph — the most important information first (who, what, when, where, why).

## Section Heading

Body paragraph.

## Another Section

More content.
