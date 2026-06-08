import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { createServiceClient } from "@/lib/supabase/server";

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const courseId = String(form.get("courseId") ?? "");

  if (!(file instanceof File) || !courseId) {
    return NextResponse.json({ ok: false, message: "Missing course or file." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let wordCount: number | undefined;

  if (file.name.toLowerCase().endsWith(".docx")) {
    try {
      const extracted = await mammoth.extractRawText({ buffer });
      wordCount = countWords(extracted.value);
    } catch {
      wordCount = undefined;
    }
  }

  let fileUrl: string | undefined;
  const supabase = createServiceClient();
  if (supabase) {
    const path = `${courseId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("course-files").upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true
    });
    if (!error) {
      const publicUrl = supabase.storage.from("course-files").getPublicUrl(path);
      fileUrl = publicUrl.data.publicUrl;
    }
  }

  return NextResponse.json({
    ok: true,
    wordCount,
    fileUrl,
    message: wordCount ? "Word count extracted." : "File accepted. Manual override may be required."
  });
}
