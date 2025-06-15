
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { useSubmit, useActionData, Form } from "@remix-run/react";
import sharp from "sharp";
import React, { useState } from "react";

// 图像处理支持的模式
const POSITIONS = ["origin", "center", "entropy", "attention"] as const;
type PositionType = (typeof POSITIONS)[number];

// Action：处理图片上传并返回各类图片base64数据
export async function action({ request }: ActionFunctionArgs) {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 8 * 1024 * 1024, // up to 8MB
  });
  const formData = await unstable_parseMultipartFormData(request, uploadHandler);

  const imageFile = formData.get("file");
  const position = formData.get("position") || "center";
  if (
    typeof position !== "string" ||
    !POSITIONS.includes(position as PositionType) ||
    !imageFile ||
    !(imageFile instanceof File)
  ) {
    return json({ error: "Invalid file or position." }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await imageFile.arrayBuffer());

  // 处理图片
  let outputBuffer: Buffer;
  let contentType = "image/jpeg";
  try {
    if (position === "origin") {
      outputBuffer = await sharp(inputBuffer)
        .resize({ height: 260, fit: sharp.fit.inside, withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();
    } else {
      // 统一resize，fit:cover
      outputBuffer = await sharp(inputBuffer)
        .resize({
          width: 1080,
          height: 1080,
          fit: sharp.fit.cover,
          position: position as sharp.Gravity,
        })
        .jpeg({ quality: 90 })
        .toBuffer();
    }
  } catch (err) {
    return json({ error: "Sharp processing failed." }, { status: 500 });
  }

  // 转换为 base64
  const b64 = outputBuffer.toString("base64");
  const dataUrl = `data:${contentType};base64,${b64}`;
  return json({ image: dataUrl });
}

// UI 组件
function ResizeImageCard({
  url,
  label,
}: {
  url: string | undefined;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="text-xs text-gray-700 mb-1">{label}</div>
      <div className="w-[260px] h-[260px] rounded-lg overflow-hidden flex items-center justify-center border bg-white shadow-md">
        {url ? (
          <img src={url} alt={label} className="w-full h-full object-contain" />
        ) : (
          <div className="text-muted-foreground text-center">No image</div>
        )}
      </div>
    </div>
  );
}

export default function IndexRoute() {
  // 用于保存已处理图片的data url
  const actionData = useActionData<typeof action>() as { image?: string; error?: string };
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{ [key in PositionType]?: string }>({});
  const [error, setError] = useState<string | null>(null);

  const submit = useSubmit();

  // 处理用户选择文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setResults({});
      setError(null);
    }
  };

  // 调用 Remix Action 批量请求
  const handleProcess = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    setResults({});
    setError(null);

    // 每个 position 请求一遍
    const formDataArr = POSITIONS.map((pos) => {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("position", pos);
      return fd;
    });

    const posResults: { [key in PositionType]?: string } = {};
    for (let i = 0; i < POSITIONS.length; i++) {
      const fd = formDataArr[i];
      const pos = POSITIONS[i];
      const resp = await fetch("/", {
        method: "POST",
        body: fd,
      });
      if (resp.ok) {
        const data = await resp.json();
        posResults[pos] = data.image as string;
      } else {
        posResults[pos] = undefined;
      }
    }
    setResults(posResults);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-8">
      <div className="bg-white rounded-lg shadow-md w-full max-w-2xl p-8 flex flex-col gap-6 mt-4">
        <h1 className="text-2xl font-bold mb-2">Remix + Sharp position demo</h1>
        <p className="text-muted-foreground text-sm mb-3">
          上传图片并比较 sharp resizes 不同 position 效果。
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={processing}
          className="mb-4"
        />
        {filePreview && (
          <div className="mb-6">
            <div className="text-xs mb-1">原图预览</div>
            <img src={filePreview} className="rounded max-w-[320px] max-h-[180px]" />
          </div>
        )}
        <button
          onClick={handleProcess}
          disabled={!selectedFile || processing}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition"
        >
          {processing ? "处理中..." : "开始处理"}
        </button>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        {/* 显示结果 */}
        {POSITIONS.map((pos) => (
          <ResizeImageCard
            key={pos}
            url={results[pos]}
            label={
              pos === "origin"
                ? "origin"
                : `position: ${pos}`
            }
          />
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-8">
        Powered by <a className="underline" href="https://remix.run/">Remix</a> & <a className="underline" href="https://sharp.pixelplumbing.com/">sharp</a>
      </div>
    </div>
  );
}
