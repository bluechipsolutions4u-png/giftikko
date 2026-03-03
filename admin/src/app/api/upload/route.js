import { NextResponse } from 'next/server';
import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        });
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const token = formData.get("token");
        const uid = formData.get("uid");

        if (!file || !token || !uid) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Verify Authentication
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            if (decodedToken.uid !== uid) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }
        } catch (authError) {
            console.error("Auth verification failed:", authError);
            return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
        }

        // 2. Upload to Firebase Storage
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        console.log("Attempting upload to bucket:", bucketName);

        const bucket = admin.storage().bucket(bucketName);
        const fileName = `profile_images/${uid}_${Date.now()}_${file.name}`;
        const fileRef = bucket.file(fileName);

        const buffer = Buffer.from(await file.arrayBuffer());

        try {
            await fileRef.save(buffer, {
                contentType: file.type,
                metadata: {
                    cacheControl: 'public, max-age=31536000',
                },
            });
        } catch (saveError) {
            console.error("Firebase Storage Save Error:", saveError);
            return NextResponse.json({
                error: "Failed to save file to bucket",
                details: saveError.message,
                bucket: bucketName
            }, { status: 500 });
        }

        // 3. Make the file public (optional)
        try {
            await fileRef.makePublic();
        } catch (publicError) {
            console.warn("Could not make file public, link might require tokens:", publicError.message);
        }

        // 4. Return the public URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error("Upload API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
