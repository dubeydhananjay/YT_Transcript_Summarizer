import { useState } from "react";
import axios from "axios";

interface TranscriptResponse {
    transcript: string;
}

interface SummarizationResponse {
    summary: string;
}

export default function Home() {
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [transcript, setTranscript] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [loadingTranscript, setLoadingTranscript] = useState<boolean>(false);
    const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

    const getVideoId = (url: string): string | null => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        return match ? match[1] : null;
    };

    const handleFetchTranscript = async () => {
        const videoId = getVideoId(videoUrl);
        if (!videoId) {
            alert("Invalid YouTube URL");
            return;
        }

        setLoadingTranscript(true);
        setTranscript("");
        setSummary("");

        try {
            const response = await axios.post<TranscriptResponse>("/api/getTranscript", { videoId });
            setTranscript(response.data.transcript);
        } catch (error) {
            alert("Failed to fetch transcript");
            console.error(error);
        } finally {
            setLoadingTranscript(false);
        }
    };

    const handleSummarize = async () => {
        if (!transcript) {
            alert("No transcript available");
            return;
        }

        setLoadingSummary(true);
        setSummary("");

        try {
            const response = await axios.post<SummarizationResponse>("/api/summarize", { transcript });

            const formattedSummary = response.data.summary.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
            setSummary(formattedSummary);
        } catch (error: any) {
            alert("Failed to summarize transcript: " + error.message);
            console.error(error);
        } finally {
            setLoadingSummary(false);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
            <h2>YouTube Video Transcript Summarizer</h2>
            <input
                type="text"
                placeholder="Paste YouTube Video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <button onClick={handleFetchTranscript} disabled={loadingTranscript}>
                {loadingTranscript ? "Fetching Transcript..." : "Get Transcript"}
            </button>

            {transcript && (
                <>
                    <h3>Transcript:</h3>
                    <p style={{ maxHeight: "150px", overflowY: "scroll", background: "#f8f8f8", padding: "10px", borderRadius: "5px" }}>
                        {transcript}
                    </p>
                    <button onClick={handleSummarize} disabled={loadingSummary}>
                        {loadingSummary ? "Summarizing..." : "Summarize Transcript"}
                    </button>
                </>
            )}

            {loadingSummary && <p>🔄 Generating summary... Please wait.</p>}

            {summary && (
                <>
                    <h3>Summary:</h3>
                    <div dangerouslySetInnerHTML={{ __html: summary }} style={{ background: "#e8f5e9", padding: "10px", borderRadius: "5px" }} />
                </>
            )}
        </div>
    );
}
