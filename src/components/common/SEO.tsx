
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article' | 'product';
    keywords?: string;
}

export default function SEO({
    title,
    description,
    image,
    type = 'website',
    keywords
}: SEOProps) {
    const location = useLocation();
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://meaningfill.co.kr';
    const currentUrl = `${siteUrl}${location.pathname}`;

    const defaultTitle = '미닝필 | 레시피부터 웹사이트까지, 바로 창업 가능한 케이터링 클래스';
    const defaultDescription = '미닝필은 레시피만 알려주지 않습니다. 대량 조리법, 패키징, 가격 책정, 주문 웹사이트 구축까지 케이터링 창업에 필요한 모든 것을 1:1로 함께 만드는 실전 창업 클래스입니다.';
    const defaultImage = `${siteUrl}/logo.png`;

    const finalTitle = title ? `${title} | 미닝필` : defaultTitle;
    const finalDescription = description || defaultDescription;
    const finalImage = image || defaultImage;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph */}
            <meta property="og:url" content={currentUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:site_name" content="미닝필" />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={finalImage} />
        </Helmet>
    );
}
