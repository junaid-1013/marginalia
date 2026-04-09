export interface ISummary {
  introduction: string;
  abstract: string;
  keyTakeaways: string[];
  tldr: string;
  mostUsedWords: IWord[];
}
export interface IWord {
  text: string;
  value: number;
}
