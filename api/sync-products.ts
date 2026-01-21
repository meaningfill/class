import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request: VercelRequest, response: VercelResponse) {
    // Only allow POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const merchantId = process.env.GOOGLE_MERCHANT_CENTER_ID;
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        // Handle private key newlines
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!merchantId || !clientEmail || !privateKey) {
            throw new Error('Missing Google Merchant Center environment variables');
        }

        // 1. Authenticate with Google
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/content'],
        });

        const content = google.content({
            version: 'v2.1',
            auth: auth,
        });

        // 2. Fetch Products from Supabase
        const { data: products, error: dbError } = await supabase
            .from('products')
            .select('*');

        if (dbError) throw dbError;
        if (!products || products.length === 0) {
            return response.status(200).json({ message: 'No products found to sync.' });
        }

        const results = [];
        const siteUrl = 'https://meaningfill.co.kr';

        // 3. Sync each product
        for (const product of products) {
            try {
                const productData = {
                    offerId: product.id.toString(),
                    title: product.name,
                    description: product.description || product.name,
                    link: `${siteUrl}/product/${product.id}`,
                    imageLink: product.image_url,
                    contentLanguage: 'ko',
                    targetCountry: 'KR',
                    channel: 'online',
                    availability: 'in stock',
                    condition: 'new',
                    price: {
                        value: product.price.toString(),
                        currency: 'KRW',
                    },
                    brand: '미닝필',
                };

                const res = await content.products.insert({
                    merchantId: merchantId,
                    requestBody: productData,
                });

                results.push({ id: product.id, status: 'success', googleId: res.data.id });
            } catch (err: any) {
                console.error(`Failed to sync product ${product.id}:`, err);
                results.push({ id: product.id, status: 'error', error: err.message });
            }
        }

        const successCount = results.filter(r => r.status === 'success').length;
        const failedCount = results.filter(r => r.status === 'error').length;

        return response.status(200).json({
            success: true,
            uploaded: successCount,
            failed: failedCount,
            products: results,
        });

    } catch (error: any) {
        console.error('Sync Error:', error);
        return response.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
