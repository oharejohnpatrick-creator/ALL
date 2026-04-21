export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, firstName, lastName } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const KLAVIYO_API_KEY = 'pk_83c802ba5065c06c3503c835b06f736264';
    const KLAVIYO_LIST_ID = 'VHFtiP';

    try {
        const profileAttributes = { email };
        if (firstName) profileAttributes.first_name = firstName;
        if (lastName) profileAttributes.last_name = lastName;

        const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'revision': '2023-12-15'
            },
            body: JSON.stringify({
                data: { type: 'profile', attributes: profileAttributes }
            })
        });

        const profileText = await profileRes.text();
        console.log('Profile status:', profileRes.status, profileText);

        let profileId;
        if (profileRes.status === 201) {
            profileId = JSON.parse(profileText).data.id;
        } else if (profileRes.status === 409) {
            profileId = JSON.parse(profileText).errors[0].meta.duplicate_profile_id;
        } else {
            return res.status(500).json({ error: 'Could not create profile' });
        }

        const listRes = await fetch(`https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'revision': '2023-12-15'
            },
            body: JSON.stringify({
                data: [{ type: 'profile', id: profileId }]
            })
        });

        console.log('List add status:', listRes.status);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to subscribe' });
    }
}
