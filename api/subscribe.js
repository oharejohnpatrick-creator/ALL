export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const KLAVIYO_API_KEY = 'pk_9245637cf913e59b291db35d6f948bf420';
    const KLAVIYO_LIST_ID = 'VHFtiP';

    try {
        const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'revision': '2023-12-15'
            },
            body: JSON.stringify({
                data: {
                    type: 'profile-subscription-bulk-create-job',
                    attributes: {
                        profiles: {
                            data: [
                                {
                                    type: 'profile',
                                    attributes: {
                                        email: email,
                                        subscriptions: {
                                            email: {
                                                marketing: {
                                                    consent: 'SUBSCRIBED'
                                                }
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    relationships: {
                        list: {
                            data: {
                                type: 'list',
                                id: KLAVIYO_LIST_ID
                            }
                        }
                    }
                }
            })
        });

        const data = await response.json();
        console.log('Klaviyo response:', JSON.stringify(data));
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Klaviyo error:', error);
        return res.status(500).json({ error: 'Failed to subscribe' });
    }
}
