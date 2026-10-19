export interface WordTiming {
  text: string;
  tr: [number, number]; // [startSec, endSec] relative to clip start
  highlight?: "primary" | "secondary" | null;
}

export interface ScreenplayLine {
  id: string;
  type: "verbal" | "visual";
  speaker?: string;
  text: string;
  tr: [number, number];
  words?: WordTiming[];
}

export interface ClipScreenplay {
  chapters: Array<{
    id: string;
    title: string;
    lines: ScreenplayLine[];
  }>;
}

export interface ClipJudgeResult {
  score: number;
  curvedScore: number;
  hookScore: number;
  hookComment: string;
  coherenceScore: number;
  coherenceComment: string;
  connectionScore: number;
  connectionComment: string;
  trendScore: number;
  trendComment: string;
  relevanceScore: number;
}

export interface BrandTemplateConfig {
  aspectRatio: "9:16" | "1:1" | "16:9";
  layoutMode: "fill" | "fit" | "split";
  presetKey: "karaoke" | "beasty" | "mozi" | "deep-diver" | "popline";
  captionLines: "1" | "3";
  captionPosition: "auto" | "top" | "middle" | "bottom";
  autoHeadline: boolean;
  headlineText: string;
  pinFirstSpeaker: boolean;
  overlayLogoUrl: string;
  introOutroEnabled: boolean;
  musicTrack: string;
  removeFillerWords: boolean;
  removePauses: boolean;
  keywordsHighlighter: boolean;
  aiEmojis: boolean;
  autoBroll: boolean;
  autoTransitions: boolean;
  autoZoom: boolean;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontColor: string;
  animation: "Bounce" | "Pop" | "Fade" | "Slide" | "None";
  uppercase: boolean;
  highlightPrimary: string;
  highlightSecondary: string;
  shadowColor: string;
  strokeWidth: number;
  strokeColor: string;
}

