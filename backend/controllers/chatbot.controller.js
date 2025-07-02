import axios from 'axios';

export const queryChatbot = async (req, res) => {
	try {
		const { prompt, messages = [] } = req.body;
		const apiKey = process.env.OPENROUTER_API_KEY;

		if (!apiKey) {
			return res.status(500).json({ error: 'Clé API OpenRouter manquante' });
		}

		// 1️⃣ Réponses personnalisées pour certains messages
		const lowerPrompt = prompt.toLowerCase();
		const predefinedResponses = {
            "bonjour": `Bonjour Future Ingenieur ! Comment puis-je vous aider aujourd’hui ? 😊`,
			"qui es-tu": "Je suis un assistant intelligent développé pour vous aider sur cette plateforme.",
			"aide": "Voici ce que je peux faire : répondre à vos questions, vous guider sur l’utilisation du site, etc.",
			"merci": "Avec plaisir ! N’hésitez pas à me solliciter à nouveau.",
            "about": "Avec plaisir ! Ce portail EMSI a été développé par Azzam Mohamed et Majghirou Mohamed Riyad, deux ingénieurs passionnés par l'innovation digitale. 🚀",

		};

		const matchingKey = Object.keys(predefinedResponses).find(key => lowerPrompt.includes(key));
		if (matchingKey) {
			return res.json({ response: predefinedResponses[matchingKey] });
		}

		// 2️⃣ Préparer l’historique pour OpenRouter
		const formattedMessages = [
			...messages.map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text })),
			{ role: 'user', content: prompt }
		];

		// 3️⃣ Appel à DeepSeek via OpenRouter
		const response = await axios.post(
			'https://openrouter.ai/api/v1/chat/completions',
			{
				model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
				messages: formattedMessages,
			},
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
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
