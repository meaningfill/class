import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

interface PublishQueueItem {
  id: string;
  source_post_id?: string | null;
  title: string;
  excerpt: string;
  content_html: string;
  meta_description: string | null;
  image_url: string | null;
  author: string | null;
  tags: string[] | null;
  seo_score: {
    hasH1: boolean;
    hasH2: boolean;
    hasFAQ: boolean;
    hasMetaDesc: boolean;
    keywordCount: number;
    contentLength: number;
  } | null;
  status: string;
  thread_text: string | null;
  created_at: string;
  published_at: string | null;
}

const GEMINI_API_KEY = import.meta.env.VITE_API_KEY as string | undefined;
const GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-2.0-flash';
const USE_IMAGEN = (import.meta.env.VITE_USE_IMAGEN as string | undefined) === 'true';
const MIN_CONTENT_CHARS = 3000;

const buildSlug = (title: string) => title
  .toLowerCase()
  .replace(/[^a-z0-9가-힣\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim();

const extractJson = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('JSON 추출 실패');
  return JSON.parse(match[0]);
};

const callGeminiJson = async (prompt: string) => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI API 키가 없습니다.');
  }

  const models = [GEMINI_MODEL, 'gemini-1.5-flash'];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('');
      if (!text) throw new Error('빈 응답');
      return extractJson(text);
    } catch (error: any) {
      lastError = error;
    }
  }

  throw lastError || new Error('Gemini 호출 실패');
};

const uploadBase64Image = async (base64Data: string): Promise<string> => {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    const fileName = `gemini-${Date.now()}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file, { upsert: true, contentType: 'image/png' });

    if (uploadError) {
      return `data:image/png;base64,${base64Data}`;
    }

    const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    return `data:image/png;base64,${base64Data}`;
  }
};

const generateImageWithGemini = async (prompt: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error('API 키가 설정되지 않았습니다.');
  }

  if (USE_IMAGEN) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: '16:9',
              personGeneration: 'dont_allow',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const base64Image = data?.predictions?.[0]?.bytesBase64Encoded;
        if (base64Image) {
          return await uploadBase64Image(base64Image);
        }
      }
    } catch (e) {
      console.log('Imagen 3 실패, 다른 방법 시도...');
    }
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate image: ${prompt}` }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          return await uploadBase64Image(part.inlineData.data);
        }
      }
    }
  } catch (e) {
    console.log('Flash 이미지 생성 실패');
  }

  throw new Error('이미지 생성 실패');
};

const generateTextFreeImage = async (prompt: string): Promise<string> => {
  let firstUrl = '';
  try {
    firstUrl = await generateImageWithGemini(prompt);
  } catch (error) {
    console.error('이미지 1차 생성 실패:', error);
  }

  const retryPrompt = `${prompt}, ultra-clean background, no menu cards, no signs, no writing, no letters, no digits`;
  try {
    const retryUrl = await generateImageWithGemini(retryPrompt);
    return retryUrl || firstUrl;
  } catch (error) {
    console.error('이미지 2차 생성 실패:', error);
    return firstUrl;
  }
};

const buildTopicPrompt = () => `
너는 케이터링/요식업 블로그 기획자다.

타겟: 케이터링 창업 준비자
톤: 전문적

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

const buildArticlePrompt = (topic: string, keywords: string, seoFocus: string) => `
너는 케이터링/요식업 전문 블로그 에디터다.

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
ul: class="list-disc pl-6 my-6 text-gray-700"
li: class="mb-2"

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

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ');

const calculateSeoScore = (html: string, metaDesc: string, keywordsText: string) => {
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
    hasMetaDesc: metaDesc.length >= 50 && metaDesc.length <= 160,
    keywordCount,
    contentLength: stripHtml(html).length,
  };
};

