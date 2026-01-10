import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../services/supabase';
import { products as mockProducts } from '../../utils/mocks/products';

const GEMINI_API_KEY = import.meta.env.VITE_API_KEY as string | undefined;
const GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-2.0-flash';

type ProductForm = {
  name: string;
  description: string;
  detailed_description: string;
  price: number;
  image_url: string;
  event_type: string;
  features: string;
  ingredients: string;
  suitable_for: string;
  components: string;
  recommended_events: string;
  options: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  show_on_home: boolean;
  home_order: number | null;
};

const emptyForm = (): ProductForm => ({
  name: '',
  description: '',
  detailed_description: '',
  price: 0,
  image_url: '',
  event_type: '',
  features: '',
  ingredients: '',
  suitable_for: '',
  components: '',
  recommended_events: '',
  options: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  show_on_home: false,
  home_order: null,
});

const buildSeoPrompt = (form: ProductForm) => `
너는 케이터링/요식업 상품 상세를 작성하는 SEO 에디터다.

아래 정보로 상품명을 유지 또는 개선하고,
검색에 잘 노출되도록 설명과 키워드를 작성해줘.
반드시 JSON만 출력.

상품명(현재): ${form.name}
카테고리: ${form.event_type}
한줄 설명: ${form.description}
상세 설명: ${form.detailed_description}
구성: ${form.ingredients || form.components}
추천 행사: ${form.suitable_for || form.recommended_events}

JSON:
{
  "name": "string",
  "description": "string (한 줄 요약)",
  "detailed_description": "string (2~4문장)",
  "features": ["string","string","string"],
  "seo_title": "string",
  "seo_description": "string",
  "seo_keywords": "string (쉼표 구분)"
}
`.trim();

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

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingSeo, setGeneratingSeo] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState<ProductForm>(emptyForm());
  const navigate = useNavigate();
  const expectedCounts: Record<string, number> = {
    '단품메뉴': 12,
    '1인박스(커스텀메뉴)': 20,
  };

  const countsByType = products.reduce<Record<string, number>>((acc, product) => {
    const key = product.event_type || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const expectedEntries = Object.entries(expectedCounts);

  useEffect(() => {
    checkUser();
    loadProducts();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('사용자 확인 실패:', error);
      navigate('/admin/login');
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error('상품 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      detailed_description: product.detailed_description || '',
      price: product.price,
      image_url: product.image_url,
      event_type: product.event_type || '',
      features: (product.features || []).join(', '),
      ingredients: (product.ingredients || []).join(', '),
      suitable_for: (product.suitable_for || []).join(', '),
      components: (product.components || []).join(', '),
      recommended_events: (product.recommended_events || []).join(', '),
      options: product.options ? JSON.stringify(product.options, null, 2) : '',
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      seo_keywords: product.seo_keywords || '',
      show_on_home: product.show_on_home ?? false,
      home_order: product.home_order ?? null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 상품을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter((product) => product.id !== id));
      alert('상품이 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);

    try {
      let parsedOptions: { name: string; values: string[] }[] | null = null;
      if (formData.options.trim()) {
        try {
          parsedOptions = JSON.parse(formData.options);
        } catch {
          alert('옵션 JSON 형식이 올바르지 않습니다.');
          setSaving(false);
          return;
        }
      }
      const payload = {
        name: formData.name,
        description: formData.description,
        detailed_description: formData.detailed_description,
        price: formData.price,
        image_url: formData.image_url,
        event_type: formData.event_type,
        features: formData.features.split(',').map((v) => v.trim()).filter(Boolean),
        ingredients: formData.ingredients.split(',').map((v) => v.trim()).filter(Boolean),
        suitable_for: formData.suitable_for.split(',').map((v) => v.trim()).filter(Boolean),
        components: formData.components.split(',').map((v) => v.trim()).filter(Boolean),
        recommended_events: formData.recommended_events.split(',').map((v) => v.trim()).filter(Boolean),
        options: parsedOptions,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        seo_keywords: formData.seo_keywords,
        show_on_home: formData.show_on_home,
        home_order: formData.home_order,
      };

      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id);

      if (error) throw error;
      alert('상품이 수정되었습니다.');
      setShowModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSeo = async () => {
    setGeneratingSeo(true);
    try {
      const result = await callGeminiJson(buildSeoPrompt(formData));
      setFormData((prev) => ({
        ...prev,
        name: result.name || prev.name,
        description: result.description || prev.description,
        detailed_description: result.detailed_description || prev.detailed_description,
        features: Array.isArray(result.features) ? result.features.join(', ') : prev.features,
        seo_title: result.seo_title || prev.seo_title,
        seo_description: result.seo_description || prev.seo_description,
        seo_keywords: result.seo_keywords || prev.seo_keywords,
      }));
    } catch (error: any) {
      console.error('SEO 생성 실패:', error);
      alert(error.message || 'SEO 생성 실패');
    } finally {
      setGeneratingSeo(false);
    }
  };

  const handleImportMeaningfill = async () => {
    if (importing) return;
    setImporting(true);
    try {
      const { data } = await supabase.from('products').select('name, event_type');
      const normalizeKey = (name: string, eventType: string) =>
        `${name.trim().toLowerCase()}|${eventType.trim().toLowerCase()}`;
      const existingKeys = new Set(
        (data || []).map((item: { name: string; event_type?: string }) =>
          normalizeKey(item.name || '', item.event_type || '')
        )
      );
      let sourceItems: any[] = [];
      try {
        const response = await fetch('/meaningfill-products.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('meaningfill-products.json not found');
        }
        const json = await response.json();
        if (!Array.isArray(json)) {
          throw new Error('meaningfill-products.json is not an array');
        }
        sourceItems = json;
      } catch (error) {
        console.error('Failed to load meaningfill-products.json:', error);
        sourceItems = mockProducts.map((item) => ({
          name: item.title,
          description: item.description,
          detailed_description: item.detailed_description,
          price: item.price_number,
          image_url: item.image_url,
          event_type: item.event_type,
          features: item.features,
          ingredients: item.ingredients,
          suitable_for: item.suitable_for,
          components: item.ingredients,
          recommended_events: item.suitable_for,
          seo_title: item.title,
          seo_description: item.description,
          seo_keywords: item.event_type,
          show_on_home: true,
          home_order: item.id,
          options: item.options,
        }));
      }

      const payload = sourceItems
        .filter((item) => {
          const name = item.name || item.title || '';
          const eventType = item.event_type || '';
          if (!name) return false;
          const key = normalizeKey(name, eventType);
          return !existingKeys.has(key);
        })
        .map((item) => ({
          name: item.name || item.title,
          description: item.description || item.name || item.title,
          detailed_description: item.detailed_description || item.description || item.name || item.title,
          price: Number(item.price ?? item.price_number) || 0,
          image_url: item.image_url || '',
          event_type: (item.event_type || '').trim(),
          features: Array.isArray(item.features) ? item.features : [],
          ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
          suitable_for: Array.isArray(item.suitable_for) ? item.suitable_for : [],
          components: Array.isArray(item.components) ? item.components : [],
          recommended_events: Array.isArray(item.recommended_events) ? item.recommended_events : [],
          seo_title: item.seo_title || item.name || item.title,
          seo_description: item.seo_description || item.description || item.name || item.title,
          seo_keywords: item.seo_keywords || item.event_type || '',
          show_on_home: item.show_on_home ?? true,
          home_order: item.home_order ?? null,
          options: Array.isArray(item.options) ? item.options : [],
        }));

      if (payload.length === 0) {
        alert('이미 등록된 상품입니다.');
        return;
      }

      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;

      alert('meaningfill 상품을 가져왔습니다.');
      loadProducts();
    } catch (error: any) {
      console.error('상품 가져오기 실패:', error);
      alert(error?.message || '상품 가져오기에 실패했습니다.');
    } finally {
      setImporting(false);
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <h1 className="text-xl font-bold text-gray-900">케이터링 주문 상품 관리</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleImportMeaningfill}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap text-sm"
                disabled={importing}
              >
                {importing ? '가져오는 중...' : 'meaningfill 상품 가져오기'}
              </button>
              <button
                onClick={() => navigate('/admin/products-ai')}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all whitespace-nowrap font-semibold"
              >
                <i className="ri-robot-line mr-2"></i>
                AI 상품 자동 생성
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Meaningfill Sync Status</h2>
              <p className="text-sm text-gray-500">Counts are checked against expected category totals.</p>
            </div>
            <div className="text-xs text-gray-400">Expected: 12 / 20</div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expectedEntries.map(([label, expected]) => {
              const actual = countsByType[label] || 0;
              const ok = actual >= expected;
              return (
                <div key={label} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                  <span className="font-medium text-gray-800">{label}</span>
                  <span className={`font-semibold ${ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {actual} / {expected}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-shopping-bag-line text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">등록된 상품이 없습니다</h3>
            <p className="text-gray-600 mb-6">meaningfill 상품을 가져오거나 AI로 생성해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{product.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.show_on_home ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                      {product.show_on_home ? 'home' : '숨김'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600 mb-3">
                    {product.price.toLocaleString()}원
                  </p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap text-sm"
                    >
                      <i className="ri-edit-line mr-1"></i>
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap text-sm"
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">상품 수정</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 whitespace-nowrap">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상품명</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <input
                    type="text"
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">대표 이미지 URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="미리보기" className="mt-3 w-full h-48 object-cover rounded-xl border border-gray-200" />
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">가격(원)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.show_on_home}
                      onChange={(e) => setFormData({ ...formData, show_on_home: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    home
                  </label>
                  <input
                    type="number"
                    value={formData.home_order ?? ''}
                    onChange={(e) => setFormData({ ...formData, home_order: e.target.value ? Number(e.target.value) : null })}
                    placeholder="노출 순서"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상품 요약</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상품 상세 설명</label>
                <textarea
                  value={formData.detailed_description}
                  onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주요 특징 (쉼표 구분)</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">구성 (쉼표 구분)</label>
                  <textarea
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">추천 행사 (쉼표 구분)</label>
                  <textarea
                    value={formData.suitable_for}
                    onChange={(e) => setFormData({ ...formData, suitable_for: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">구성 상세 (쉼표 구분)</label>
                  <textarea
                    value={formData.components}
                    onChange={(e) => setFormData({ ...formData, components: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">추천 행사(보조) (쉼표 구분)</label>
                <textarea
                  value={formData.recommended_events}
                  onChange={(e) => setFormData({ ...formData, recommended_events: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">옵션(JSON)</label>
                <textarea
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-xs"
                  rows={4}
                  placeholder='[{"name":"옵션명","values":["옵션1","옵션2"]}]'
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO 제목</label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO 키워드</label>
                  <input
                    type="text"
                    value={formData.seo_keywords}
                    onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO 설명</label>
                <textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleGenerateSeo}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors whitespace-nowrap"
                  disabled={generatingSeo}
                >
                  {generatingSeo ? 'SEO 생성 중...' : 'SEO 자동 생성'}
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                    disabled={saving}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
                    disabled={saving}
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
