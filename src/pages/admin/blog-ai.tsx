import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

interface BlogGenerationForm {
  topic: string;
  keywords: string;
  targetAudience: string;
  tone: string;
  includeImages: boolean;
  seoFocus: string;
  referenceLinks: string;
  imageStyle: string;
}

interface TopicSuggestion {
  topic: string;
  keywords: string[];
  seoFocus: string;
  angle: string;
}

interface GeneratedBlogContent {
  title: string;
  excerpt: string;
  content_html: string;
  meta_description: string;
  tags: string[];
  image_alt: string;
  image_url: string;
  author: string;
  sources_used: string[];
  seo_score?: {
    hasH1: boolean;
    hasH2: boolean;
    hasFAQ: boolean;
    hasMetaDesc: boolean;
    keywordCount: number;
    contentLength: number;
  };
}

const GEMINI_API_KEY = import.meta.env.VITE_API_KEY as string | undefined;
const GOOGLE_CSE_API_KEY = import.meta.env.VITE_GOOGLE_CSE_API_KEY as string | undefined;
const GOOGLE_CSE_CX = import.meta.env.VITE_GOOGLE_CSE_CX as string | undefined;
const GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-2.0-flash';
const USE_IMAGEN = (import.meta.env.VITE_USE_IMAGEN as string | undefined) === 'true';
const MIN_CONTENT_CHARS = 3000;
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://orderbuilder.co.kr';

// ============================================
// 톤 가이드 상세 정의
// ============================================
const TONE_GUIDES: Record<string, { label: string; description: string; prompt: string }> = {
  friendly: {
    label: '친근한',
    description: '독자에게 말 걸듯이, 따뜻하고 편안한 느낌',
    prompt: `
- 문체: ~요, ~해요 체 사용 (반말 금지)
- 독자에게 직접 말 걸듯이 작성 ("여러분", "혹시 ~하신 적 있으신가요?")
- 공감 표현 자주 사용 ("막막하시죠?", "저도 처음엔 그랬어요")
- 어려운 용어는 쉽게 풀어서 설명
- 문장은 짧고 리듬감 있게
- 이모지 사용 금지, 하지만 따뜻한 톤 유지
`,
  },
  professional: {
    label: '전문적인',
    description: '데이터 기반, 신뢰감 있는 전문가 톤',
    prompt: `
- 문체: ~습니다, ~합니다 체 사용
- 객관적인 데이터, 통계, 사례 인용 필수
- 업계 용어 사용하되 필요시 괄호로 설명 추가
- 단정적 표현 사용 ("~입니다", "~해야 합니다")
- 논리적 흐름 (문제 → 원인 → 해결책 → 결론)
- 감정적 표현 최소화
`,
  },
  educational: {
    label: '교육적인',
    description: '단계별 설명, 초보자도 쉽게 이해',
    prompt: `
- 문체: ~요 체, 친절한 선생님처럼
- 복잡한 내용은 단계별로 나눠서 설명 (1단계, 2단계...)
- 예시를 많이 들어 설명 ("예를 들어", "쉽게 말하면")
- 핵심 포인트는 강조 ("중요!", "꼭 기억하세요")
- 초보자 눈높이에 맞춰 전문용어 최소화
- 실습/적용 가능한 팁 포함
`,
  },
  inspirational: {
    label: '영감을 주는',
    description: '동기부여, 도전 의식을 불러일으키는',
    prompt: `
- 문체: ~요 체, 에너지 넘치게
- 성공 스토리, 실제 사례 중심
- 독자의 가능성을 믿어주는 표현 ("할 수 있어요", "시작이 반이에요")
- 구체적인 비전 제시 ("6개월 후에는...")
- 작은 성공에서 큰 성공으로 이어지는 스토리라인
- 행동을 촉구하는 마무리 ("지금 바로 시작해보세요!")
`,
  },
};

