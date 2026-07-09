import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.bhutandevelopersconnect.xyz';
  const supabase = await createClient();

  // Static routes
  const routes = [
    '',
    '/about',
    '/contact',
    '/directory',
    '/projects',
    '/team-needed',
    '/events',
    '/careers',
    '/help',
    '/privacy',
    '/terms',
    '/join',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch public profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, updated_at')
    .limit(100);

  const profileRoutes = (profiles || []).map((profile) => ({
    url: `${baseUrl}/profile/${profile.id}`,
    lastModified: new Date(profile.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Fetch public projects
  const { data: projects } = await supabase
    .from('posts')
    .select('id, created_at')
    .eq('type', 'PROJECT')
    .limit(100);

  const projectRoutes = (projects || []).map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(project.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...profileRoutes, ...projectRoutes];
}