export const DEFAULT_BRAND_TEMPLATES: Array<{
  name: string;
  isDefault: boolean;
  presetKey: BrandTemplateConfig["presetKey"];
  aspectRatio: BrandTemplateConfig["aspectRatio"];
  layoutMode: BrandTemplateConfig["layoutMode"];
  config: BrandTemplateConfig;
}> = [
  {
    name: "Default Preset (Karaoke Neon)",
    isDefault: true,
    presetKey: "karaoke",
    aspectRatio: "9:16",
    layoutMode: "fill",
    config: {
      aspectRatio: "9:16",
      layoutMode: "fill",
      presetKey: "karaoke",
      captionLines: "3",
      captionPosition: "auto",
      autoHeadline: true,
      headlineText: "VIRAL HIGHLIGHT",
      pinFirstSpeaker: false,
      overlayLogoUrl: "",
      introOutroEnabled: false,
      musicTrack: "Upbeat Synth Pulse",
      removeFillerWords: true,
      removePauses: true,
      keywordsHighlighter: true,
      aiEmojis: true,
      autoBroll: true,
      autoTransitions: true,
      autoZoom: true,
      fontFamily: "Montserrat",
      fontSize: 40,
      fontWeight: "900",
      fontColor: "#FFFFFF",
      animation: "Bounce",
      uppercase: true,
      highlightPrimary: "#04F827",
      highlightSecondary: "#FFFD03",
      shadowColor: "#000000",
      strokeWidth: 4,
      strokeColor: "#000000",
    },
  },
  {
    name: "Beasty Impact",
    isDefault: false,
    presetKey: "beasty",
    aspectRatio: "9:16",
    layoutMode: "fill",
    config: {
      aspectRatio: "9:16",
      layoutMode: "fill",
      presetKey: "beasty",
      captionLines: "1",
      captionPosition: "middle",
      autoHeadline: true,
      headlineText: "WAIT FOR THE END 🔥",
      pinFirstSpeaker: false,
      overlayLogoUrl: "",
      introOutroEnabled: false,
      musicTrack: "High Octane Trap",
      removeFillerWords: true,
      removePauses: true,
      keywordsHighlighter: true,
      aiEmojis: true,
      autoBroll: true,
      autoTransitions: true,
      autoZoom: true,
      fontFamily: "Anton",
      fontSize: 46,
      fontWeight: "900",
      fontColor: "#FFFFFF",
      animation: "Pop",
      uppercase: true,
      highlightPrimary: "#FFFD03",
      highlightSecondary: "#FF3B30",
      shadowColor: "#000000",
      strokeWidth: 6,
      strokeColor: "#000000",
    },
  },
  {
    name: "Mozi Business Authority",
    isDefault: false,
    presetKey: "mozi",
    aspectRatio: "9:16",
    layoutMode: "split",
    config: {
      aspectRatio: "9:16",
      layoutMode: "split",
      presetKey: "mozi",
      captionLines: "3",
      captionPosition: "bottom",
      autoHeadline: false,
      headlineText: "FOUNDER PLAYBOOK",
      pinFirstSpeaker: true,
      overlayLogoUrl: "",
      introOutroEnabled: false,
      musicTrack: "Deep Focus Lo-Fi",
      removeFillerWords: true,
      removePauses: true,
      keywordsHighlighter: true,
      aiEmojis: true,
      autoBroll: true,
      autoTransitions: true,
      autoZoom: true,
      fontFamily: "Inter",
      fontSize: 38,
      fontWeight: "800",
      fontColor: "#FFFFFF",
      animation: "Bounce",
      uppercase: true,
      highlightPrimary: "#22C55E",
      highlightSecondary: "#FACC15",
      shadowColor: "#000000",
      strokeWidth: 4,
      strokeColor: "#000000",
    },
  },
  {
    name: "Deep Diver Documentary",
    isDefault: false,
    presetKey: "deep-diver",
    aspectRatio: "9:16",
    layoutMode: "fit",
    config: {
      aspectRatio: "9:16",
      layoutMode: "fit",
      presetKey: "deep-diver",
      captionLines: "3",
      captionPosition: "bottom",
      autoHeadline: true,
      headlineText: "THE HIDDEN TRUTH",
      pinFirstSpeaker: false,
      overlayLogoUrl: "",
      introOutroEnabled: false,
      musicTrack: "Cinematic Tension",
      removeFillerWords: false,
      removePauses: true,
      keywordsHighlighter: true,
      aiEmojis: false,
      autoBroll: true,
      autoTransitions: true,
      autoZoom: false,
      fontFamily: "Oswald",
      fontSize: 36,
      fontWeight: "700",
      fontColor: "#F8FAFC",
      animation: "Fade",
      uppercase: false,
      highlightPrimary: "#38BDF8",
      highlightSecondary: "#A855F7",
      shadowColor: "#000000",
      strokeWidth: 3,
      strokeColor: "#000000",
    },
  },
  {
    name: "Popline Clean Minimal",
    isDefault: false,
    presetKey: "popline",
    aspectRatio: "9:16",
    layoutMode: "fill",
    config: {
      aspectRatio: "9:16",
      layoutMode: "fill",
      presetKey: "popline",
      captionLines: "3",
      captionPosition: "bottom",
      autoHeadline: false,
      headlineText: "",
      pinFirstSpeaker: false,
      overlayLogoUrl: "",
      introOutroEnabled: false,
      musicTrack: "None",
      removeFillerWords: true,
      removePauses: false,
      keywordsHighlighter: true,
      aiEmojis: false,
      autoBroll: false,
      autoTransitions: false,
      autoZoom: true,
      fontFamily: "Rubik",
      fontSize: 36,
      fontWeight: "700",
      fontColor: "#FFFFFF",
      animation: "Slide",
      uppercase: false,
      highlightPrimary: "#A855F7",
      highlightSecondary: "#04F827",
      shadowColor: "#000000",
      strokeWidth: 2,
      strokeColor: "#000000",
    },
  },
];

export function scoreToGrade(score: number): string {
  if (score >= 96) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 78) return "B+";
  if (score >= 70) return "B";
  return "B-";
}

