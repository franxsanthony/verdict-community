import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';
import { createBlindIndex } from '@/lib/encryption';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, token, newPassword } = body;

        if (!email || !token || !newPassword) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }
        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const resetResult = await query(
            'SELECT * FROM password_resets WHERE email = $1 AND token_hash = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [normalizedEmail, tokenHash]
        );

        if (resetResult.rows.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const blindIndex = createBlindIndex(normalizedEmail);

        await query(
            'UPDATE users SET password_hash = $1 WHERE email_blind_index = $2',
            [hashedPassword, blindIndex]
        );

        await query('DELETE FROM password_resets WHERE email = $1', [normalizedEmail]);

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully.'
        });

    } catch (error) {
        console.error('Reset Password API Error:', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
