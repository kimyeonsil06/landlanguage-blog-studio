export type Tone = '~해요' | '~습니다' | '~한다' | '~과거형';
export type DraftStatus = '초안' | '완료';
export type AIProviderId = 'prompt-only' | 'codex-cli' | 'openai' | 'anthropic';
export type AITask = 'suggestKeywords' | 'suggestEmphasis' | 'generateTitles' | 'generateOutline' | 'generateArticle' | 'evaluateArticle' | 'reviseArticle';

export interface Source {
  id: string; title: string; organization: string; publishedAt: string;
  url: string; excerpt: string; verified: boolean;
}
export interface OfficeProfile {
  businessName: string; address: string; representative: string; phone: string;
  registrationNumber: string; display: '상단' | '하단' | '미표시';
}
export interface ImageIdea { caption: string; query: string; directPhoto: boolean; }
export interface OutlineSection {
  id: string; type: string; heading: string; notes: string; order: number;
  sourceIds: string[]; imageIdeas: ImageIdea[];
}
export interface ImageAsset {
  id: string; kind: 'upload' | 'infographic' | 'link' | 'placeholder';
  caption: string; alt: string; sourceUrl: string; licenseNote: string;
  blobRef?: string; order: number;
}
export interface EvaluationItem { name: string; max: number; score: number; reason: string; fix: string; }
export interface Evaluation {
  items: EvaluationItem[]; total: number; grade: string; topFixes: string[];
  evaluatedAt: string; evaluatorType: 'local' | 'ai';
}
export interface Draft {
  schemaVersion: 1; id: string; createdAt: string; updatedAt: string;
  author: string; topic: string; title: string; titles: string[];
  audience: string; keywords: string[]; emphasis: string[]; tone: Tone;
  experienceMemo: string; sources: Source[]; informationDate: string;
  targetLength: number; officeProfile: OfficeProfile; outline: OutlineSection[];
  article: string; metaDescription?: string; images: ImageAsset[]; evaluation?: Evaluation; status: DraftStatus;
  theme: 'light' | 'dark'; latestSearch: boolean; advertisingDisclosure: string;
}
export interface ProviderStatus {
  id: AIProviderId; name: string; available: boolean; reason: string;
  needsApiKey: boolean; localOnly: boolean;
}
export interface NewsItem { title: string; organization: string; publishedAt: string; url: string; }
