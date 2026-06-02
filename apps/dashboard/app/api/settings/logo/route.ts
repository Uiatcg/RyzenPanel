import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { dataUrl } = await req.json();
    if (!dataUrl || !dataUrl.startsWith("data:")) return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return NextResponse.json({ message: "Invalid data url" }, { status: 400 });
    const mime = matches[1];
    const b64 = matches[2];
    const ext = mime.split("/")[1] || "svg";
    const buffer = Buffer.from(b64, "base64");
    const uploads = path.join(process.cwd(), "apps/dashboard/public/uploads");
    if (!fs.existsSync(uploads)) fs.mkdirSync(uploads, { recursive: true });
    const filename = "logo." + ext;
    fs.writeFileSync(path.join(uploads, filename), buffer);
    return NextResponse.json({ ok: true, path: `/uploads/${filename}` });
  } catch (err) {
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
