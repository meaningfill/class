
import { ProductOrder } from './supabase';
import { CartItem } from '../store/useCartStore';

const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL;

export const sendOrderNotification = async (order: ProductOrder) => {
    console.log('Sending Slack notification for order:', order);

    if (!SLACK_WEBHOOK_URL) {
        console.warn('Slack Webhook URL not found. Skipping notification.');
        return false;
    }

    const message = {
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '🎉 새로운 주문이 접수되었습니다!',
                    emoji: true
                }
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*주문 상품:*\n${order.product_name}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*결제 금액:*\n${order.total_price.toLocaleString()}원`
                    }
                ]
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*고객명:*\n${order.customer_name}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*연락처:*\n${order.customer_phone}`
                    }
                ]
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*수량:*\n${order.quantity}개`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*주문 시간:*\n${new Date().toLocaleString('ko-KR')}`
                    }
                ]
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Supabase 관리자 페이지 확인',
                            emoji: true
                        },
                        url: 'https://supabase.com/dashboard/project/_/editor',
                        style: 'primary'
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' // Slack webhooks often behave better with this or no-cors
            },
            body: JSON.stringify(message)
        });

        if (response.ok) {
            console.log('Slack notification sent successfully');
            return true;
        } else {
            // Slack sometimes returns 'ok' string even on 200, but fetch might throw on network error
            console.error('Slack notification failed', await response.text());
            return false;
        }
    } catch (error) {
        console.error('Failed to send Slack notification:', error);
        // In no-cors mode (if needed due to browser) we can't read response, but mostly it works.
        // For client-side, using a proxy or Edge function is better to avoid CORS.
        // However, basic Slack webhooks sometimes block browser requests due to CORS.
        // If CORS is an issue, we must use `no-cors` mode, but then we cannot verify success.

        // Trying no-cors fallback if first attempt fails
        try {
            await fetch(SLACK_WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(message)
            });
            console.log('Slack notification sent (no-cors mode)');
            return true;
        } catch (fallbackError) {
            console.error('Slack notification falback failed:', fallbackError);
            return false;
        }
    }
};

export const sendCartOrderNotification = async (
    items: CartItem[],
    customerName: string,
    customerPhone: string,
    totalPrice: number
) => {
    if (!SLACK_WEBHOOK_URL) return false;

    // Format items list
    const itemsList = items.map(item => `- ${item.name} (${item.quantity}개)`).join('\n');

    const message = {
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '🛒 장바구니 통합 주문 접수',
                    emoji: true
                }
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*고객명:*\n${customerName}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*연락처:*\n${customerPhone}`
                    }
                ]
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*주문 내역 (${items.length}종):*\n${itemsList}`
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*총 결제 예상 금액:*\n${totalPrice.toLocaleString()}원`
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*주문 시간:*\n${new Date().toLocaleString('ko-KR')}`
                }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Supabase 확인',
                            emoji: true
                        },
                        url: 'https://supabase.com/dashboard/project/_/editor',
                        style: 'primary'
                    }
                ]
            }
        ]
    };

    try {
        await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            body: JSON.stringify(message)
        });
        return true;
    } catch (error) {
        // Retry with no-cors if needed
        await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(message)
        });
        return true;
    }
};

export interface WebsiteInquiry {
    name: string;
    email: string;
    phone: string;
    budget: string;
    message: string;
}

export const sendInquiryNotification = async (inquiry: WebsiteInquiry) => {
    console.log('Sending Slack notification for inquiry:', inquiry);

    if (!SLACK_WEBHOOK_URL) {
        console.warn('Slack Webhook URL not found. Skipping notification.');
        return false;
    }

    const message = {
        channel: "C0AATM4M06L",
        username: "미닝필 알림봇",
        icon_emoji: ":memo:",
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '📢 새로운 웹사이트 제작 문의가 접수되었습니다!',
                    emoji: true
                }
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*담당자:*\n${inquiry.name}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*연락처:*\n${inquiry.phone}`
                    }
                ]
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*이메일:*\n${inquiry.email}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*예산 범위:*\n${inquiry.budget === '1000+' ? '1,000만원 이상' : inquiry.budget.replace('-', '만원 ~ ') + '만원'}`
                    }
                ]
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*문의 내용:*\n${inquiry.message}`
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*접수 시간:*\n${new Date().toLocaleString('ko-KR')}`
                }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Supabase 관리자 페이지 확인',
                            emoji: true
                        },
                        url: 'https://supabase.com/dashboard/project/_/editor',
                        style: 'primary'
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: JSON.stringify(message)
        });

        if (response.ok) {
            console.log('Slack inquiry notification sent successfully');
            return true;
        } else {
            console.error('Slack notification failed', await response.text());
            return false;
        }
    } catch (error) {
        console.error('Failed to send Slack notification:', error);
        try {
            await fetch(SLACK_WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(message)
            });
            console.log('Slack notification sent (no-cors mode)');
            return true;
        } catch (fallbackError) {
            console.error('Slack notification falback failed:', fallbackError);
            return false;
        }
    }
};
