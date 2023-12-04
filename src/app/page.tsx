import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold text-center">
          AI Chatbot for your documents
        </h1>
        <p className="text-xl text-center">
          A chatbot that can answer your questions about your documents
        </p>
        <Button className="mt-8" variant="default">
          Get started
        </Button>
        <Button className="mt-8" variant="outline">
          Learn more
        </Button>
      </div>
    </main>
  );
}
