
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { format } from 'date-fns';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.VITE_SITE_URL || 'https://meaningfill.co.kr';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
    console.log('🔍 Generating sitemap...');

    // Static routes
    const staticRoutes = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/classes', changefreq: 'weekly', priority: 0.8 },
        { url: '/order', changefreq: 'monthly', priority: 0.8 },
        { url: '/blog', changefreq: 'daily', priority: 0.9 },
        { url: '/portfolio', changefreq: 'weekly', priority: 0.8 },
    ];

    let str = '<?xml version="1.0" encoding="UTF-8"?>\n';
    str += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add Static Routes
    staticRoutes.forEach(route => {
        str += `  <url>\n`;
        str += `    <loc>${siteUrl}${route.url}</loc>\n`;
        str += `    <lastmod>${format(new Date(), 'yyyy-MM-dd')}</lastmod>\n`;
        str += `    <changefreq>${route.changefreq}</changefreq>\n`;
        str += `    <priority>${route.priority}</priority>\n`;
        str += `  </url>\n`;
    });

    // Fetch Public Products
    const { data: products } = await supabase
        .from('products')
        .select('id, updated_at')
        .eq('is_public', true);

    if (products) {
        console.log(`📦 Found ${products.length} products`);
        products.forEach(product => {
            str += `  <url>\n`;
            str += `    <loc>${siteUrl}/classes/${product.id}</loc>\n`;
            str += `    <lastmod>${format(new Date(product.updated_at), 'yyyy-MM-dd')}</lastmod>\n`;
            str += `    <changefreq>weekly</changefreq>\n`;
            str += `    <priority>0.7</priority>\n`;
            str += `  </url>\n`;
        });
    }

    // Fetch Public Blog Posts
    const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, updated_at')
        .eq('is_published', true);

    if (posts) {
        console.log(`📝 Found ${posts.length} blog posts`);
        posts.forEach(post => {
            str += `  <url>\n`;
            str += `    <loc>${siteUrl}/blog/${post.id}</loc>\n`;
            str += `    <lastmod>${format(new Date(post.updated_at), 'yyyy-MM-dd')}</lastmod>\n`;
            str += `    <changefreq>monthly</changefreq>\n`;
            str += `    <priority>0.6</priority>\n`;
            str += `  </url>\n`;
        });
    }

    str += '</urlset>';

    const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, str);
    console.log(`✅ Sitemap generated at ${outputPath}`);
}

generateSitemap().catch(err => {
    console.error('🔥 Error generating sitemap:', err);
    process.exit(1);
});
