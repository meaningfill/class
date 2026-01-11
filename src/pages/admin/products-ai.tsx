import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import { crawlProduct } from '../../utils/crawler';

const GEMINI_API_KEY = import.meta.env.VITE_API_KEY as string | undefined;
const GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-2.0-flash';

export default function AdminProductsAI() {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    basicInfo: '',
    eventType: '',
    price: '',
    components: '',
    recommendedEvents: '',
    inputUrl: '', // URL 입력 필드 추가
  });
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // 에러 메시지 상태 추가
  const [crawledDetail, setCrawledDetail] = useState<string>(''); // 크롤링된 상세 HTML 저장
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('사용자 확인 실패:', error);
      navigate('/admin/login');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractJson = (text: string) => {
    try {
      // Markdown code block 제거 (```json ... ```)
      const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      const match = cleanText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('JSON 형식을 찾을 수 없습니다.');
      return JSON.parse(match[0]);
    } catch (e) {
      console.error('JSON Extraction Failed:', text);
      throw new Error('AI 응답을 처리하는 중 오류가 발생했습니다. (JSON Parsing Error)');
    }
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

    // 에러 메시지 구체화
    const msg = lastError?.message || '알 수 없는 오류';
    if (msg.includes('403') || msg.includes('API key')) setErrorMsg('Gemini API 키가 만료되었거나 유효하지 않습니다.');
    else if (msg.includes('JSON')) setErrorMsg('AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.');
    else setErrorMsg(msg);

    throw lastError || new Error('Gemini 호출 실패');
  };

  const buildProductPrompt = () => `
너는 케이터링 상품 상세를 작성하는 SEO 에디터다.
아래 정보로 상품명을 포함한 상세 정보를 생성해줘.
JSON만 출력.

기본 정보: ${formData.basicInfo}
카테고리: ${formData.eventType}
구성: ${formData.components}
추천 행사: ${formData.recommendedEvents}
가격: ${formData.price}원

JSON:
{
  "name": "string",
  "description": "string (한 줄 요약)",
  "detailed_description": "string (2~4문장)",
  "features": ["string","string","string","string","string"],
  "seo_title": "string",
  "seo_description": "string",
  "seo_keywords": "string (쉼표 구분)"
}
  `.trim();

  const handleGenerate = async () => {
    // 이미지가 파일로 선택되었거나, 크롤링된 미리보기(URL)가 있어야 함
    if ((!imageFile && !imagePreview) || !formData.basicInfo || !formData.price) {
      alert('이미지와 기본 정보, 가격을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 이미지 업로드는 저장 시점에 수행 (AI 생성 단계에서는 불필요한 업로드 및 RLS 에러 방지)
      // Gemini에는 텍스트 프롬프트만 전달

      let generated;
      if (GEMINI_API_KEY) {
        const result = await callGeminiJson(buildProductPrompt());
        generated = {
          name: result.name,
          description: result.description,
          detailedDescription: result.detailed_description + (crawledDetail ? '<br/><br/>' + crawledDetail : ''),
          features: result.features || [],
          components: formData.components.split(',').map((c) => c.trim()).filter((c) => c),
          recommendedEvents: formData.recommendedEvents.split(',').map((e) => e.trim()).filter((e) => e),
          seoTitle: result.seo_title,
          seoDescription: result.seo_description,
          seoKeywords: result.seo_keywords,
          imageUrl: imagePreview, // 크롤링된 이미지 URL 또는 빈 문자열
          price: parseInt(formData.price, 10),
          eventType: formData.eventType,
        };
      } else {
        generated = {
          name: generateProductName(formData.basicInfo),
          description: generateDescription(formData.basicInfo),
          detailedDescription: generateDescription(formData.basicInfo) + (crawledDetail ? '<br/><br/>' + crawledDetail : ''),
          features: generateFeatures(formData.basicInfo),
          components: formData.components.split(',').map((c) => c.trim()).filter((c) => c),
          recommendedEvents: formData.recommendedEvents.split(',').map((e) => e.trim()).filter((e) => e),
          seoTitle: generateSEOTitle(formData.basicInfo),
          seoDescription: generateSEODescription(formData.basicInfo),
          seoKeywords: generateSEOKeywords(formData.basicInfo),
          imageUrl: imagePreview, // 크롤링된 이미지 URL 또는 빈 문자열
          price: parseInt(formData.price, 10),
          eventType: formData.eventType,
        };
      }

      setGeneratedData(generated);
    } catch (error: any) {
      console.error('생성 실패:', error);
      alert(`생성에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedData) return;

    // 세션 재확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      navigate('/admin/login');
      return;
    }

    if (!imageFile && !generatedData.imageUrl) {
      alert('이미지가 없습니다. 이미지를 업로드하거나 URL을 가져와주세요.');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = generatedData.imageUrl;

      // 1. 새 이미지가 선택되었다면 업로드
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile);

        if (uploadError) throw new Error(`이미지 업로드 실패: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      // 2. DB 저장
      const { error } = await supabase.from('products').insert({
        name: generatedData.name,
        price: generatedData.price,
        image_url: finalImageUrl,
        description: generatedData.description,
        detailed_description: generatedData.detailedDescription,
        features: generatedData.features,
        components: generatedData.components,
        recommended_events: generatedData.recommendedEvents,
        event_type: generatedData.eventType,
        seo_title: generatedData.seoTitle,
        seo_description: generatedData.seoDescription,
        seo_keywords: generatedData.seoKeywords,
      });

      if (error) throw error;

      alert('상품이 등록되었습니다.');
      navigate('/admin/products');
    } catch (error: any) {
      console.error('저장 실패:', error);
      alert(`저장에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateProductName = (info: string) => {
    const keywords = info.toLowerCase();
    if (keywords.includes('디저트') || keywords.includes('dessert')) {
      return `프리미엄 디저트 박스 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 10) + 1}`;
    }
    if (keywords.includes('샌드위치') || keywords.includes('sandwich')) {
      return `신선 샌드위치 박스 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 10) + 1}`;
    }
    if (keywords.includes('도시락') || keywords.includes('lunch')) {
      return `건강 도시락 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 10) + 1}`;
    }
    return `스페셜 케이터링 메뉴 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 10) + 1}`;
  };

  const generateDescription = (info: string) => {
    return `${info}를 기반으로 정성껏 준비한 프리미엄 케이터링 메뉴입니다. 신선한 재료와 균형 잡힌 구성으로 특별한 행사와 모임에 잘 어울리도록 설계했습니다.`;
  };

  const generateFeatures = (info: string) => {
    return [
      '신선한 재료로 구성',
      '개별 포장으로 위생 강화',
      '영양 균형을 고려한 구성',
      '행사 목적에 맞춘 맞춤형 옵션',
      `${info}에 최적화된 메뉴 설계`,
    ];
  };

  const generateSEOTitle = (info: string) => {
    const keywords = info.toLowerCase();
    if (keywords.includes('디저트')) {
      return '프리미엄 디저트 박스 | 케이터링 디저트 전문';
    }
    if (keywords.includes('샌드위치')) {
      return '샌드위치 케이터링 박스 | 행사 전문 메뉴';
    }
    return `${info} | 케이터링 전문 메뉴`;
  };

  const generateSEODescription = (info: string) => {
    return `${info}로 준비한 프리미엄 케이터링 메뉴. 신선한 재료와 균형 잡힌 구성으로 기업 행사, 모임, 웨딩 등 다양한 행사에 적합합니다.`;
  };

  const generateSEOKeywords = (info: string) => {
    return `케이터링, 행사 도시락, 샌드위치 박스, 디저트 박스, ${info}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/products')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <i className="ri-robot-line text-xl text-white"></i>
                </div>
                <h1 className="text-xl font-bold text-gray-900">AI 상품 자동 생성</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="ri-upload-cloud-line text-amber-600"></i>
              상품 정보 입력
            </h2>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
                <i className="ri-error-warning-fill text-xl"></i>
                <span className="text-sm font-medium">{errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="ml-auto"><i className="ri-close-line"></i></button>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                참고 URL (자동 크롤링) <span className="text-xs text-pink-500">* 의미있는 웹사이트(Meaningfill 등)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.inputUrl}
                  onChange={(e) => setFormData({ ...formData, inputUrl: e.target.value })}
                  placeholder="https://meaningfill.co.kr/product/..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.inputUrl) return;
                    setLoading(true);
                    setErrorMsg(null);
                    try {
                      const data = await crawlProduct(formData.inputUrl);
                      setFormData(prev => ({
                        ...prev,
                        basicInfo: `${data.title}\n${data.description}`,
                        price: data.price.toString(),
                        // 이미지 URL은 미리보기용으로 처리 (실제 업로드는 별도)
                      }));
                      if (data.imageUrl) setImagePreview(data.imageUrl); // 미리보기만 설정
                      alert('정보를 성공적으로 가져왔습니다.');
                    } catch (e: any) {
                      setErrorMsg(e.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 whitespace-nowrap"
                >
                  가져오기
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상품 이미지 *
              </label>
              <div className="border-2 border-dashed border-amber-300 rounded-xl p-6 text-center hover:border-amber-500 transition-colors cursor-pointer bg-amber-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  ) : (
                    <>
                      <i className="ri-image-add-line text-5xl text-amber-400 mb-2"></i>
                      <p className="text-gray-600">클릭하여 이미지 업로드</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상품 기본 정보 *
              </label>
              <textarea
                value={formData.basicInfo}
                onChange={(e) => setFormData({ ...formData, basicInfo: e.target.value })}
                placeholder="예: 신선한 샌드위치와 과일로 구성한 건강 도시락"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.basicInfo.length}/500</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                카테고리
              </label>
              <input
                type="text"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                placeholder="예: 샌드박스, 디저트박스, 프리미엄박스"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                가격(원) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="10000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                구성품(쉼표로 구분)
              </label>
              <input
                type="text"
                value={formData.components}
                onChange={(e) => setFormData({ ...formData, components: e.target.value })}
                placeholder="샌드위치 2개, 과일, 음료"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                추천 행사(쉼표로 구분)
              </label>
              <input
                type="text"
                value={formData.recommendedEvents}
                onChange={(e) => setFormData({ ...formData, recommendedEvents: e.target.value })}
                placeholder="기업 행사, 워크숍"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all whitespace-nowrap font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  AI 생성 중...
                </>
              ) : (
                <>
                  <i className="ri-magic-line mr-2"></i>
                  AI로 자동 생성하기
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="ri-file-text-line text-amber-600"></i>
              생성 결과
            </h2>

            {!generatedData ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-robot-line text-4xl text-amber-600"></i>
                </div>
                <p className="text-gray-600">
                  AI가 상품 정보를 생성하면
                  <br />
                  여기에 표시됩니다.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">상품명</label>
                  <input
                    type="text"
                    value={generatedData.name}
                    onChange={(e) => setGeneratedData({ ...generatedData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">상품 설명</label>
                  <textarea
                    value={generatedData.description}
                    onChange={(e) => setGeneratedData({ ...generatedData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">상품 상세 설명</label>
                  <textarea
                    value={generatedData.detailedDescription || ''}
                    onChange={(e) => setGeneratedData({ ...generatedData, detailedDescription: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">주요 특징 (쉼표 구분)</label>
                  <input
                    type="text"
                    value={(generatedData.features || []).join(', ')}
                    onChange={(e) => setGeneratedData({ ...generatedData, features: e.target.value.split(',').map((v: string) => v.trim()).filter((v: string) => v) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
                  <input
                    type="text"
                    value={generatedData.eventType || ''}
                    onChange={(e) => setGeneratedData({ ...generatedData, eventType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <i className="ri-seo-line"></i>
                    SEO 최적화 정보
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-purple-700 mb-1">SEO 제목</label>
                      <input
                        type="text"
                        value={generatedData.seoTitle}
                        onChange={(e) => setGeneratedData({ ...generatedData, seoTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-purple-700 mb-1">SEO 설명</label>
                      <textarea
                        value={generatedData.seoDescription}
                        onChange={(e) => setGeneratedData({ ...generatedData, seoDescription: e.target.value })}
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-purple-700 mb-1">SEO 키워드</label>
                      <input
                        type="text"
                        value={generatedData.seoKeywords}
                        onChange={(e) => setGeneratedData({ ...generatedData, seoKeywords: e.target.value })}
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all whitespace-nowrap font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      저장 중...
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line mr-2"></i>
                      상품 등록하기
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
