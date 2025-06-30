import axios from 'axios';

export const queryChatbot = async (req, res) => {
    try {
        const { prompt, messages = [] } = req.body;
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Clé API OpenRouter manquante' });
        }

        // Prépare l'historique pour OpenRouter
        const formattedMessages = [
            ...messages.map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: prompt }
        ];

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
                messages: formattedMessages,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.CHATBOT_REFERER || 'http://localhost:5173',
                    'X-Title': 'LinkedIn Clone Assistant'
                }
            }
        );

        const botReply = response.data.choices[0].message.content;
        res.json({ response: botReply });
    } catch (error) {
        console.error('Erreur chatbot:', error?.response?.data || error.message);
        res.status(500).json({ error: "Erreur lors de la requête au chatbot" });
    }
}; 