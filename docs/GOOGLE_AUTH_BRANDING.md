# Google Authentication Branding Configuration

To customize the Google authentication flow to show "Beyond Pages" instead of the Supabase project details, you need to configure the following in your Supabase dashboard:

## 1. Site URL Configuration
In Supabase Dashboard > Authentication > URL Configuration:
- Set the Site URL to your custom domain (e.g., `https://beyondpages.com`)
- This will replace the Supabase project URL in the OAuth flow

## 2. Custom Domain (Recommended)
In Supabase Dashboard > Settings > Custom Domains:
- Add your custom domain (e.g., `beyondpages.com`)
- This will completely replace the `ljwbdafyqjxlidgvmpzx.supabase.co` URL

## 3. Google Cloud Console OAuth App Name
In Google Cloud Console > OAuth consent screen:
- Set the Application name to "Beyond Pages"
- This will show "Beyond Pages" in the Google account selection screen

## 4. Redirect URLs
Update the authorized redirect URLs in Google Cloud Console to include:
- Your custom domain callback URL
- `https://your-domain.com/auth/callback`

## Current Configuration Needed:
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ljwbdafyqjxlidgvmpzx/settings/auth
2. Update Site URL from Supabase URL to your custom domain
3. Configure custom domain if available
4. Update Google OAuth app settings to show "Beyond Pages" branding