const buildThreadText = (content: { title: string; excerpt: string; tags: string[] }) => {
  const hashtags = (content.tags || []).map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' ');
  const lines = [
    `[1/10] ${content.title}`,
    `[2/10] 한 줄 요약\n${content.excerpt}`,
    '[3/10] 왜 중요한가\n실무에서 바로 쓰는 핵심 포인트를 요약했습니다.',
    '[4/10] 핵심 프레임워크\n문제 정의 → 원인 분석 → 실행 체크리스트 순서로 풀어갑니다.',
    '[5/10] 실행 체크 1\n시작에 필요한 기본 설정과 기준을 제시합니다.',
    '[6/10] 실행 체크 2\n효율을 높이는 운영 팁과 실수 방지 포인트를 담았습니다.',
    '[7/10] 현장 인사이트\n많이 놓치는 포인트를 짚고 해결 방향을 제시합니다.',
    '[8/10] 요약 정리\n안정성 + 효율 + 품질을 동시에 개선하는 방법입니다.',
    '[9/10] 실무 적용 팁\n짧은 룰과 루틴으로 정착시키면 유지가 쉽습니다.',
    '[10/10] 자세히 보기: (발행 후 URL 입력)',
  ];
  if (hashtags) lines.push(hashtags);
  return lines.join('\n\n');
};

