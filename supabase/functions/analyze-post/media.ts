import { openai } from "./deps.ts";
import { SourceMetadata, fetchWithUA } from "./source.ts";

const MAX_VIDEO_BYTES = 12_000_000; // ~12MB safety cap to avoid oversized downloads

const guessMimeFromUrl = (url: string): string => {
  const lower = url.toLowerCase();
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  if (lower.endsWith(".aac")) return "audio/aac";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  return "video/mp4";
};

const readStreamWithLimit = async (
  stream: ReadableStream<Uint8Array>,
  maxBytes: number
): Promise<Uint8Array | null> => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.length;
    if (total > maxBytes) {
      console.log("[media] download aborted, size above limit", total);
      try {
        await reader.cancel();
      } catch {
        // ignore cancellation errors
      }
      return null;
    }
    chunks.push(value);
  }

  const buf = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.length;
  }
  return buf;
};

const downloadBinaryWithLimit = async (
  url: string,
  maxBytes = MAX_VIDEO_BYTES
): Promise<Uint8Array | null> => {
  try {
    const res = await fetchWithUA(url, { redirect: "follow" });
    if (!res.ok || !res.body) {
      console.log("[media] binary fetch failed", url, res.status);
      return null;
    }
    return await readStreamWithLimit(res.body, maxBytes);
  } catch (err) {
    console.log("[media] binary fetch error", url, String(err));
    return null;
  }
};

const transcribeVideo = async (videoUrl: string): Promise<string | null> => {
  console.log("[media] downloading video for transcription", videoUrl);
  const binary = await downloadBinaryWithLimit(videoUrl);
  if (!binary) return null;

  try {
    const file = new File([binary], "clip.mp4", {
      type: guessMimeFromUrl(videoUrl),
    });
    const transcript = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "text",
    });

    const text =
      typeof transcript === "string"
        ? transcript.trim()
        : (transcript as any).text?.trim() ?? null;
    if (text) {
      console.log("[media] transcript length", text.length);
      return text;
    }
  } catch (err) {
    console.log("[media] transcription error", String(err));
  }
  return null;
};

const describeImage = async (imageUrl: string): Promise<string | null> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            "You are a concise visual analyzer for travel and event content. Describe what the place or event looks like, the vibe, crowd, and key visual clues.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "In 2 short sentences, describe the main place/event shown. Mention type of venue, outdoor/indoor, and any visible city or landmark hints.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    });
    const text = completion.choices[0]?.message?.content?.trim() ?? null;
    if (text) {
      console.log("[media] image summary length", text.length);
    }
    return text;
  } catch (err) {
    console.log("[media] image vision error", String(err));
    return null;
  }
};

export type MediaSignals = {
  transcript: string | null;
  imageSummary: string | null;
};

export const extractMediaSignals = async (
  meta: SourceMetadata
): Promise<MediaSignals> => {
  const shouldTranscribe =
    Boolean(meta.video) &&
    (meta.source === "instagram" ||
      meta.source === "facebook" ||
      meta.source === "tiktok");

  const transcriptPromise = shouldTranscribe
    ? transcribeVideo(meta.video as string)
    : Promise.resolve(null);
  const imageSummaryPromise = meta.image
    ? describeImage(meta.image)
    : Promise.resolve(null);

  const [transcript, imageSummary] = await Promise.all([
    transcriptPromise,
    imageSummaryPromise,
  ]);

  return { transcript, imageSummary };
};

const capLength = (value: string, max = 1500) =>
  value.length > max ? `${value.slice(0, max)}…` : value;

export const buildEnhancedDescription = (
  base: string | null,
  signals: MediaSignals
): string | null => {
  const parts = [
    base ?? "",
    signals.transcript ? `Audio mentions: ${capLength(signals.transcript)}` : "",
    signals.imageSummary ? `Visuals: ${capLength(signals.imageSummary, 600)}` : "",
  ]
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;
  return parts.join("\n\n");
};
