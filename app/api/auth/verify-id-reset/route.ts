import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { decrypt, createBlindIndex } from '@/lib/encryption';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, nationalId } = body;

        if (!email || !nationalId) {
            return NextResponse.json({ error: 'Email and National ID are required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedId = nationalId.trim();
        const emailBlindIndex = createBlindIndex(normalizedEmail);

        const userCheck = await query(
            `SELECT a.id, a.email, a.national_id, u.id as user_id
           FROM applications a
           LEFT JOIN users u ON u.email_blind_index = a.email_blind_index
           WHERE a.email_blind_index = $1`,
            [emailBlindIndex]
        );

        if (userCheck.rows.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
            return NextResponse.json({ error: 'Invalid email or National ID' }, { status: 401 });
        }

        const application = userCheck.rows[0];
        const decryptedId = decrypt(application.national_id);

        if (decryptedId !== normalizedId) {
            await new Promise(resolve => setTimeout(resolve, 200));
            return NextResponse.json({ error: 'Invalid email or National ID' }, { status: 401 });
        }

        if (!application.user_id) {
            return NextResponse.json({ error: 'No account found. Please register first.' }, { status: 401 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        // 30 minutes for ID verification
        const expiresAt = new Date(Date.now() + 1800000);

        await query(
            'INSERT INTO password_resets (email, token_hash, expires_at) VALUES ($1, $2, $3)',
            [normalizedEmail, tokenHash, expiresAt]
        );

        return NextResponse.json({
            success: true,
            token: resetToken,
            message: 'Identity verified successfully!'
        });

    } catch (error) {
        console.error('ID Verification API Error:', error);
        return NextResponse.json({ error: 'Failed to verify identity.' }, { status: 500 });
    }
}
