import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

// Function to estimate the max tokens dynamically
function estimateMaxTokens(text: string, maxLimit: number = 4096) {
    const words = text.split(/\s+/).length; // Count words
    const estimatedTokens = Math.ceil(words * 1.2); // Convert words to estimated tokens
    return Math.min(estimatedTokens, maxLimit); // Cap at model's max limit
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { transcript } = req.body;

    if (!transcript) {
        return res.status(400).json({ error: "Missing transcript" });
    }

    try {
        console.log("Summarizing Transcript...");
        console.log("Transcript Input:", transcript.slice(0, 100) + "...");

        // Dynamically set max_tokens
        const maxTokens = estimateMaxTokens(transcript, 4096);

        // const response = await openai.chat.completions.create({
        //     model: "gpt-4-turbo",
        //     messages: [
        //         { role: "system", content: "You are an expert summarizer that preserves programming code from technical discussions. Extract and format any code snippets separately from the summary." },
        //         { role: "user", content: `Summarize this YouTube transcript, but make sure to include any programming code in a separate code block:\n\n${transcript}` }
        //     ],
        //     max_tokens: maxTokens,
        // });

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "You are an expert text summarizer. Keep responses concise and well-structured." },
                { role: "user", content: `Summarize this YouTube transcript in an organized format:\n\n${transcript}` }
            ],
            max_tokens: maxTokens,
        });

        console.log("OpenAI Response:", response);

        const summary = response.choices?.[0]?.message?.content?.trim() || "Summary could not be generated.";

        return res.status(200).json({ summary });
    } catch (error: any) {
        console.error("Error summarizing transcript:", error.response?.data || error.message);

        return res.status(500).json({
            error: "Failed to summarize transcript",
            details: error.response?.data || error.message,
        });
    }
}
