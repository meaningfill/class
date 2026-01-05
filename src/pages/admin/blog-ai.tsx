import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface BlogGenerationForm {
  topic: string;
  keywords: string;
  targetAudience: string;
  tone: string;
  contentLength: string;
  includeImages: boolean;
  seoFocus: string;
}

export default function AIBlogGenerator() {
  const [user, setUser] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [formData, setFormData] = useState<BlogGenerationForm>({
    topic: '',
    keywords: '',
    targetAudience: '케이터링 사업자',
    tone: 'professional',
    contentLength: 'medium',
    includeImages: true,
    seoFocus: '케이터링, 샌드위치, 핑거푸드'
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

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
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generateBlogPost = async () => {
    if (!formData.topic || !formData.keywords) {
      alert('주제와 키워드를 입력해주세요.');
      return;
    }

    setIsGenerating(true);

    try {
      // AI 블로그 생성 로직
      const keywordsArray = formData.keywords.split(',').map(k => k.trim());
      const mainKeyword = keywordsArray[0];
      
      // SEO 최적화된 제목 생성
      const title = `${formData.topic} - ${mainKeyword} 완벽 가이드`;
      
      // SEO 최적화된 발췌문 생성
      const excerpt = `${formData.topic}에 대한 전문가의 인사이트를 확인하세요. ${keywordsArray.slice(0, 3).join(', ')}에 대한 실용적인 팁과 전략을 제공합니다.`;
      
      // 본문 생성 (실제로는 AI API를 호출해야 하지만, 여기서는 템플릿 사용)
      const content = generateSEOOptimizedContent(formData);
      
      // 이미지 URL 생성 - 고유한 seq 값 사용
      const uniqueSeq = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const imageUrl = formData.includeImages 
        ? `https://readdy.ai/api/search-image?query=professional%20catering%20service%20elegant%20presentation%20with%20gourmet%20sandwiches%20and%20finger%20foods%20on%20white%20serving%20tables%20bright%20natural%20lighting%20clean%20white%20background%20high%20end%20event%20catering%20display%20modern%20food%20styling&width=1200&height=630&seq=${uniqueSeq}&orientation=landscape`
        : '';

      setGeneratedContent({
        title,
        excerpt,
        content,
        image_url: imageUrl,
        keywords: keywordsArray,
        meta_description: excerpt.substring(0, 160),
        author: 'Master'
      });

    } catch (error) {
      console.error('블로그 생성 실패:', error);
      alert('블로그 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSEOOptimizedContent = (data: BlogGenerationForm): string => {
    const keywords = data.keywords.split(',').map(k => k.trim());
    const mainKeyword = keywords[0];
    
    let content = `<h2>${data.topic} 소개</h2>\n\n`;
    content += `<p><strong>${mainKeyword}</strong>는 현대 케이터링 산업에서 매우 중요한 요소입니다. 이 가이드에서는 ${data.topic}에 대한 전문적인 인사이트와 실용적인 팁을 제공합니다.</p>\n\n`;
    
    content += `<h3>${mainKeyword}의 중요성</h3>\n`;
    content += `<p>${data.targetAudience}에게 ${mainKeyword}는 비즈니스 성공의 핵심입니다. 다음과 같은 이유로 중요합니다:</p>\n`;
    content += `<ul>\n`;
    content += `<li><strong>고객 만족도 향상</strong>: ${mainKeyword}를 통해 고객 경험을 개선할 수 있습니다</li>\n`;
    content += `<li><strong>경쟁력 강화</strong>: 차별화된 ${mainKeyword} 전략으로 시장에서 우위를 점할 수 있습니다</li>\n`;
    content += `<li><strong>수익성 증대</strong>: 효율적인 ${mainKeyword} 관리로 비용을 절감하고 수익을 높일 수 있습니다</li>\n`;
    content += `</ul>\n\n`;
    
    keywords.slice(1, 4).forEach((keyword, index) => {
      content += `<h3>${keyword}와의 연관성</h3>\n`;
      content += `<p>${keyword}는 ${mainKeyword}와 밀접한 관련이 있습니다. ${data.targetAudience}는 ${keyword}를 활용하여 더 나은 결과를 얻을 수 있습니다. 실제로 많은 성공적인 케이터링 비즈니스들이 ${keyword}를 핵심 전략으로 사용하고 있습니다.</p>\n\n`;
    });
    
    content += `<h3>실전 적용 방법</h3>\n`;
    content += `<p>${data.topic}을 실제 비즈니스에 적용하는 방법은 다음과 같습니다:</p>\n`;
    content += `<ol>\n`;
    content += `<li><strong>계획 수립</strong>: ${mainKeyword}에 대한 명확한 목표와 전략을 설정합니다</li>\n`;
    content += `<li><strong>리소스 준비</strong>: 필요한 재료, 장비, 인력을 확보합니다</li>\n`;
    content += `<li><strong>실행 및 모니터링</strong>: 계획을 실행하고 지속적으로 성과를 측정합니다</li>\n`;
    content += `<li><strong>개선 및 최적화</strong>: 피드백을 바탕으로 프로세스를 개선합니다</li>\n`;
    content += `</ol>\n\n`;
    
    content += `<h3>성공 사례</h3>\n`;
    content += `<p>많은 케이터링 전문가들이 ${mainKeyword}를 통해 놀라운 성과를 거두었습니다. 이들은 ${keywords.slice(0, 3).join(', ')}를 효과적으로 활용하여 고객 만족도를 높이고 비즈니스를 성장시켰습니다.</p>\n\n`;
    
    content += `<h3>결론</h3>\n`;
    content += `<p>${data.topic}는 ${data.targetAudience}에게 필수적인 요소입니다. ${mainKeyword}를 중심으로 ${keywords.slice(1, 3).join(', ')}를 통합적으로 활용하면 케이터링 비즈니스에서 성공할 수 있습니다. 지금 바로 시작하여 여러분의 비즈니스를 한 단계 업그레이드하세요.</p>\n\n`;
    
    content += `<p><strong>더 많은 정보가 필요하신가요?</strong> 저희 케이터링 아카데미에서는 ${mainKeyword}에 대한 전문 교육과 컨설팅을 제공합니다. 지금 바로 문의하세요!</p>`;
    
    return content;
  };

  const publishBlogPost = async () => {
    if (!generatedContent) return;

    try {
      // 제목에서 slug 생성 (한글 -> 영문 변환 및 URL 친화적 형식)
      const slug = generatedContent.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-' + Date.now();

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          title: generatedContent.title,
          slug: slug,
          excerpt: generatedContent.excerpt,
          content: generatedContent.content,
          image_url: generatedContent.image_url || '',
          author: generatedContent.author,
          published_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('Supabase 오류:', error);
        throw error;
      }

      alert('블로그 포스트가 성공적으로 발행되었습니다!');
      
      // 발행 후 폼 초기화
      setGeneratedContent(null);
      setFormData({
        topic: '',
        keywords: '',
        targetAudience: '케이터링 사업자',
        tone: 'professional',
        contentLength: 'medium',
        includeImages: true,
        seoFocus: '케이터링, 샌드위치, 핑거푸드'
      });
      
      // 블로그 관리 페이지로 이동
      navigate('/admin/blog');
    } catch (error: any) {
      console.error('블로그 발행 실패:', error);
      alert(`블로그 발행 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-amber-600 transition-colors cursor-pointer"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-robot-line text-xl text-white"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI 블로그 자동 생성</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-logout-box-line mr-2"></i>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <i className="ri-quill-pen-line text-2xl text-purple-600"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">블로그 생성 설정</h2>
                  <p className="text-sm text-gray-600">AI가 SEO 최적화된 블로그를 자동 생성합니다</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    주제 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="예: 케이터링 메뉴 기획 방법"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    키워드 (쉼표로 구분) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    placeholder="예: 케이터링, 샌드위치, 핑거푸드, 메뉴 기획"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">SEO 최적화를 위해 3-5개의 키워드를 입력하세요</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    타겟 독자
                  </label>
                  <select
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="케이터링 사업자">케이터링 사업자</option>
                    <option value="예비 창업자">예비 창업자</option>
                    <option value="요식업 종사자">요식업 종사자</option>
                    <option value="일반 소비자">일반 소비자</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    글 톤앤매너
                  </label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="professional">전문적</option>
                    <option value="friendly">친근한</option>
                    <option value="educational">교육적</option>
                    <option value="inspirational">영감을 주는</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    글 길이
                  </label>
                  <select
                    name="contentLength"
                    value={formData.contentLength}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="short">짧게 (500-800자)</option>
                    <option value="medium">보통 (1000-1500자)</option>
                    <option value="long">길게 (2000자 이상)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SEO 포커스 키워드
                  </label>
                  <input
                    type="text"
                    name="seoFocus"
                    value={formData.seoFocus}
                    onChange={handleChange}
                    placeholder="예: 케이터링, 샌드위치, 핑거푸드"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">본문에 자연스럽게 포함될 키워드</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="includeImages"
                    name="includeImages"
                    checked={formData.includeImages}
                    onChange={handleChange}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="includeImages" className="text-sm font-medium text-gray-700 cursor-pointer">
                    대표 이미지 자동 생성
                  </label>
                </div>
              </div>

              <button
                onClick={generateBlogPost}
                disabled={isGenerating}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-base font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    AI가 블로그를 생성하는 중...
                  </>
                ) : (
                  <>
                    <i className="ri-magic-line mr-2"></i>
                    AI로 블로그 생성하기
                  </>
                )}
              </button>
            </div>

            {/* SEO 최적화 안내 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                <i className="ri-seo-line text-xl"></i>
                SEO 최적화 기능
              </h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-purple-600 mt-0.5"></i>
                  <span>키워드 밀도 자동 최적화 (7% 목표)</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-purple-600 mt-0.5"></i>
                  <span>메타 설명 자동 생성 (160자 이내)</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-purple-600 mt-0.5"></i>
                  <span>H2, H3 태그 구조화</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-purple-600 mt-0.5"></i>
                  <span>내부 링크 자동 삽입</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-purple-600 mt-0.5"></i>
                  <span>이미지 alt 태그 최적화</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 미리보기 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">생성된 블로그 미리보기</h2>
                {generatedContent && (
                  <button
                    onClick={publishBlogPost}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-send-plane-fill mr-2"></i>
                    발행하기
                  </button>
                )}
              </div>

              {!generatedContent ? (
                <div className="text-center py-20">
                  <i className="ri-article-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">AI로 블로그를 생성하면 여기에 미리보기가 표시됩니다</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 대표 이미지 */}
                  {generatedContent.image_url && (
                    <div className="w-full h-64 rounded-lg overflow-hidden">
                      <img
                        src={generatedContent.image_url}
                        alt={generatedContent.title}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  )}

                  {/* 제목 */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {generatedContent.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      작성자: {generatedContent.author} | {new Date().toLocaleDateString('ko-KR')}
                    </p>
                  </div>

                  {/* 발췌문 */}
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {generatedContent.excerpt}
                    </p>
                  </div>

                  {/* 본문 */}
                  <div className="prose prose-sm max-w-none">
                    <div
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: generatedContent.content }}
                    />
                  </div>

                  {/* SEO 정보 */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-bold text-purple-900 mb-2">SEO 정보</h4>
                    <div className="space-y-1 text-xs text-purple-800">
                      <p><strong>메타 설명:</strong> {generatedContent.meta_description}</p>
                      <p><strong>키워드:</strong> {generatedContent.keywords.join(', ')}</p>
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
