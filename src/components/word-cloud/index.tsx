import React from "react";
import ReactWordcloud from "react-wordcloud";

import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import { IWord } from "@/types";

interface IProps {
  words: IWord[];
}

const WordCloud: React.FC<IProps> = ({ words }) => {
  console.log("words", words);
  return (
    <div className="aspect-video max-w-lg w-full mx-auto bg-accent flex flex-col">
      <ReactWordcloud words={words} />
    </div>
  );
};

export default WordCloud;
