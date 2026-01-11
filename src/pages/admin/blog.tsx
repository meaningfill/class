import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { BlogPost } from '../../services/supabase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AdminNavbar from './components/AdminNavbar';

const GEMINI_API_KEY = import.meta.env.VITE_API_KEY as string | undefined;
const GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-2.0-flash';
const MIN_CONTENT_CHARS = 3000;

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image_url: '',
    author: 'Master',
    published_at: new Date().toISOString().split('T')[0],
    reference_url: '',
    reference_content: '',
  });

  useEffect(() => {
    checkAuth();
    loadPosts();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate('/admin/login');
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('블로그 포스트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const buildRewritePrompt = (title: string, excerpt: string, refUrl: string, refContent: string) => `
너는 케이터링/요식업 전문 블로그 에디터다.

아래 제목과 참고 자료를 바탕으로 본문을 작성해.
- 최소 ${MIN_CONTENT_CHARS}자 이상
- 한국어
- 팩트 기반의 유익한 정보 포함
- JSON만 출력

제목: ${title}
기존 요약: ${excerpt}
참고 URL: ${refUrl}
참고 내용: ${refContent}

HTML 스타일 (Tailwind CSS):
h1: class="text-3xl font-bold text-gray-900 mb-6"
h2: class="text-2xl font-bold text-gray-800 mt-10 mb-4 border-b-2 border-purple-500 pb-2"
h3: class="text-xl font-semibold text-gray-800 mt-6 mb-3"
p: class="text-base text-gray-700 leading-relaxed mb-4"
ul/ol: class="list-disc list-inside space-y-2 mb-6 ml-4 text-gray-700"
blockquote: class="border-l-4 border-purple-400 pl-4 py-2 my-4 bg-purple-50 italic text-gray-700"
img: class="rounded-xl shadow-lg my-6 w-full object-cover max-h-[500px]"

JSON:
{
  "content_html": "string"
}
  `.trim();

  // Quill Modules for Image Handling (Standard)
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const handleRegenerateToQueue = async (post: BlogPost) => {
    if (regeneratingId) return;
    setRegeneratingId(post.id);

    try {
      const result = await callGeminiJson(buildRewritePrompt(post.title, post.excerpt, '', '')); // Regenerate mode doesn't have ref yet
      // For now, simplify or pass default. Existing regeneration logic just rewrites based on title.
      // Or pass empty string if user didn't provide new refs.
      const contentHtml = result.content_html || '';
      const contentLength = stripHtml(contentHtml).length;
      if (contentLength < MIN_CONTENT_CHARS) {
        throw new Error(`본문 길이가 ${MIN_CONTENT_CHARS}자 미만입니다. (${contentLength}자)`);
      }

      const seoScore = calculateSeoScore(contentHtml, post.excerpt, post.title);

      const payload = {
        source_post_id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content_html: contentHtml,
        meta_description: post.excerpt,
        image_url: post.image_url,
        author: 'Master',
        tags: [],
        seo_score: seoScore,
        status: 'pending_review',
        thread_text: `[1/3] ${post.title}\n\n${post.excerpt}\n\n자세히 보기: (발행 후 URL 입력)`,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('publish_queue').insert([payload]);
      if (error) throw error;

      alert('검수 큐에 등록되었습니다.');
    } catch (error: any) {
      console.error('자동 생성 실패:', error);
      alert(error.message || '자동 생성 실패');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('이미지 업로드 실패:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image_url;

      // 이미지 파일이 있으면 업로드
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        image_url: imageUrl,
        author: 'Master',
        published_at: formData.published_at,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
        alert('블로그 포스트가 수정되었습니다.');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);
        if (error) throw error;
        alert('블로그 포스트가 발행되었습니다.');
      }

      setShowModal(false);
      setEditingPost(null);
      resetForm();
      loadPosts();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      image_url: post.image_url,
      author: 'Master',
      published_at: post.published_at.split('T')[0],
      reference_url: '',
      reference_content: '',
    });
    setImagePreview(post.image_url);
    setImageFile(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      image_url: '',
      author: 'Master',
      published_at: new Date().toISOString().split('T')[0],
      reference_url: '',
      reference_content: '',
    });
    setImageFile(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <i className="ri-loader-4-line text-4xl text-amber-600 animate-spin"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/dashboard')} className="text-gray-600 hover:text-gray-900 whitespace-nowrap">
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <h1 className="text-xl font-bold text-gray-900">블로그 관리</h1>
            </div>
            <button
              onClick={() => {
                setEditingPost(null);
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              포스트 생성
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span><i className="ri-user-line mr-1"></i>Master</span>
                      <span><i className="ri-calendar-line mr-1"></i>{new Date(post.published_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(post)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
                      >
                        <i className="ri-edit-line mr-1"></i>
                        수정
                      </button>
                      <button
                        onClick={() => handleRegenerateToQueue(post)}
                        disabled={regeneratingId === post.id}
                        className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm whitespace-nowrap disabled:opacity-60"
                      >
                        <i className="ri-magic-line mr-1"></i>
                        {regeneratingId === post.id ? '생성 중...' : '검수큐 재생성'}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line mr-1"></i>
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-article-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">생성된 블로그 포스트가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPost ? '포스트 수정' : '포스트 생성'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 whitespace-nowrap">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">요약</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                <div className="bg-white rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    modules={modules}
                    className="h-96"
                  />
                </div>
              </div>
              <div className="pt-12"> {/* Quill Toolbar Spacing Fix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">참고 URL (AI 생성용)</label>
                    <input
                      type="text"
                      value={(formData as any).reference_url}
                      onChange={(e) => setFormData({ ...formData, reference_url: e.target.value } as any)}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">참고 텍스트/메모</label>
                    <input
                      type="text"
                      value={(formData as any).reference_content}
                      onChange={(e) => setFormData({ ...formData, reference_content: e.target.value } as any)}
                      placeholder="AI에게 전달할 핵심 내용"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">작성자</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">발행일</label>
                  <input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">대표 이미지</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition-colors text-center">
                        <i className="ri-upload-cloud-line text-2xl text-gray-400 mb-2"></i>
                        <p className="text-sm text-gray-600">
                          {imageFile ? imageFile.name : '이미지를 선택해주세요 (최대 5MB)'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imagePreview}
                        alt="미리보기"
                        className="w-full h-full object-cover object-top"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setFormData({ ...formData, image_url: '' });
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    JPG, PNG, GIF 형식 지원 (최대 5MB)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                  disabled={uploading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      저장 중...
                    </>
                  ) : (
                    editingPost ? '수정' : '발행'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
