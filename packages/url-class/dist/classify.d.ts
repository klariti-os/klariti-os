export declare const youtubeCategories: Record<string, string>;
/**
 * Classify a piece of content from a URL.
 *
 * @param url YouTube URL (youtube.com/watch?v= or youtu.be/ formats).
 * @returns Classification of the content.
 */
export declare function classifyUrl(url: string): Promise<string | null>;
