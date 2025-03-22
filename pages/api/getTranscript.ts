import { NextApiRequest, NextApiResponse } from "next";
import { YoutubeTranscript } from "youtube-transcript";

interface TranscriptResponse {
    transcript: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { videoId } = req.body;

    if (!videoId) {
        return res.status(400).json({ error: "Missing videoId" });
    }

    try {
        // Fetch transcript using youtube-transcript package
        const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
        
        // Convert transcript array into a single string
        const transcriptText = transcriptArray.map(entry => entry.text).join(" ");

        return res.status(200).json({ transcript: transcriptText } as TranscriptResponse);
    } catch (error) {
        console.error("Error fetching transcript:", error);
        return res.status(500).json({ error: "Failed to fetch transcript" });
    }
}