export default function AdminPublishQueue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PublishQueueItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [autoGenerating, setAutoGenerating] = useState(false);

  useEffect(() => {
    checkUser();
    loadQueue();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('관리자 확인 실패:', error);
      navigate('/admin/login');
    }
  };

  const loadQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('publish_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems((data || []) as PublishQueueItem[]);
    } catch (error) {
      console.error('큐 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyThread = async (text: string | null) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    alert('스레드 글이 복사되었습니다.');
  };

  const handleApprovePublish = async (item: PublishQueueItem) => {
    try {
      const siteUrl = import.meta.env.VITE_SITE_URL || 'https://example.com';
      const threadText = (item.thread_text || '');
      let threadWithUrl = threadText;

      if (item.source_post_id) {
        threadWithUrl = threadText.replace(
          '자세히 보기: (발행 후 URL 입력)',
          `자세히 보기: ${siteUrl}/blog/${item.source_post_id}`
        );

        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({
            content: item.content_html,
            excerpt: item.excerpt,
          })
          .eq('id', item.source_post_id);

        if (updateError) throw updateError;
      } else {
        const slug = `${buildSlug(item.title)}-${Date.now()}`;
        threadWithUrl = threadText.replace(
          '자세히 보기: (발행 후 URL 입력)',
          `자세히 보기: ${siteUrl}/blog/${slug}`
        );

        const { error: insertError } = await supabase.from('blog_posts').insert([
          {
            title: item.title,
            slug,
            excerpt: item.excerpt,
            content: item.content_html,
            image_url: item.image_url || '',
            author: 'Master',
            published_at: new Date().toISOString(),
          }
        ]);

        if (insertError) throw insertError;
      }

      const { error: updateError } = await supabase
        .from('publish_queue')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          thread_text: threadWithUrl,
        })
        .eq('id', item.id);

      if (updateError) throw updateError;

      alert('블로그가 발행되었습니다.');
      loadQueue();
    } catch (error) {
      console.error('발행 실패:', error);
      alert('발행에 실패했습니다.');
    }
  };

  const handleAutoGenerate = async () => {
    if (autoGenerating) return;
    setAutoGenerating(true);

    try {
      const topicResult = await callGeminiJson(buildTopicPrompt());
      const topics = Array.isArray(topicResult.topics) ? topicResult.topics : [];
      if (!topics.length) {
        throw new Error('주제 추천 결과가 없습니다.');
      }
      topics.sort((a: { search_score?: number; keywords?: string[] }, b: { search_score?: number; keywords?: string[] }) => {
        const scoreA = Number(a.search_score || 0);
        const scoreB = Number(b.search_score || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.keywords?.length || 0) - (a.keywords?.length || 0);
      });
      const selected = topics[0];
      const topic = selected.topic;
      const keywords = Array.isArray(selected.keywords) ? selected.keywords.join(', ') : '';
      const seoFocus = selected.seoFocus || '';

      if (!topic || !keywords) {
        throw new Error('주제/키워드가 없습니다.');
      }

      const article = await callGeminiJson(buildArticlePrompt(topic, keywords, seoFocus));
      const contentHtml = article.content_html || '';
      const contentLength = stripHtml(contentHtml).length;
      if (contentLength < MIN_CONTENT_CHARS) {
        throw new Error(`본문 길이가 ${MIN_CONTENT_CHARS}자 미만입니다. (${contentLength}자)`);
      }

      const seoScore = calculateSeoScore(contentHtml, article.meta_description || '', keywords);
      let imageUrl = '';
      try {
        const imageSubject = article.image_alt || topic;
        const imagePrompt = `Ultra-realistic food photography of ${imageSubject}, editorial catering spread, natural light, shallow depth of field, clean background, no text, no typography, no letters, no numbers, no watermark, no logo, no packaging labels, no signage, no brand marks, no words, no menu cards, no signs, no writing`;
        imageUrl = await generateTextFreeImage(imagePrompt);
      } catch (error) {
        console.error('이미지 생성 실패:', error);
      }
      const payload = {
        title: article.title,
        excerpt: article.excerpt,
        content_html: contentHtml,
        meta_description: article.meta_description,
        image_url: imageUrl,
        author: 'Master',
        tags: article.tags || [],
        seo_score: seoScore,
        status: 'pending_review',
        thread_text: buildThreadText({
          title: article.title,
          excerpt: article.excerpt,
          tags: article.tags || [],
        }),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('publish_queue').insert([payload]);
      if (error) throw error;

      await loadQueue();
    } catch (error: any) {
      console.error('자동 생성 실패:', error);
      alert(error.message || '자동 생성 실패');
    } finally {
      setAutoGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-amber-600 animate-spin"></i>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-file-list-3-line text-xl text-white"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">발행 검수 큐</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAutoGenerate}
                disabled={autoGenerating}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                {autoGenerating ? '자동 생성 중...' : '원클릭 자동 생성'}
              </button>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                대시보드로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
            아직 검수 대기 중인 글이 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString('ko-KR')}</p>
                      <h2 className="text-xl font-bold text-gray-900 mt-2">{item.title}</h2>
                      <p className="text-sm text-gray-600 mt-2">{item.excerpt}</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                      {item.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold"
                    >
                      {expandedId === item.id ? '검수 접기' : '검수 보기'}
                    </button>
                    <button
                      onClick={() => handleApprovePublish(item)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold shadow-sm"
                    >
                      블로그 발행 승인
                    </button>
                    <button
                      onClick={() => handleCopyThread(item.thread_text)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold"
                    >
                      스레드 글 복사
                    </button>
                    <button
                      onClick={() => navigate(`/admin/blog-ai`)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm"
                    >
                      새 글 생성
                    </button>
                  </div>

                  {expandedId === item.id && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                      <div className="text-sm text-gray-700">
                        <strong className="text-gray-900">메타 설명:</strong> {item.meta_description || '없음'}
                      </div>
                      <div className="text-sm text-gray-700">
                        <strong className="text-gray-900">태그:</strong> {item.tags?.join(', ') || '없음'}
                      </div>
                      {item.image_url && (
                        <div className="w-full h-52 rounded-lg overflow-hidden">
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {item.seo_score && (
                        <div className="p-3 rounded-lg border border-green-200 bg-white text-xs text-gray-700">
                          <div className="grid grid-cols-2 gap-2">
                            <div>H1: {item.seo_score.hasH1 ? '있음' : '없음'}</div>
                            <div>H2: {item.seo_score.hasH2 ? '있음' : '없음'}</div>
                            <div>FAQ: {item.seo_score.hasFAQ ? '있음' : '없음'}</div>
                            <div>메타: {item.seo_score.hasMetaDesc ? '있음' : '없음'}</div>
                            <div>키워드: {item.seo_score.keywordCount}회</div>
                            <div>길이: {item.seo_score.contentLength.toLocaleString()}자</div>
                          </div>
                        </div>
                      )}
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-xs text-gray-400 mb-2">본문 미리보기</div>
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.content_html }}
                        />
                      </div>
                      {item.thread_text && (
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <div className="text-xs text-gray-400 mb-2">스레드 원고</div>
                          <pre className="whitespace-pre-wrap text-sm text-gray-700">{item.thread_text}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
