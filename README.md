This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app), [Tailwind CSS](https://tailwindcss.com/) and [TypeScript](https://www.typescriptlang.org/) and [Shadcn](https://shadcn.com/).

## Getting Started

First install the dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Document Summarization Project

### Overview

The proposed project addresses the need for efficient document analysis and summarization. The objective is to build an application that utilizes AI to summarize text from documents, enhancing the power and efficiency of the process.

Document summarization is a challenging task involving understanding the meaning and structure of the document text and generating a concise and coherent summary while preserving key information [1]. AI technologies, such as NLP and Deep Learning, have shown great potential in improving the quality and performance of text summarization [2].

### Project Goals

The project encompasses various sub-tasks:

- Text Summarization
- Context Creation
- User Interaction
- Flashcard Generation

The primary goal is to develop a system capable of generating concise and meaningful summaries for given documents. To achieve this, the document will pass through a model generating a context for the text [3]. Trending frameworks like Langchain will be employed for this purpose [4]. The context will be stored using embedded vector databases such as ChromaDB or Pinecone, enabling users to interact with the document and ask questions [5].

### Features

- **Text Summarization:** Utilize AI technologies to generate concise and meaningful document summaries.
- **Context Creation:** Implement a model to create context for document text using frameworks like Langchain.
- **User Interaction:** Enable users to interact with documents, asking questions and seeking information.
- **Flashcard Generation:** Provide students with flashcards based on document content for better understanding [6].

### Software as a Service (SaaS)

The application will be offered as Software as a Service (SaaS), providing students with free access to a basic version. This ensures accessibility to the application's capabilities without financial barriers.

### References

[1] [Text Summarization Techniques: A Brief Survey](https://arxiv.org/pdf/1707.02268.pdf)

[2] [A Survey on Deep Learning for Text Summarization](https://arxiv.org/pdf/1804.05685.pdf)

[3] [Contextualized Text Summarization with GPT-2](https://arxiv.org/pdf/2001.05168.pdf)

[4] [Langchain]

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