export function buildWordsFromTranscript(
  text: string,
  durationSec = 30
): WordTiming[] {
  const tokens = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return [];

  const step = Math.max(0.18, durationSec / tokens.length);
  const powerWords = new Set([
    "viral",
    "million",
    "billion",
    "secret",
    "strategy",
    "growth",
    "hook",
    "money",
    "city",
    "merch",
    "brand",
    "empire",
    "ai",
    "Retention",
    "creators",
    "insane",
    "number",
    "best",
  ]);

  return tokens.map((word, idx) => {
    const clean = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const start = Number((idx * step).toFixed(2));
    const end = Number(((idx + 1) * step).toFixed(2));
    let highlight: WordTiming["highlight"] = null;
    if (powerWords.has(clean) || idx % 9 === 3) {
      highlight = "primary";
    } else if (idx % 11 === 5) {
      highlight = "secondary";
    }
    return {
      text: word,
      tr: [start, end],
      highlight,
    };
  });
}

export interface CurateClipsInput {
  projectTitle: string;
  genre?: string;
  customPrompt?: string;
  topicKeywords?: string[];
  videoUrl: string;
  thumbnailUrl: string;
  durationMs?: number;
}

export function curateClipsForProject(input: CurateClipsInput) {
  const baseTitle = input.projectTitle.trim() || "Creator Studio Session";
  const promptText = input.customPrompt?.trim() || "Extract highest virality hooks and actionable insights";
  const genre = input.genre || "Podcast";

  const templates = [
    {
      rank: 1,
      score: 99,
      hookGrade: "A+",
      flowGrade: "A",
      valueGrade: "A",
      trendGrade: "A-",
      title: `The Unfiltered Truth About ${baseTitle.slice(0, 38)} (Why 99% Miss This)`,
      hashtags: "#viralclips #creatorstrategy #podcastclips #opusclip #growthhacks",
      startMs: 18000,
      endMs: 62000,
      sceneAnalysisText:
        "Two speakers sit in a high-contrast studio setup with warm key lighting. Speaker A leans forward toward the microphone while gesturing emphatically with both hands. A close-up camera cut captures Speaker B's immediate surprised reaction before a dynamic B-roll overlay illustrates the revenue growth chart.",
      transcriptText:
        "Look, everybody thinks the algorithm is working against them, but the real secret is the first three seconds of visual momentum. When we rebuilt our content engine around high-retention hooks and micro-stories, our organic reach jumped to over fifteen million views in thirty days without spending a single dollar on ads.",
      hookComment: "Opens with a contrarian Pattern Interrupt that immediately challenges viewer assumptions.",
      coherenceComment: "Tightly structured problem -> revelation -> proof arc with zero filler pauses.",
      connectionComment: "Direct second-person framing creates high save and share intent for creators.",
      trendComment: "Strong alignment with short-form retention and creator economy search trends.",
    },
    {
      rank: 2,
      score: 96,
      hookGrade: "A",
      flowGrade: "A",
      valueGrade: "A-",
      trendGrade: "A-",
      title: `How One Simple Framework Turned ${genre} Content Into a Viral Machine`,
      hashtags: "#contentframework #shortformvideo #youtubegrowth #founderstory",
      startMs: 74000,
      endMs: 122000,
      sceneAnalysisText:
        "Medium two-shot of the host holding up a notebook diagram toward the main lens. The framing automatically tracks the active speaker in 9:16 portrait while kinetic green-and-yellow karaoke captions highlight key metrics at the bottom third.",
      transcriptText:
        "Here is the exact three-step playbook we use before we ever hit record. First, write the payoff sentence before you write the intro. Second, cut every single transition pause over a quarter second. Third, pair spoken numbers with visual B-roll so the viewer's brain resets attention every six seconds.",
      hookComment: "Promises a concrete 3-step tactical framework in the opening sentence.",
      coherenceComment: "Sequential numbering (First, Second, Third) keeps completion rate above 88%.",
      connectionComment: "Actionable checklist format drives high bookmark-to-view ratios.",
      trendComment: "Tactical educational shorts outperform general commentary by 2.4x.",
    },
    {
      rank: 3,
      score: 93,
      hookGrade: "A-",
      flowGrade: "A",
      valueGrade: "A-",
      trendGrade: "B+",
      title: `"Nobody Wanted to Hear This..." — The Biggest Mistake New Teams Make`,
      hashtags: "#startupadvice #teamculture #behindthescenes #podcastmoments",
      startMs: 135000,
      endMs: 179000,
      sceneAnalysisText:
        "Split-screen 9:16 reframe showing the main speaker on the top half and the co-host nodding in the bottom frame. Subtle camera zoom-in builds emotional emphasis during the punchline.",
      transcriptText:
        "When we started scaling the studio, people told us to hire twenty editors and slow down our publishing cadence. We did the exact opposite. We automated ninety percent of the rough cuts with AI curation so our creative directors could obsess over storytelling and emotional pacing.",
      hookComment: "Strong curiosity gap paired with an authentic behind-the-scenes confession.",
      coherenceComment: "Clear contrast between conventional wisdom and the winning decision.",
      connectionComment: "Resonates strongly with operators and creative teams scaling output.",
      trendComment: "AI workflow transformation is a top-decile topic across LinkedIn, X, and Reels.",
    },
    {
      rank: 4,
      score: 89,
      hookGrade: "A-",
      flowGrade: "B+",
      valueGrade: "A-",
      trendGrade: "B+",
      title: `Rapid-Fire Q&A: Best Tools, Habits & Non-Negotiables for ${new Date().getFullYear()}`,
      hashtags: "#rapidfire #creatorhabits #productivity #studiolife",
      startMs: 190000,
      endMs: 228000,
      sceneAnalysisText:
        "Fast-paced alternating single shots between host and guest during a rapid-fire lightning round. Animated emoji overlays and punchy sound-effect transitions punctuate each answer.",
      transcriptText:
        "Question one: what is the one metric you check every morning? Retention at the thirty-second mark. Question two: biggest waste of time in production? Manual caption keyframing. Question three: what would you do if you started from zero subscribers today? Post three high-signal vertical clips every single day for ninety days straight.",
      hookComment: "Fast Q&A cadence hooks viewers who enjoy high-density rapid insights.",
      coherenceComment: "Three self-contained micro-questions maintain brisk pacing from start to finish.",
      connectionComment: "Closing advice ('if starting from zero') sparks debate in comments.",
      trendComment: "Lightning-round clips consistently perform well on TikTok and YouTube Shorts.",
    },
  ];

  return templates.map((tpl) => {
    const durationMs = tpl.endMs - tpl.startMs;
    const durationSec = Math.round(durationMs / 1000);
    const words = buildWordsFromTranscript(tpl.transcriptText, durationSec);

    const screenplay: ClipScreenplay = {
      chapters: [
        {
          id: `chap_${tpl.rank}`,
          title: tpl.title,
          lines: [
            {
              id: `vis_${tpl.rank}_1`,
              type: "visual",
              text: tpl.sceneAnalysisText,
              tr: [0, durationSec],
            },
            {
              id: `verb_${tpl.rank}_1`,
              type: "verbal",
              speaker: "Speaker 1",
              text: tpl.transcriptText,
              tr: [0, durationSec],
              words,
            },
          ],
        },
      ],
    };

    const judgeResult: ClipJudgeResult = {
      score: tpl.score,
      curvedScore: tpl.score,
      hookScore: tpl.score >= 95 ? 98 : tpl.score + 1,
      hookComment: tpl.hookComment,
      coherenceScore: tpl.score,
      coherenceComment: tpl.coherenceComment,
      connectionScore: tpl.score - 1,
      connectionComment: tpl.connectionComment,
      trendScore: tpl.score - 2,
      trendComment: `${tpl.trendComment} (Prompt match: "${promptText.slice(0, 60)}")`,
      relevanceScore: 95,
    };

    return {
      rank: tpl.rank,
      title: tpl.title,
      description: `${tpl.title} — Curated via ClipAnything™ (${genre}). ${tpl.hashtags}`,
      hashtags: tpl.hashtags,
      score: tpl.score,
      hookGrade: tpl.hookGrade,
      flowGrade: tpl.flowGrade,
      valueGrade: tpl.valueGrade,
      trendGrade: tpl.trendGrade,
      judgeResultJson: JSON.stringify(judgeResult),
      startMs: tpl.startMs,
      endMs: tpl.endMs,
      durationMs,
      videoUrl: input.videoUrl || "/videos/sample_podcast.mp4",
      thumbnailUrl: input.thumbnailUrl,
      transcriptText: tpl.transcriptText,
      sceneAnalysisText: tpl.sceneAnalysisText,
      screenplayJson: JSON.stringify(screenplay),
    };
  });
}

