import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getSuccessRedirect, getErrorRedirect } from '@/helpers/toastRedirects';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const type = searchParams.get('type');

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(
          getSuccessRedirect(`${origin}${next}`, getSuccessMessage(type))
        );
      } else if (forwardedHost) {
        return NextResponse.redirect(
          getSuccessRedirect(`https://${forwardedHost}${next}`, getSuccessMessage(type))
        );
      } else {
        return NextResponse.redirect(
          getSuccessRedirect(`${origin}${next}`, getSuccessMessage(type))
        );
      }
    }
  }

  return NextResponse.redirect(
    getErrorRedirect(
      `${origin}/auth/auth-code-error`,
      'Sorry, we could not authenticate you. Please try again.'
    )
  );
}

function getSuccessMessage(type: string | null): string {
  switch (type) {
    case 'signup':
      return 'Your email has been confirmed! You can now access your account.';
    case 'email_change':
      return 'Your email address has been successfully updated.';
    case 'invite':
      return 'Welcome to breaddie! Your invitation has been accepted.';
    case 'magiclink':
      return 'You have been signed in successfully via magic link.';
    case 'recovery':
      return 'You can now reset your password.';
    default:
      return 'You have been successfully authenticated.';
  }
}
