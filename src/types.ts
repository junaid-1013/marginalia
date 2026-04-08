export interface ISummary {
  introduction: string;
  abstract: string;
  keyTakeaways: string[];
  tldr: string;
  mostUsedWords: Word[];
}
export interface Word {
  text: string;
  value: number;
}
