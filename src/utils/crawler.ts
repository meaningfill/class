import * as cheerio from 'cheerio';

interface ProductData {
    title: string;
    price: number;
    imageUrl: string;
    description: string;
    detailedHtml: string; // 상세 페이지 HTML (이미지 등)
}

export const crawlProduct = async (url: string): Promise<ProductData> => {
    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        const html = data.contents;

        if (!html) throw new Error('HTML을 가져오지 못했습니다.');

        const $ = cheerio.load(html);

        // --- Basic Info ---
        let title = $('meta[property="og:title"]').attr('content') || '';
        let imageUrl = $('meta[property="og:image"]').attr('content') || '';
        let description = $('meta[property="og:description"]').attr('content') || '';
        let priceText = $('meta[property="product:price:amount"]').attr('content') ||
            $('meta[property="og:price:amount"]').attr('content') || '';

        // Fallback for Title
        if (!title) {
            title = $('h1').first().text().trim() ||
                $('.product_title').text().trim() ||
                $('.goods_name').text().trim();
        }

        // Fallback for Image
        if (!imageUrl) {
            imageUrl = $('.woocommerce-product-gallery__image img').attr('src') ||
                $('.thumbnail img').attr('src') ||
                $('#mainImage').attr('src') || '';
        }

        // Fallback for Price
        if (!priceText) {
            const priceSelectors = ['.price', '.amount', '.goods_price', '.sale_price', '.final-price'];
            for (const selector of priceSelectors) {
                const text = $(selector).text().trim();
                if (text && /\d/.test(text)) {
                    priceText = text;
                    break;
                }
            }
        }

        const price = priceText ? parseInt(priceText.replace(/[^0-9]/g, ''), 10) : 0;

        // --- Detailed Content (Images) ---
        // Cafe24, SmartStore etc. often use specific containers.
        // Priority: .edibot-product-detail (Cafe24 Editor), #prdDetail, .cont, .detial_view
        let detailedHtml = '';
        const detailSelectors = [
            '.edibot-product-detail', // Cafe24 Smart Editor
            '#prdDetail',             // Cafe24 Default
            '#product_detail',        // Common
            '.detail_view',           // Common
            '.goods_view'             // Common
        ];

        let $detailArea = null;
        for (const selector of detailSelectors) {
            if ($(selector).length > 0) {
                $detailArea = $(selector);
                break;
            }
        }

        if ($detailArea) {
            // Extract all images inside the detail area
            const images: string[] = [];
            $detailArea.find('img').each((_, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('ec-data-src');
                if (src && !src.includes('clear.gif') && !src.includes('blank.gif')) {
                    // Absolute URL conversion if needed (often Cafe24 images are full URLs or protocol-relative)
                    // Simple check
                    if (src.startsWith('//')) images.push(`https:${src}`);
                    else if (src.startsWith('http')) images.push(src);
                    // skipping relative paths for now as proxy makes it hard to resolve, 
                    // but usually ecommerce detail images are absolute or protocol-relative CDN links.
                }
            });

            // Remove duplicates
            const uniqueImages = Array.from(new Set(images));

            // Build HTML
            if (uniqueImages.length > 0) {
                detailedHtml = uniqueImages.map(img => `<img src="${img}" class="w-full h-auto mb-2 rounded-lg" alt="상세이미지" />`).join('');
            } else {
                // Try text extraction if no images?
                // detailedHtml = $detailArea.html() || ''; 
                // Sticking to images for now as requested.
            }
        }

        return {
            title: title || '제목 없음',
            price: isNaN(price) ? 0 : price,
            imageUrl: imageUrl || '',
            description: description || '설명 없음',
            detailedHtml,
        };

    } catch (error) {
        console.error('Crawling failed:', error);
        throw new Error('크롤링에 실패했습니다. URL을 확인해주세요.');
    }
};
