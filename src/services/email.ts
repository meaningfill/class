// Email Service using FormSubmit.co (Simpler, No API Keys needed)

// ⚠️ CHANGE THIS TO YOUR ADMIN EMAIL ADDRESS
const ADMIN_EMAIL = 'master@orderbuilder.co.kr';

interface EmailData {
    type: string;
    name: string;
    email: string;
    phone: string;
    content: string;
}

export const sendEmailNotification = async (data: EmailData) => {
    try {
        const endpoint = `https://formsubmit.co/ajax/${ADMIN_EMAIL}`;

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `[Order Builder] ${data.type} - ${data.name}님`,
                _template: 'table', // Uses a nice table format
                _captcha: "false",  // Disable captcha for direct API usage

                // Actual Content
                유형: data.type,
                이름: data.name,
                연락처: data.phone,
                이메일: data.email,
                내용: data.content
            })
        });

        const result = await response.json();
        console.log('Email sent successfully:', result);
        return result;

    } catch (error) {
        console.error('Failed to send email:', error);
        // Don't throw error to allow the flow to continue
    }
};
