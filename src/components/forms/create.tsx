"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { FileIcon, UploadCloudIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateFormSchema } from "@/schemas/form/create";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/services/upload-file";

const CreateForm = () => {
  const { data } = useSession();
  const router = useRouter();
  const form = useForm<z.infer<typeof CreateFormSchema>>({
    resolver: zodResolver(CreateFormSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
    },
  });
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    onDrop: (acceptedFiles: FileWithPath[]) => {
      // Update the type of acceptedFiles to be an array
      form.setValue("pdfFile", acceptedFiles);
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof CreateFormSchema>) {
    const pdfLink = await uploadFile(values.pdfFile[0]);

    const chatConfig = {
      name: values.title,
      uploadPath: `uploads/${values.pdfFile[0].name}`,
      pdfLink: pdfLink,
      userId: data?.user?.id as string,
    };
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify(chatConfig),
    });

    if (!response.ok) {
      throw new Error("Failed to create chat");
    }

    const chat = await response.json();

    if (!chat || !chat.id) {
      throw new Error("Invalid chat data received from the server");
    }

    console.log({ chat });

    const splitDocResponse = await fetch("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ uploadPath: chatConfig.uploadPath }),
    });

    if (!splitDocResponse.ok) {
      throw new Error("Failed to split the document");
    }
    const splitDoc = await splitDocResponse.json();
    console.log({ splitDoc }, "splitDoc from  the client");

    // TODO: Add a progress bar for the file upload and after that redirect to the lecture page
    router.push(`/chats/${chat.id}`);
    console.log({ values });
  }
  return (
    <div className="max-w-2xl w-full m-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Python Crash Course" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pdfFile"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div
                    className={cn(
                      "border flex flex-col justify-center items-center py-10 space-y-2",
                      form.getValues("pdfFile")
                        ? "border-solid"
                        : "border-dashed"
                    )}
                    {...getRootProps()}
                  >
                    {form.getValues("pdfFile") ? (
                      <FileIcon className="w-10 h-10" />
                    ) : (
                      <UploadCloudIcon className="w-10 h-10" />
                    )}
                    {form.getValues("pdfFile") ? (
                      <p className="text-xs">
                        {form.getValues("pdfFile")[0].path}
                      </p>
                    ) : (
                      <p className="text-xs">
                        Drag and drop your PDF file here or{" "}
                        <span className="text-blue-500">browse</span>
                      </p>
                    )}
                    <Input {...getInputProps()} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateForm;
