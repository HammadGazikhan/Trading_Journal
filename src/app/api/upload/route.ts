import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage, getCloudinaryErrorMessage } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // #region agent log
    fetch("http://127.0.0.1:7611/ingest/1a3fe879-272d-4e9c-baa6-61e06b0e357c", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "20def7",
      },
      body: JSON.stringify({
        sessionId: "20def7",
        runId: "post-fix",
        hypothesisId: "C",
        location: "upload/route.ts:pre-upload",
        message: "validated file before cloudinary",
        data: {
          fileType: file.type,
          fileSize: file.size,
          bufferLength: buffer.length,
          userIdPresent: !!session.user.id,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const url = await uploadImage(buffer, session.user.id);

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    const message = getCloudinaryErrorMessage(error);
    console.error("Upload error:", error);
    // #region agent log
    fetch("http://127.0.0.1:7611/ingest/1a3fe879-272d-4e9c-baa6-61e06b0e357c", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "20def7",
      },
      body: JSON.stringify({
        sessionId: "20def7",
        runId: "post-fix",
        hypothesisId: "D",
        location: "upload/route.ts:catch",
        message: "upload route caught error",
        data: {
          errorMessage: message,
          errorName: error instanceof Error ? error.name : "unknown",
          httpCode:
            (error as { http_code?: number } | undefined)?.http_code ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