// ============================================
// 타겟 오디언스 정의
// ============================================
const TARGET_AUDIENCES: Record<string, { label: string; description: string; seoKeywords: string[] }> = {
  catering_starter: {
    label: '케이터링 창업 준비자',
    description: '케이터링 사업을 시작하려는 예비 창업자',
    seoKeywords: ['케이터링 창업', '케이터링 사업', '출장 요리 창업', '케이터링 시작'],
  },
  cafe_owner: {
    label: '카페/베이커리 운영자',
    description: '카페나 베이커리를 운영 중이거나 준비하는 분',
    seoKeywords: ['카페 창업', '베이커리 운영', '카페 메뉴 개발', '디저트 사업'],
  },
  small_capital: {
    label: '소자본 창업자',
    description: '적은 자본으로 요식업 창업을 준비하는 분',
    seoKeywords: ['소자본 창업', '1인 창업', '저비용 창업', '홈베이킹 창업'],
  },
  female_entrepreneur: {
    label: '여성 창업자',
    description: '여성 특화 창업, 워라밸 중시하는 창업자',
    seoKeywords: ['여성 창업', '엄마 창업', '재택 창업', '부업 창업'],
  },
  food_business: {
    label: '외식업 종사자',
    description: '외식업계에서 일하며 독립을 준비하는 분',
    seoKeywords: ['외식업 창업', '요식업 사업', '메뉴 개발', '주방 운영'],
  },
};

const normalizeLinks = (raw: string) => raw
  .split(/[\n,]+/)
  .map((item) => item.trim())
  .filter((item) => item.length > 0)
  .filter((item) => /^https?:\/\//i.test(item));

const extractLinksFromHtml = (html: string) => {
  const links: string[] = [];
  const regex = /href\s*=\s*"([^"]+)"/gi;
  let match = regex.exec(html);
  while (match) {
    links.push(match[1]);
    match = regex.exec(html);
  }
  return links;
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ensureFigure = (html: string, imageUrl: string, altText: string) => {
  if (html.includes('{{IMAGE_URL}}')) {
    return html
      .replace(/{{IMAGE_URL}}/g, imageUrl)
      .replace(/{{IMAGE_ALT}}/g, altText);
  }

  if (html.match(/<img\s/i)) {
    return html;
  }

  const figure = `
<figure class="my-8 rounded-2xl overflow-hidden shadow-lg">
  <img src="${imageUrl}" alt="${altText}" class="w-full h-[360px] object-cover" />
  <figcaption class="bg-gray-50 px-4 py-3 text-sm text-gray-600">
    ${altText}
  </figcaption>
</figure>
`.trim();

  return html.replace(/<article[^>]*>/i, (match) => `${match}\n${figure}\n`);
};

