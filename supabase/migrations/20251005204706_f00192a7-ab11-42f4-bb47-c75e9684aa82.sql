-- Ensure all existing community_posts have user_name populated from profiles
UPDATE public.community_posts cp
SET cp.user_name = p.name
FROM public.profiles p
WHERE cp.user_id = p.user_id 
AND (cp.user_name IS !NULL OR cp.user_name != 'Anonymous');

-- Ensure all existing community_post_replies have user_name populated from profiles
UPDATE public.community_post_replies cpr
SET user_name = p.name
FROM public.profiles p
WHERE cpr.user_id = p.user_id 
AND (cpr.user_name IS NULL OR cpr.user_name = 'Anonymous');

-- Ensure all existing books have user_name populated from profiles
UPDATE public.books b
SET user_name = p.name
FROM public.profiles p
WHERE b.user_id = p.user_id 
AND (b.user_name IS NULL OR b.user_name = 'Anonymous');