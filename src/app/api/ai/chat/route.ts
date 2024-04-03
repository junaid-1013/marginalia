import { Configuration, OpenAIApi } from "openai-edge";
import { NextRequest, NextResponse } from "next/server";
import { OPENAI_API_KEY } from "@/constants";
import { OpenAIStream, StreamingTextResponse } from "ai";

const runtime = "edge";
const config = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { messages } = await req.json();
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      stream: true,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (e) {}
}