const removeCoverFigure = (html: string, imageUrl?: string) => {
  let next = html;
  if (imageUrl) {
    const escapedUrl = escapeRegExp(imageUrl);
    const figureWithImage = new RegExp(
      `<figure[^>]*>[\\s\\S]*?<img[^>]*src=["']${escapedUrl}["'][\\s\\S]*?<\\/figure>`,
      'i'
    );
    next = next.replace(figureWithImage, '');
  }
  next = next.replace(/<figure[^>]*data-role=["']cover["'][\s\S]*?<\/figure>/gi, '');
  next = next.replace(/<figure[^>]*class=["'][^"']*my-8[^"']*["'][\s\S]*?<\/figure>/gi, '');
  next = next.replace(/<figure[^>]*>[\s\S]*?<img[^>]*src=["']{{IMAGE_URL}}["'][\s\S]*?<\/figure>/gi, '');
  next = next.replace(/<img[^>]*src=["']{{IMAGE_URL}}["'][^>]*>/gi, '');
  next = next.replace(/<figure[^>]*>[\s\S]*?<img[^>]*src=["']https?:\/\/via\.placeholder\.com\/[^"']+["'][\s\S]*?<\/figure>/gi, '');
  next = next.replace(/<img[^>]*src=["']https?:\/\/via\.placeholder\.com\/[^"']+["'][^>]*>/gi, '');
  return next;
};

const normalizeInlineImages = (html: string, imageUrl: string, altText: string) => {
  return html.replace(/<img\b([^>]*?)>/gi, (match, attrs) => {
    const withoutSrcAlt = attrs
      .replace(/\s+src=["'][^"']*["']/i, '')
      .replace(/\s+alt=["'][^"']*["']/i, '')
      .replace(/\s+class=["'][^"']*["']/i, '');
    const sizeClass = 'w-full h-[360px] object-cover';
    return `<img${withoutSrcAlt} class="${sizeClass}" src="${imageUrl}" alt="${altText}">`;
  });
};

const buildSlug = (title: string) => title
  .toLowerCase()
  .replace(/[^a-z0-9가-힣\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim();
const buildThreadText = (content: GeneratedBlogContent) => {
  const hashtags = (content.tags || [])
    .map(tag => `#${tag.replace(/\s+/g, '')}`)
    .join(' ');
  const lines = [
    `[1/10] ${content.title}`,
    `[2/10] 한 줄 요약\n${content.excerpt}`,
    '[3/10] 왜 중요한가\n현장에서 바로 성과로 이어지는 핵심 포인트를 정리했습니다.',
    '[4/10] 핵심 프레임워크\n문제를 정의 → 원인 파악 → 실행 체크리스트 순서로 접근합니다.',
    '[5/10] 실행 체크 1\n지금 바로 적용 가능한 1차 액션을 제안합니다.',
    '[6/10] 실행 체크 2\n효율을 올리는 운영 팁과 실수 방지 포인트를 담았습니다.',
    '[7/10] 케이스 인사이트\n실제 상황에서 자주 놓치는 지점을 짚었습니다.',
    '[8/10] 요약 정리\n핵심만 다시 정리하면, 안정성 + 효율 + 품질이 동시에 개선됩니다.',
    '[9/10] 실무 적용 팁\n팀과 공유 가능한 짧은 규칙/루틴으로 만들면 유지가 쉽습니다.',
    '[10/10] 자세히 보기: (발행 후 URL 입력)',
  ];
  if (hashtags) {
    lines.push(hashtags);
  }
  return lines.join('\n\n');
};

const calculateSeoScore = (html: string, metaDesc: string, keywords: string) => {
  const keywordArray = keywords.split(',').map(k => k.trim().toLowerCase());
  const textContent = stripHtml(html).toLowerCase();
  
  let keywordCount = 0;
  keywordArray.forEach(kw => {
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

export default function AIBlogGenerator() {
  const [user, setUser] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedBlogContent | null>(null);
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<GeneratedBlogContent | null>(null);

  const [formData, setFormData] = useState<BlogGenerationForm>({
    topic: '',
    keywords: '',
    targetAudience: 'catering_starter',
    tone: 'friendly',
    includeImages: true,
    seoFocus: '',
    referenceLinks: '',
    imageStyle: 'photo-realistic, natural light, editorial food photography',
  });
  const navigate = useNavigate();

  const userReferenceLinks = useMemo(
    () => normalizeLinks(formData.referenceLinks),
    [formData.referenceLinks]
  );

  useEffect(() => {
    checkUser();
  }, []);

  // 타겟 변경 시 SEO 키워드 자동 추천
  useEffect(() => {
    const target = TARGET_AUDIENCES[formData.targetAudience];
    if (target && !formData.seoFocus) {
      setFormData(prev => ({
        ...prev,
        seoFocus: target.seoKeywords.slice(0, 3).join(', '),
      }));
    }
  }, [formData.targetAudience]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
      } else {
        setUser(user);
      }
    } catch (error) {
      console.error('사용자 확인 실패:', error);
      navigate('/admin/login');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const callGeminiJson = async (prompt: string) => {
    if (!GEMINI_API_KEY) {
      throw new Error('VITE_API_KEY가 설정되지 않았습니다.');
    }

    const modelsToTry = Array.from(new Set([
      GEMINI_MODEL,
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ].filter(Boolean)));

    let lastError: string | null = null;

    for (const model of modelsToTry) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              top_p: 0.9,
              max_output_tokens: 8192,
              response_mime_type: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        lastError = `Gemini 호출 실패 (${response.status}): ${text}`;
        if (response.status === 404 && model !== modelsToTry[modelsToTry.length - 1]) {
          continue;
        }
        throw new Error(lastError);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Gemini 응답이 비어 있습니다.');
      }
      return JSON.parse(text);
    }

    throw new Error(lastError || 'Gemini 호출 실패');
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

  const generateKeywordsFromTopic = async () => {
    if (!formData.topic.trim()) {
      alert('먼저 블로그 주제를 입력해주세요.');
      return;
    }

    setIsGeneratingKeywords(true);
    try {
      const targetInfo = TARGET_AUDIENCES[formData.targetAudience];
      const result = await callGeminiJson(`
블로그 주제: "${formData.topic}"
타겟 독자: ${targetInfo.label} (${targetInfo.description})

이 주제와 타겟에 맞는 SEO 최적화 키워드를 생성해줘.
조건:
- 한국어 키워드
- 타겟 독자가 실제로 검색할 만한 키워드
- 롱테일 키워드 포함
- 5~8개

JSON:
{
  "keywords": ["키워드1", "키워드2"],
  "seoFocus": "핵심 SEO 키워드 1~2개"
}
`);
      
      setFormData(prev => ({
        ...prev,
        keywords: result.keywords?.join(', ') || '',
        seoFocus: result.seoFocus || '',
      }));
    } catch (error) {
      console.error('키워드 생성 실패:', error);
      alert('키워드 생성에 실패했습니다.');
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const buildSuggestionPrompt = () => {
    const targetInfo = TARGET_AUDIENCES[formData.targetAudience];
    return `너는 블로그 주제 추천 전문가야.

"${targetInfo.label}" (${targetInfo.description})를 위한 블로그 주제 5개를 추천해.

반드시 아래 JSON 형식으로만 응답해. 다른 텍스트 없이 JSON만 출력해.

{"topics":[{"topic":"주제1","keywords":["키워드1","키워드2","키워드3"],"seoFocus":"핵심키워드","angle":"차별점"},{"topic":"주제2","keywords":["키워드1","키워드2","키워드3"],"seoFocus":"핵심키워드","angle":"차별점"},{"topic":"주제3","keywords":["키워드1","키워드2","키워드3"],"seoFocus":"핵심키워드","angle":"차별점"},{"topic":"주제4","keywords":["키워드1","키워드2","키워드3"],"seoFocus":"핵심키워드","angle":"차별점"},{"topic":"주제5","keywords":["키워드1","키워드2","키워드3"],"seoFocus":"핵심키워드","angle":"차별점"}]}`;
  };

  const buildArticlePrompt = (sourceLinks: string[]) => {
    const targetInfo = TARGET_AUDIENCES[formData.targetAudience];
    const toneInfo = TONE_GUIDES[formData.tone];
    
    return `
너는 케이터링/요식업 전문 블로그 에디터다.

## 타겟 독자
- 타겟: ${targetInfo.label}
- 설명: ${targetInfo.description}
- 이 독자가 궁금해하는 것, 고민하는 것에 초점을 맞춰 작성

## 톤 & 문체 가이드 (매우 중요!)
선택된 톤: ${toneInfo.label}
${toneInfo.prompt}

## 필수 조건
- 최소 ${MIN_CONTENT_CHARS}자 이상
- 키워드를 자연스럽게 포함
- 링크는 제공된 목록만 사용

## 입력 정보
- 주제: ${formData.topic}
- 키워드: ${formData.keywords}
- SEO 포커스: ${formData.seoFocus}
- 허용 링크: ${sourceLinks.join(', ')}

## HTML 스타일 (반드시 준수)
h1: class="text-3xl font-bold text-gray-900 mb-6"
h2: class="text-2xl font-bold text-gray-800 mt-10 mb-4 border-b-2 border-purple-500 pb-2"
h3: class="text-xl font-semibold text-gray-800 mt-6 mb-3"
p: class="text-base text-gray-700 leading-relaxed mb-4"
ul: class="list-disc pl-6 my-6 text-gray-700"
li: class="mb-2"

## 구조
<article class="prose max-w-none">
  <header><h1>제목</h1><p class="lead">요약</p></header>
  <figure data-role="cover"><img src="{{IMAGE_URL}}" alt="{{IMAGE_ALT}}" /></figure>
  <section><h2>소제목1</h2><p>본문</p></section>
  <section><h2>소제목2</h2><h3>세부주제</h3><p>본문</p></section>
  <section class="bg-gray-50 p-6 rounded-xl mt-8">
    <h2>자주 묻는 질문</h2>
    <details><summary class="font-semibold cursor-pointer">질문?</summary><p>답변</p></details>
  </section>
  <footer><p>마무리 (행동 유도)</p></footer>
</article>

JSON:
{
  "title": "string",
  "excerpt": "string (150자)",
  "meta_description": "string (155자, 키워드 포함)",
  "tags": ["string"],
  "content_html": "string",
  "image_alt": "string",
  "sources_used": ["string"]
}
`.trim();
  };

  const fetchReferenceLinks = async (query: string) => {
    if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_CX) return [];

    try {
      const params = new URLSearchParams({
        key: GOOGLE_CSE_API_KEY,
        cx: GOOGLE_CSE_CX,
        num: '5',
        q: query,
      });

      const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
      if (!response.ok) return [];

      const data = await response.json();
      return (data?.items || []).map((item: any) => item.link).filter(Boolean);
    } catch {
      return [];
    }
  };

  const generateSuggestions = async () => {
    setIsSuggesting(true);
    try {
      const result = await callGeminiJson(buildSuggestionPrompt());
      console.log('주제 추천 결과:', result);
      
      if (result && result.topics && Array.isArray(result.topics) && result.topics.length > 0) {
        setSuggestions(result.topics);
      } else {
        console.error('topics 배열이 없거나 비어있음:', result);
        alert('주제 추천 결과가 없습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('주제 추천 실패:', error);
      alert('주제 추천에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const applySuggestion = (suggestion: TopicSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      topic: suggestion.topic,
      keywords: suggestion.keywords.join(', '),
      seoFocus: suggestion.seoFocus,
    }));
    setSuggestions([]);
  };

  const generateBlogPost = async () => {
    if (!formData.topic || !formData.keywords) {
      alert('주제와 키워드는 필수입니다.');
      return;
    }

    setIsGenerating(true);
    setIsEditing(false);
    setEditedContent(null);

    try {
      const keywordsArray = formData.keywords.split(',').map((k) => k.trim()).filter(Boolean);
      const referenceQuery = `${keywordsArray[0] || formData.topic} 창업`;
      const cseLinks = await fetchReferenceLinks(referenceQuery);
      let allowedLinks = Array.from(new Set([...userReferenceLinks, ...cseLinks])).slice(0, 5);

      if (allowedLinks.length < 2) {
        allowedLinks = [SITE_URL, 'https://www.foodservice.co.kr'];
      }

      const result = await callGeminiJson(buildArticlePrompt(allowedLinks));
      let contentHtml = result?.content_html || '';

      let imageUrl = '';
      let inlineImageUrl = '';
      if (formData.includeImages) {
        try {
          const imagePrompt = `Ultra-realistic food photography of ${formData.topic}, ${formData.imageStyle}, plated catering, clean background, natural light, shallow depth of field, candid styling, no text, no typography, no letters, no numbers, no watermark, no logo, no packaging labels, no signage, no brand marks, no words, no menu cards, no signs, no writing`;
          imageUrl = await generateTextFreeImage(imagePrompt);
          if (contentHtml.match(/<img\b/i)) {
            const inlinePrompt = `Ultra-realistic food photography of ${formData.topic}, ${formData.imageStyle}, different composition, different angle, plated catering, clean background, natural light, shallow depth of field, candid styling, no text, no typography, no letters, no numbers, no watermark, no logo, no packaging labels, no signage, no brand marks, no words, no menu cards, no signs, no writing`;
            inlineImageUrl = await generateTextFreeImage(inlinePrompt);
          }
        } catch (imgError) {
          console.error('이미지 생성 실패:', imgError);
        }
      }

      const imageAlt = result.image_alt || `${formData.topic} 대표 이미지`;
      const inlineAlt = `${formData.topic} 관련 이미지`;
      if (imageUrl) {
        contentHtml = ensureFigure(contentHtml, imageUrl, imageAlt);
        if (inlineImageUrl) {
          contentHtml = normalizeInlineImages(contentHtml, inlineImageUrl, inlineAlt);
        } else {
          contentHtml = normalizeInlineImages(contentHtml, imageUrl, imageAlt);
        }
      } else {
        contentHtml = removeCoverFigure(contentHtml);
      }

      const seoScore = calculateSeoScore(contentHtml, result.meta_description || '', formData.keywords);

      const generated: GeneratedBlogContent = {
        title: result.title,
        excerpt: result.excerpt,
        content_html: contentHtml,
        meta_description: result.meta_description,
        tags: result.tags || [],
        image_alt: imageAlt,
        image_url: imageUrl,
        author: 'Master',
        sources_used: result.sources_used || allowedLinks,
        seo_score: seoScore,
      };

      setGeneratedContent(generated);
      setEditedContent({ ...generated }); // 편집용 복사본
    } catch (error) {
      console.error('블로그 생성 실패:', error);
      alert(`블로그 생성 중 오류: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 편집 핸들러
  const handleEditChange = (field: keyof GeneratedBlogContent, value: string | string[]) => {
    if (!editedContent) return;
    
    const updated = { ...editedContent, [field]: value };

    if (field === 'image_url' && value === '') {
      updated.content_html = removeCoverFigure(updated.content_html, editedContent.image_url || '');
    }
    
    // SEO 점수 재계산
    if (field === 'content_html' || field === 'meta_description' || (field === 'image_url' && value === '')) {
      updated.seo_score = calculateSeoScore(
        updated.content_html,
        updated.meta_description,
        formData.keywords
      );
    }
    
    setEditedContent(updated);
  };

  const publishBlogPost = async () => {
    const contentToPublish = editedContent || generatedContent;
    if (!contentToPublish) return;

    const contentLength = stripHtml(contentToPublish.content_html || '').length;
    if (contentLength < MIN_CONTENT_CHARS) {
      alert(`본문은 최소 ${MIN_CONTENT_CHARS}자 이상이어야 합니다. (현재 ${contentLength}자)`);
      return;
    }

    try {
      const { error } = await supabase.from('publish_queue').insert([{
        title: contentToPublish.title,
        excerpt: contentToPublish.excerpt,
        content_html: contentToPublish.content_html,
        meta_description: contentToPublish.meta_description,
        image_url: contentToPublish.image_url || '',
        author: 'Master',
        tags: contentToPublish.tags || [],
        seo_score: contentToPublish.seo_score ?? null,
        status: 'pending_review',
        thread_text: buildThreadText(contentToPublish),
        created_at: new Date().toISOString(),
      }]);

      if (error) {
        if (error.code === '42P01' || String(error.message).includes('publish_queue')) {
          console.error('publish_queue table missing. Create it in Supabase SQL editor.');
          return;
        }
        throw error;
      }
      alert('검수 대기 큐에 저장되었습니다.');
      navigate('/admin/publish-queue');
    } catch (error: any) {
      alert(`저장 실패: ${error.message}`);
    }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const currentContent = editedContent || generatedContent;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/dashboard')} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-amber-600">
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-robot-line text-xl text-white"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI 블로그 자동 생성</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button onClick={handleLogout} className="px-4 py-2 text-sm text-gray-700 hover:text-red-600">
                <i className="ri-logout-box-line mr-2"></i>로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 왼쪽: 설정 패널 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <i className="ri-quill-pen-line text-2xl text-purple-600"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">블로그 설정</h2>
                  <p className="text-sm text-gray-600">AI가 추천 → 내가 확인/수정 → 발행</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* 타겟 오디언스 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    타겟 독자 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-purple-500"
                  >
                    {Object.entries(TARGET_AUDIENCES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {TARGET_AUDIENCES[formData.targetAudience]?.description}
                  </p>
                </div>

                {/* 톤 선택 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    글 톤/스타일 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-purple-500"
                  >
                    {Object.entries(TONE_GUIDES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {TONE_GUIDES[formData.tone]?.description}
                  </p>
                </div>

                {/* AI 주제 추천 */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-purple-900">AI 주제 추천</span>
                    <button
                      onClick={generateSuggestions}
                      className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                      disabled={isSuggesting}
                    >
                      {isSuggesting ? '추천 중...' : '주제 추천받기'}
                    </button>
                  </div>
                  
                  {suggestions.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {suggestions.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => applySuggestion(item)}
                          className="w-full text-left p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-sm transition-all"
                        >
                          <p className="text-sm font-semibold text-gray-900">{item.topic}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.angle}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 주제 직접 입력 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    블로그 주제 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="직접 입력하거나 위에서 추천받기"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* 키워드 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      키워드 <span className="text-red-500">*</span>
                    </label>
                    <button
                      onClick={generateKeywordsFromTopic}
                      disabled={isGeneratingKeywords || !formData.topic.trim()}
                      className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 disabled:opacity-50"
                    >
                      {isGeneratingKeywords ? '생성중...' : 'AI 자동생성'}
                    </button>
                  </div>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    placeholder="AI가 추천한 키워드를 확인/수정하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* SEO 포커스 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SEO 핵심 키워드
                  </label>
                  <input
                    type="text"
                    name="seoFocus"
                    value={formData.seoFocus}
                    onChange={handleChange}
                    placeholder="가장 중요한 키워드 1~2개"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* 이미지 */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="includeImages"
                    name="includeImages"
                    checked={formData.includeImages}
                    onChange={handleChange}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <label htmlFor="includeImages" className="text-sm font-medium text-gray-700">
                    대표 이미지 자동 생성 (Gemini)
                  </label>
                </div>
              </div>

              {/* 생성 버튼 */}
              <button
                onClick={generateBlogPost}
                disabled={isGenerating}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-base font-semibold rounded-lg hover:shadow-lg disabled:bg-gray-400"
              >
                {isGenerating ? (
                  <><i className="ri-loader-4-line animate-spin mr-2"></i>Gemini가 글 생성 중...</>
                ) : (
                  <><i className="ri-magic-line mr-2"></i>Gemini로 초안 생성하기</>
                )}
              </button>
            </div>
          </div>

          {/* 오른쪽: 미리보기 & 편집 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? '편집 모드' : '미리보기'}
                </h2>
                {currentContent && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        isEditing 
                          ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' 
                          : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                      }`}
                    >
                      {isEditing ? '미리보기' : '수정하기'}
                    </button>
                    <button
                      onClick={publishBlogPost}
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg"
                    >
                      <i className="ri-send-plane-fill mr-2"></i>최종 발행
                    </button>
                  </div>
                )}
              </div>

              {!currentContent ? (
                <div className="text-center py-20">
                  <i className="ri-article-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">주제와 키워드를 입력하고 생성 버튼을 눌러주세요.</p>
                  <p className="text-gray-400 text-sm mt-2">AI가 초안을 생성하면 직접 수정할 수 있어요!</p>
                </div>
              ) : isEditing ? (
                /* 편집 모드 */
                <div className="space-y-4">
                  {/* 이미지 편집 */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">대표 이미지</label>
                    
                    {/* 현재 이미지 미리보기 */}
                    {editedContent?.image_url && (
                      <div className="mb-3 relative">
                        <img 
                          src={editedContent.image_url} 
                          alt={editedContent.image_alt} 
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleEditChange('image_url', '')}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                          title="이미지 삭제"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    )}

                    {/* 이미지 URL 직접 입력 */}
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">이미지 URL 직접 입력</label>
                      <input
                        type="text"
                        value={editedContent?.image_url || ''}
                        onChange={(e) => handleEditChange('image_url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* 파일 업로드 */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">또는 파일 업로드</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            const fileName = `upload-${Date.now()}-${file.name}`;
                            const { error } = await supabase.storage
                              .from('blog-images')
                              .upload(fileName, file, { upsert: true });
                            
                            if (error) throw error;
                            
                            const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
                            handleEditChange('image_url', data.publicUrl);
                            alert('이미지가 업로드되었습니다!');
                          } catch (err) {
                            console.error('업로드 실패:', err);
                            alert('이미지 업로드에 실패했습니다.');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                      />
                    </div>

                    {/* 이미지 alt 텍스트 */}
                    <div className="mt-3">
                      <label className="block text-xs text-gray-500 mb-1">이미지 설명 (alt 텍스트)</label>
                      <input
                        type="text"
                        value={editedContent?.image_alt || ''}
                        onChange={(e) => handleEditChange('image_alt', e.target.value)}
                        placeholder="이미지에 대한 설명 (SEO용)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* 제목 편집 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">제목</label>
                    <input
                      type="text"
                      value={editedContent?.title || ''}
                      onChange={(e) => handleEditChange('title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 요약 편집 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">요약 (excerpt)</label>
                    <textarea
                      value={editedContent?.excerpt || ''}
                      onChange={(e) => handleEditChange('excerpt', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 메타 설명 편집 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      메타 설명 ({editedContent?.meta_description?.length || 0}/155자)
                    </label>
                    <textarea
                      value={editedContent?.meta_description || ''}
                      onChange={(e) => handleEditChange('meta_description', e.target.value)}
                      rows={2}
                      maxLength={160}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 태그 편집 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">태그 (콤마로 구분)</label>
                    <input
                      type="text"
                      value={editedContent?.tags?.join(', ') || ''}
                      onChange={(e) => handleEditChange('tags', e.target.value.split(',').map(t => t.trim()))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 본문 편집 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">본문 (HTML)</label>
                    <textarea
                      value={editedContent?.content_html || ''}
                      onChange={(e) => handleEditChange('content_html', e.target.value)}
                      rows={15}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* SEO 점수 */}
                  {editedContent?.seo_score && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="text-sm font-bold text-green-900 mb-2">SEO 점수 (실시간)</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className={`p-2 rounded ${editedContent.seo_score.hasH1 ? 'bg-green-100' : 'bg-red-100'}`}>
                          H1: {editedContent.seo_score.hasH1 ? '있음' : '없음'}
                        </div>
                        <div className={`p-2 rounded ${editedContent.seo_score.hasH2 ? 'bg-green-100' : 'bg-red-100'}`}>
                          H2: {editedContent.seo_score.hasH2 ? '있음' : '없음'}
                        </div>
                        <div className={`p-2 rounded ${editedContent.seo_score.hasMetaDesc ? 'bg-green-100' : 'bg-red-100'}`}>
                          메타: {editedContent.seo_score.hasMetaDesc ? '있음' : '없음'}
                        </div>
                        <div className="p-2 rounded bg-blue-100 col-span-3">
                          본문: {editedContent.seo_score.contentLength.toLocaleString()}자 | 키워드: {editedContent.seo_score.keywordCount}회
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* 미리보기 모드 */
                <div className="space-y-6">
                  {currentContent.image_url && (
                    <div className="w-full h-64 rounded-lg overflow-hidden">
                      <img src={currentContent.image_url} alt={currentContent.image_alt} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentContent.title}</h3>
                    <p className="text-sm text-gray-500">작성자: {currentContent.author} | {new Date().toLocaleDateString('ko-KR')}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                    <p className="text-gray-700 text-sm">{currentContent.excerpt}</p>
                  </div>

                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: currentContent.content_html }} />

                  {currentContent.seo_score && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="text-sm font-bold text-green-900 mb-3">SEO 최적화 점수</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`p-2 rounded ${currentContent.seo_score.hasH1 ? 'bg-green-100' : 'bg-red-100'}`}>H1: {currentContent.seo_score.hasH1 ? '있음' : '없음'}</div>
                        <div className={`p-2 rounded ${currentContent.seo_score.hasH2 ? 'bg-green-100' : 'bg-red-100'}`}>H2: {currentContent.seo_score.hasH2 ? '있음' : '없음'}</div>
                        <div className={`p-2 rounded ${currentContent.seo_score.hasFAQ ? 'bg-green-100' : 'bg-yellow-100'}`}>FAQ: {currentContent.seo_score.hasFAQ ? '있음' : '없음'}</div>
                        <div className={`p-2 rounded ${currentContent.seo_score.hasMetaDesc ? 'bg-green-100' : 'bg-red-100'}`}>메타: {currentContent.seo_score.hasMetaDesc ? '있음' : '없음'}</div>
                        <div className="p-2 rounded bg-blue-100">키워드: {currentContent.seo_score.keywordCount}회</div>
                        <div className="p-2 rounded bg-blue-100">길이: {currentContent.seo_score.contentLength.toLocaleString()}자</div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-bold text-purple-900 mb-2">메타 정보</h4>
                    <div className="space-y-1 text-xs text-purple-800">
                      <p><strong>메타 설명:</strong> {currentContent.meta_description}</p>
                      <p><strong>태그:</strong> {currentContent.tags.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
