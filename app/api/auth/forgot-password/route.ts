import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { createBlindIndex } from '@/lib/encryption';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const blindIndex = createBlindIndex(normalizedEmail);

        // Check user existence check
        const userResult = await query(
            'SELECT id FROM users WHERE email_blind_index = $1',
            [blindIndex]
        );

        // Clean up old resets
        await query('DELETE FROM password_resets WHERE email = $1', [normalizedEmail]);

        if (userResult.rows.length === 0) {
            // Timing attack mitigation
            await new Promise(resolve => setTimeout(resolve, 200));
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, a reset link has been sent.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        // 24 hours
        const expiresAt = new Date(Date.now() + 86400000);

        await query(
            'INSERT INTO password_resets (email, token_hash, expires_at) VALUES ($1, $2, $3)',
            [normalizedEmail, tokenHash, expiresAt]
        );

        const resetLink = `https://verdict.run/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

        // Send email (no await to return fast, or await if we want to confirm sending)
        // Express version awaited inside try/catch log.
        try {
            await sendPasswordResetEmail(normalizedEmail, resetLink);
            } catch (err) {
            console.error('Failed to send reset email', err);
            // We still return success to UI to avoid enumeration
        }

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, a reset link has been sent.'
        });

    } catch (error) {
        console.error('Forgot Password API Error:', error);
        return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
    }
}
