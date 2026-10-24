import { createFileRoute } from '@tanstack/react-router';
import { ProfileView } from '@/components/profile/ProfileView';
import { useSettings } from '@/lib/store';
import { parseProfile, PROFILE_KEY } from '@/lib/profile';

export const Route = createFileRoute('/profil')({
  head: () => ({ meta: [
    { title: 'Profil — PKMREPS' }, { name: 'description', content: 'Wszystkie linki PKMREPS, findsy, zdjęcia QC i agenci w jednym miejscu.' },
    { property: 'og:title', content: 'Profil — PKMREPS' }, { property: 'og:description', content: 'Poznaj PKMREPS i znajdź wszystkie nasze linki.' },
    { property: 'og:type', content: 'profile' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: ProfilePage,
});
function ProfilePage() { const { data: settings, isPending, isError } = useSettings(); if (isPending) return <div className="py-20 text-center text-muted-foreground">Wczytywanie profilu…</div>; if (isError) return <div className="py-20 text-center text-destructive">Nie udało się wczytać profilu.</div>; return <ProfileView config={parseProfile(settings?.[PROFILE_KEY])}/>; }
