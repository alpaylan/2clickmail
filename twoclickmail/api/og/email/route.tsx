// app/api/og/email/route.ts
import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const config = {
	runtime: "edge", // required for @vercel/og
};

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const subject = searchParams.get("subject") || "Untitled Email";
	const preview = searchParams.get("preview") || "No preview available";

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				padding: "60px",
				width: "100%",
				height: "100%",
				backgroundColor: "#fff",
				color: "#000",
				fontSize: 48,
				fontFamily: "sans-serif",
			}}
		>
			<strong style={{ fontSize: 64 }}>{subject}</strong>
			<p style={{ fontSize: 32, marginTop: 30, color: "#444" }}>{preview}</p>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
