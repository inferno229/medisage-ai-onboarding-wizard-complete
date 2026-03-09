# MediSage AI Authentication Setup Guide

## Current Status
Your Supabase authentication is properly configured. However, by default Supabase requires email confirmation before users can log in.

## How to Enable Immediate Login (No Email Confirmation)

### Option 1: Disable Email Confirmation (Recommended for Development)

1. **Go to Supabase Dashboard**
   - Visit https://app.supabase.com
   - Select your project

2. **Navigate to Authentication Settings**
   - In the left sidebar, click: **Authentication** → **Providers** → **Email**

3. **Disable Email Confirmation**
   - Find the toggle for "Confirm email"
   - Turn it **OFF** (the toggle should be gray/disabled)
   - Click **Save**

4. **Test Login**
   - Users can now sign up and log in immediately without email confirmation
   - You can use test accounts like:
     - Email: `test@example.com`
     - Password: `TestPassword123!`

### Option 2: Use Magic Link (Email-Based Login)

If you want to keep email confirmation but make login easier:

1. Go to **Authentication** → **Providers** → **Email**
2. Enable "Magic Link" authentication
3. Users click a link in their email instead of using passwords

### Option 3: Test with Confirmed Email

If you want to keep email confirmation enabled but still test:

1. Sign up with your email: `yourname@example.com`
2. Check your email inbox and spam folder
3. Click the confirmation link sent by Supabase
4. You can now log in with that email

## Troubleshooting Login Issues

### Error: "Invalid login credentials"
- **Cause**: Wrong email or password
- **Solution**: Double-check your email and password. Make sure caps lock is off.

### Error: "Email not confirmed"
- **Cause**: You haven't confirmed your email yet
- **Solution**: 
  - Check your inbox and spam folder for Supabase confirmation email
  - Click the confirmation link
  - If you can't find it, sign up again with a different email

### Error: "User already exists"
- **Cause**: This email is already registered
- **Solution**: 
  - Try logging in instead of signing up
  - Use a different email address

### Login page loads but can't submit form
- **Cause**: Supabase environment variables not set
- **Solution**: 
  - Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in your environment
  - Check browser console (F12) for errors
  - Look for debug messages starting with `[v0]`

## Debug Logging

The app includes comprehensive debug logging. To view it:

1. **Open Browser Developer Tools**: Press `F12`
2. **Go to Console tab**
3. **Look for messages starting with `[v0]`**

These will show you:
- Auth context initialization
- Login/signup attempts
- Session changes
- Error details

## Users and Test Accounts

After disabling email confirmation, you can use these test accounts:

```
Email: testuser@example.com
Password: TestPassword123!

Email: demo@medisage.com
Password: DemoPassword456!
```

Or create your own account through the signup form.

## Next Steps

1. Decide whether to disable email confirmation for development
2. If keeping it enabled, plan your email verification workflow
3. Test the login flow
4. Check browser console (F12) for debug messages if there are issues

For more help, check the debug logs in the browser console.