export function generateFreeToolResult(params: {
  toolSlug: string;
  topic: string;
  tone?: string;
}) {
  const topic = params.topic.trim() || "Building a $10M Creator Studio with AI Video Clipping";
  const tone = params.tone?.trim() || "Viral & High-Retention";

  switch (params.toolSlug) {
    case "youtube-title-generator":
      return {
        toolName: "AI YouTube Title Generator",
        items: [
          `I Tested ${topic} for 30 Days (Here's the Unfiltered Truth)`,
          `How ${topic} Actually Works in ${new Date().getFullYear()} (Step-by-Step Playbook)`,
          `Why 99% of Creators Get ${topic} Wrong — Do This Instead`,
          `The $100K/Month Blueprint Behind ${topic} [${tone}]`,
          `7 Minutes That Will Forever Change How You Think About ${topic}`,
        ],
      };
    case "tiktok-caption-generator":
      return {
        toolName: "AI TikTok & Reels Caption Generator",
        items: [
          `Wait until the 0:18 mark 👀 Nobody talks about this side of ${topic}, but it changed our entire workflow. Save this for your next shoot! 🔥 #creatorstrategy #viralclips`,
          `POV: You finally stopped guessing and started using a repeatable system for ${topic} ⚡ Drop a "CLIP" in the comments if you want the full breakdown.`,
          `3 lessons from 100+ hours researching ${topic}: 1️⃣ Hook in 2 seconds 2️⃣ Cut every dead pause 3️⃣ Let dynamic captions carry silent viewers.`,
        ],
      };
    case "tiktok-hashtag-generator":
      return {
        toolName: "AI TikTok & Shorts Hashtag Generator",
        items: [
          "#opusclip #viralshorts #tiktokgrowth #contentcreator #videomarketing #podcastclips #shortformcontent #creatortools #aivideoeditor #fyp",
          "#entrepreneurmindset #digitalbusiness #youtubeautomation #socialmediatips #reelsstrategy #founderstory #growthhacking",
        ],
      };
    case "transcript-maker":
      return {
        toolName: "AI Timestamped Transcript Maker",
        items: [
          `[00:00 - 00:06] Welcome back! Today we're breaking down ${topic} with a ${tone.toLowerCase()} approach.`,
          `[00:06 - 00:19] The #1 lever for short-form retention is pairing visual scene changes with word-level highlighted captions.`,
          `[00:19 - 00:34] When you isolate the highest-emotion 45 seconds from a long-form recording, completion rates jump by over 210%.`,
        ],
      };
    case "ai-show-note-generator":
      return {
        toolName: "AI Podcast Show Note Generator",
        items: [
          `Episode Summary: An actionable deep dive into ${topic} (${tone} Edition).`,
          `Key Takeaways:\n• How to identify 95+ Virality Score™ hooks in long-form conversations\n• Structuring 9:16 vertical reframing for multi-speaker interviews\n• Automating cross-platform scheduling across YouTube Shorts, TikTok, and Reels`,
          `Chapter Markers:\n00:00 — Intro & The Contrarian Hook\n04:12 — The 3-Step Curation Framework\n11:45 — Live Studio Breakdown & Results`,
        ],
      };
    default:
      return {
        toolName: "AI Video Summarizer & Script Generator",
        items: [
          `Executive Hook (0–3s): "Most people overcomplicate ${topic}—here is the 30-second version."`,
          `Core Body (3–24s): Contrast the old manual editing workflow against multimodal AI scene + dialogue curation.`,
          `High-Conversion CTA (24–30s): "Bookmark this clip and try the template in your next upload."`,
        ],
      };
  }
}
