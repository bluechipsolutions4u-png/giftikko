import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const token = formData.get("token");
        const uid = formData.get("uid");

        if (!file || !token || !uid) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        const fileName = `profile_images/${uid}_${Date.now()}`;
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodeURIComponent(fileName)}`;

        // Convert the File object to a Buffer for Node.js fetch body
        const buffer = Buffer.from(await file.arrayBuffer());

        // A fetch straight to Firebase REST API from our Node server easily bypasses browser CORS locks!
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": file.type,
            },
            body: buffer
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Firebase API error:", errText);
            return NextResponse.json({ error: "Failed to upload to Firebase", details: errText }, { status: response.status });
        }

        const data = await response.json();

        // Construct the public download URL utilizing the generated download token
        const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(fileName)}?alt=media&token=${data.downloadTokens}`;

        return NextResponse.json({ success: true, url: downloadUrl });
    } catch (error) {
        console.error("API Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
