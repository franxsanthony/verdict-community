import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createBlindIndex } from '@/lib/encryption';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailBlindIndex = createBlindIndex(normalizedEmail);

        // Check applications table
        const result = await query(
            'SELECT id FROM applications WHERE email_blind_index = $1',
            [emailBlindIndex]
        );

        if (result.rows.length > 0) {
            const applicationId = result.rows[0].id;
            let hasAccount = false;

            // Check users table
            const userResult = await query(
                'SELECT id FROM users WHERE email_blind_index = $1',
                [emailBlindIndex]
            );

            if (userResult.rows.length > 0) {
                hasAccount = true;
            }

            return NextResponse.json({
                exists: true,
                hasAccount,
                applicationId,
                message: hasAccount ? 'Account exists. Please login.' : 'Email found. You can create an account.'
            });
        }

        return NextResponse.json({
            exists: false,
            hasAccount: false,
            message: 'Email not found in applications. Please apply first.'
        });

    } catch (error) {
        console.error('Check Email API Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
