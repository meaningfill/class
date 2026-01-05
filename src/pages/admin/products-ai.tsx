import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AdminProductsAI() {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    basicInfo: '',
    price: '',
    components: '',
    recommendedEvents: '',
  });
  const [generatedData, setGeneratedData] = useState<any>(null);
  const navigate = useNavigate();

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

  const handleGenerate = async () => {
    if (!imageFile || !formData.basicInfo || !formData.price) {
      alert('이미지와 기본 정보, 가격을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 이미지 업로드
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      // AI 생성 시뮬레이션 (실제로는 OpenAI API 등을 사용)
      const generated = {
        name: generateProductName(formData.basicInfo),
        description: generateDescription(formData.basicInfo),
        features: generateFeatures(formData.basicInfo),
        components: formData.components.split(',').map(c => c.trim()).filter(c => c),
        recommendedEvents: formData.recommendedEvents.split(',').map(e => e.trim()).filter(e => e),
        seoTitle: generateSEOTitle(formData.basicInfo),
        seoDescription: generateSEODescription(formData.basicInfo),
        seoKeywords: generateSEOKeywords(formData.basicInfo),
        imageUrl: publicUrl,
        price: parseInt(formData.price),
      };

      setGeneratedData(generated);
    } catch (error) {
      console.error('생성 실패:', error);
      alert('생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedData) return;

    setLoading(true);

    try {
      const { error } = await supabase.from('products').insert({
        name: generatedData.name,
        price: generatedData.price,
        image_url: generatedData.imageUrl,
        description: generatedData.description,
        features: generatedData.features,
        components: generatedData.components,
        recommended_events: generatedData.recommendedEvents,
        seo_title: generatedData.seoTitle,
        seo_description: generatedData.seoDescription,
        seo_keywords: generatedData.seoKeywords,
      });

      if (error) throw error;

      alert('상품이 등록되었습니다!');
      navigate('/admin/products');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // AI 생성 함수들
  const generateProductName = (info: string) => {
    const keywords = info.toLowerCase();
    if (keywords.includes('디저트') || keywords.includes('dessert')) {
      return `프리미엄 디저트박스 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 10) + 1}`;
    } else if (keywords.includes('샌드') || keywords.includes('sandwich')) {
      return `신선한 샌드박스 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 10) + 1}`;
    } else if (keywords.includes('도시락') || keywords.includes('lunch')) {
      return `건강한 도시락 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 10) + 1}`;
    }
    return `특별한 메뉴 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 10) + 1}`;
  };

  const generateDescription = (info: string) => {
    return `${info}로 정성스럽게 준비한 프리미엄 케이터링 메뉴입니다. 신선한 재료와 정갈한 구성으로 특별한 순간을 더욱 빛나게 만들어드립니다. 각종 행사와 모임에 완벽한 선택입니다.`;
  };

  const generateFeatures = (info: string) => {
    return [
      '신선한 당일 제조 식재료 사용',
      '위생적인 개별 포장',
      '영양 균형을 고려한 구성',
      '다양한 입맛을 고려한 메뉴',
      '행사 컨셉에 맞는 플레이팅',
    ];
  };

  const generateSEOTitle = (info: string) => {
    const keywords = info.toLowerCase();
    if (keywords.includes('디저트')) {
      return '프리미엄 디저트박스 | 케이터링 전문 미닝필 | 행사 디저트 배달';
    } else if (keywords.includes('샌드')) {
      return '신선한 샌드위치 박스 | 케이터링 전문 미닝필 | 행사 도시락';
    }
    return `${info} | 케이터링 전문 미닝필 | 행사 음식 배달`;
  };

  const generateSEODescription = (info: string) => {
    return `${info}로 준비한 프리미엄 케이터링 메뉴. 신선한 재료와 정성스러운 조리로 특별한 행사를 완성합니다. 기업 행사, 세미나, 워크샵, 파티 등 다양한 행사에 최적화된 메뉴를 제공합니다.`;
  };

  const generateSEOKeywords = (info: string) => {
    return `케이터링, 행사음식, 도시락배달, 샌드위치박스, 디저트박스, ${info}, 미닝필, 기업행사, 세미나음식`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* 상단 네비게이션 */}
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
          {/* 입력 폼 */}
          <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="ri-upload-cloud-line text-amber-600"></i>
              상품 정보 입력
            </h2>

            {/* 이미지 업로드 */}
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

            {/* 기본 정보 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상품 기본 정보 *
              </label>
              <textarea
                value={formData.basicInfo}
                onChange={(e) => setFormData({ ...formData, basicInfo: e.target.value })}
                placeholder="예: 신선한 샌드위치와 과일이 들어간 건강한 도시락"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.basicInfo.length}/500</p>
            </div>

            {/* 가격 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                가격 (원) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="10000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* 구성품 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                구성품 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={formData.components}
                onChange={(e) => setFormData({ ...formData, components: e.target.value })}
                placeholder="샌드위치 2개, 과일, 음료"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* 추천 행사 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                추천 행사 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={formData.recommendedEvents}
                onChange={(e) => setFormData({ ...formData, recommendedEvents: e.target.value })}
                placeholder="세미나, 워크샵, 기업 행사"
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

          {/* 생성 결과 */}
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
                <p className="text-gray-600">AI가 상품 정보를 생성하면<br />여기에 표시됩니다</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 상품명 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">상품명</label>
                  <input
                    type="text"
                    value={generatedData.name}
                    onChange={(e) => setGeneratedData({ ...generatedData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* 설명 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">상품 설명</label>
                  <textarea
                    value={generatedData.description}
                    onChange={(e) => setGeneratedData({ ...generatedData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {/* SEO 정보 */}
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

                {/* 저장 버튼 */}
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
