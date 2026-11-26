---
date: "2026-11-25"
kind: "read"
title: "VideoJSON: A Minimal Harness Beats Purpose-Built Memory for Ultra-Long Video Understanding"
url: "https://arxiv.org/abs/2611.28167"
canonicalSourceUrl: "https://arxiv.org/abs/2611.28167"
publishedAt: "2026-11-20"
author: "Wenqi Marshall Guo, Kuan-Hao Huang, Junda Chen, Hao Zhang"
source: "arXiv.org"
description: "Answering questions over days or weeks of video requires searching for scattered clues across long timelines. Existing video agents rely on complex"
category: "agents"
contentType: "article"
tags: ["agents","evals","rag"]
image: "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png"
generation: "fallback"
indexable: true
retryCount: 1
lastRetryAt: "2026-11-26T17:41:08.838Z"
modifiedAt: "2026-11-26T17:41:08.838Z"
---

Answering questions over days or weeks of video requires searching for scattered clues across long timelines. Existing video agents rely on complex memory graphs and fixed retrieval pipelines, which restrict how the agent can search. We propose VideoJSON, a minimal harness for ultra-long video understanding that keeps the memory simple and lets a coding agent write its own search programs. During indexing, a vision-language model turns each minute of video into a single JSON record containing a dense caption and structured fields such as events, entities, places, and speech transcripts. At query time, the agent writes Python or Bash programs in a sandboxed container to filter, link, and read these records over multiple steps, without task-specific training or raw video access.
