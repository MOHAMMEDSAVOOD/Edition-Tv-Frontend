// Static Asset URIs and specifications for Edition TV share poster templates
export const SHARE_POSTER_TEMPLATE_BASE64 = "/posters/share-poster.png";
export const STORY_POSTER_TEMPLATE_BASE64 = "/posters/poster.png";

export type PosterAspectRatio = "2:3" | "9:16";

export interface PosterFormatConfig {
  id: PosterAspectRatio;
  name: string;
  badge: string;
  description: string;
  width: number;
  height: number;
  aspectRatioLabel: string;
  templateUrl: string;
  downloadFilenameSuffix: string;
  ribbon: {
    top: string;
    right: string;
    width: string;
    height: string;
    fontSize: string;
  };
  content: {
    bottom: string;
    left: string;
    right: string;
  };
  qrCode: {
    right: string;
    bottom: string;
    size: number;
    boxSize: string;
  };
  topGlowHeight: string;
  bottomGlowHeight: string;
}

export const POSTER_FORMATS: Record<PosterAspectRatio, PosterFormatConfig> = {
  "2:3": {
    id: "2:3",
    name: "2:3 Feed",
    badge: "2:3",
    description: "1024 × 1536 px (Feed & Print Poster)",
    width: 1024,
    height: 1536,
    aspectRatioLabel: "2:3",
    templateUrl: SHARE_POSTER_TEMPLATE_BASE64,
    downloadFilenameSuffix: "poster-2x3",
    ribbon: {
      top: "40px",
      right: "60px",
      width: "320px",
      height: "64px",
      fontSize: "38px",
    },
    content: {
      bottom: "245px",
      left: "155px",
      right: "155px",
    },
    qrCode: {
      right: "80px",
      bottom: "65px",
      size: 138,
      boxSize: "148px",
    },
    topGlowHeight: "320px",
    bottomGlowHeight: "960px",
  },
  "9:16": {
    id: "9:16",
    name: "9:16 Story",
    badge: "9:16",
    description: "941 × 1672 px (Story, Status & Reel)",
    width: 941,
    height: 1672,
    aspectRatioLabel: "9:16",
    templateUrl: STORY_POSTER_TEMPLATE_BASE64,
    downloadFilenameSuffix: "story-9x16",
    ribbon: {
      top: "46px",
      right: "56px",
      width: "300px",
      height: "64px",
      fontSize: "36px",
    },
    content: {
      bottom: "260px",
      left: "115px",
      right: "115px",
    },
    qrCode: {
      right: "72px",
      bottom: "60px",
      size: 138,
      boxSize: "148px",
    },
    topGlowHeight: "340px",
    bottomGlowHeight: "1050px",
  },
};
