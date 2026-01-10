#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const MIN_CONTENT_CHARS = 3000;

const loadEnvFile = (envPath) => {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
};

const loadEnv = () => {
  const cwd = process.cwd();
  loadEnvFile(path.join(cwd, '.env'));
  loadEnvFile(path.join(cwd, '.env.local'));
};

const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix));
  if (raw) return raw.slice(prefix.length);
  return fallback;
};

loadEnv();

const tone = getArg('tone', process.env.BLOG_TONE || '프로페셔널');
const target = getArg('target', process.env.BLOG_TARGET || '예비 창업자');
const topicArg = getArg('topic', process.env.BLOG_TOPIC || '');
const keywordsArg = getArg('keywords', process.env.BLOG_KEYWORDS || '');
const seoFocusArg = getArg('seo-focus', process.env.BLOG_SEO_FOCUS || '');
const autoTopic = getArg('auto-topic', process.env.BLOG_AUTO_TOPIC || 'true') !== 'false';

const geminiKey = process.env.GEMINI_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!geminiKey) {
  console.error('GEMINI_API_KEY가 없습니다.');
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const buildTopicPrompt = () => `
너는 케이터링/요식업 블로그 기획자다.

타겟: ${target}
톤: ${tone}

아래 조건으로 주제 5개를 제안해.
- 한국어 주제
- 각 주제마다 키워드 3~6개
- 검색 수요 점수(search_score) 1~100
- 검색 의도에 맞는 SEO 포커스 1~2개

반드시 JSON만 출력.

{
  "topics": [
    {
      "topic": "주제1",
      "keywords": ["키워드1", "키워드2"],
      "seoFocus": "핵심 키워드",
      "search_score": 85
    }
  ]
}
`.trim();

const buildPrompt = (topic, keywords, seoFocus) => `
너는 케이터링/요식업 전문 블로그 에디터다.

## 타겟 독자
- 타겟: ${target}

## 톤 & 문체
- ${tone}

## 필수 조건
- 최소 ${MIN_CONTENT_CHARS}자 이상
- 키워드를 자연스럽게 포함
- JSON만 출력

## 입력 정보
- 주제: ${topic}
- 키워드: ${keywords}
- SEO 포커스: ${seoFocus}

## HTML 스타일
h1: class="text-3xl font-bold text-gray-900 mb-6"
h2: class="text-2xl font-bold text-gray-800 mt-10 mb-4 border-b-2 border-purple-500 pb-2"
h3: class="text-xl font-semibold text-gray-800 mt-6 mb-3"
p: class="text-base text-gray-700 leading-relaxed mb-4"

JSON:
{
  "title": "string",
  "excerpt": "string (150자)",
  "meta_description": "string (155자, 키워드 포함)",
  "tags": ["string"],
  "content_html": "string",
  "image_alt": "string"
}
`.trim();

const extractJson = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('JSON 추출 실패');
  return JSON.parse(match[0]);
};

const callGeminiJson = async (prompt) => {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('');
      if (!text) throw new Error('빈 응답');
      return extractJson(text);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Gemini 호출 실패');
};

const stripHtml = (html) => html.replace(/<[^>]*>/g, ' ');

const calculateSeoScore = (html, metaDesc, keywordsText) => {
  const keywordArray = keywordsText.split(',').map((k) => k.trim()).filter(Boolean);
  const textContent = stripHtml(html).toLowerCase();

  let keywordCount = 0;
  keywordArray.forEach((kw) => {
    const regex = new RegExp(kw, 'gi');
    const matches = textContent.match(regex);
    if (matches) keywordCount += matches.length;
  });

  return {
    hasH1: /<h1[^>]*>/i.test(html),
    hasH2: /<h2[^>]*>/i.test(html),
    hasFAQ: /faq|자주\s*묻는\s*질문/i.test(html),
    hasMetaDesc: (metaDesc || '').length >= 50 && (metaDesc || '').length <= 160,
    keywordCount,
    contentLength: stripHtml(html).length,
  };
};

const buildThreadText = (content) => {
  const hashtags = (content.tags || [])
    .map((tag) => `#${String(tag).replace(/\s+/g, '')}`)
    .join(' ');
  const lines = [
    `[1/3] ${content.title}`,
    content.excerpt,
    '자세히 보기: (발행 후 URL 입력)',
  ];
  if (hashtags) lines.push(hashtags);
  return lines.join('\n\n');
};

const main = async () => {
  let topic = topicArg;
  let keywords = keywordsArg;
  let seoFocus = seoFocusArg;

  if (autoTopic || !topic) {
    const topicResult = await callGeminiJson(buildTopicPrompt());
    const topics = Array.isArray(topicResult.topics) ? topicResult.topics : [];
    if (!topics.length) {
      throw new Error('주제 추천 결과가 없습니다.');
    }
    topics.sort((a, b) => {
      const scoreA = Number(a.search_score || 0);
      const scoreB = Number(b.search_score || 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.keywords?.length || 0) - (a.keywords?.length || 0);
    });
    const selected = topics[0];
    topic = selected.topic;
    keywords = Array.isArray(selected.keywords) ? selected.keywords.join(', ') : '';
    seoFocus = selected.seoFocus || '';
    console.log('선정된 주제:', topic);
  }

  if (!topic || !keywords) {
    throw new Error('주제/키워드가 없습니다.');
  }

  const prompt = buildPrompt(topic, keywords, seoFocus);

  const result = await callGeminiJson(prompt);

  const contentHtml = result.content_html || '';
  const contentLength = stripHtml(contentHtml).length;
  if (contentLength < MIN_CONTENT_CHARS) {
    throw new Error(`본문 길이가 ${MIN_CONTENT_CHARS}자 미만입니다. (${contentLength}자)`);
  }

  const seoScore = calculateSeoScore(contentHtml, result.meta_description || '', keywords);

  const payload = {
    title: result.title,
    excerpt: result.excerpt,
    content_html: contentHtml,
    meta_description: result.meta_description,
    image_url: '',
    author: 'Auto Generator',
    tags: result.tags || [],
    seo_score: seoScore,
    status: 'pending_review',
    thread_text: buildThreadText({
      ...result,
      tags: result.tags || [],
      title: result.title,
      excerpt: result.excerpt,
    }),
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('publish_queue').insert([payload]);
  if (error) throw error;

  console.log('검수 큐 저장 완료:', payload.title);
};

main().catch((error) => {
  console.error('자동 생성 실패:', error.message || error);
  process.exit(1);
});
