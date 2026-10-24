# Dane i pliki PKMREPS

Dane edytowane w panelach są zapisywane w Lovable Cloud. Pliki JSON w tym katalogu są tylko zapasową kopią startową; nie zastępują nowszych rekordów z bazy.

## Model danych
- products: produkty, zdjęcia katalogowe/QC, linki agentów, sprzedawca, ceny i flagi widoczności.
- categories, agents, shipping_rates: kategorie, agenci i cenniki kalkulatora.
- sellers i user_roles: sklepy oraz chroniony dostęp sprzedawców.
- guide_steps, promos, social_links: poradnik, promocje i odnośniki społecznościowe.
- settings: ustawienia strony. Klucz public_profile zawiera wersjonowany JSON: version, name, bio, avatar, background, music, decoration oraz links (id, title, subtitle, url, image). Pierwszy link jest dużym blokiem, kolejne kafelkami.

## Zdjęcia i muzyka
Prywatny zasobnik product-images przechowuje niezmienne pliki:
- archive/: skopiowane zdjęcia katalogowe i QC,
- catalog/<folder>/: wgrywane przez panel zdjęcia agentów, promocji, poradnika i innych powierzchni,
- catalog/profile/avatar/, catalog/profile/background/, catalog/profile/links/: media profilu,
- catalog/profile/music/: muzyka MP3, WAV lub OGG.

Baza zapisuje odnośniki do plików; same bajty pozostają w zasobniku. Endpoint /api/public/product-image serwuje wyłącznie jawnie publiczne prefiksy archive/ i catalog/, bez ujawniania kluczy dostępu. Usunięcie odnośnika z profilu nie kasuje pliku używanego potencjalnie gdzie indziej. Edycja i wysyłanie muzyki wymagają podpisanej sesji administratora. Kopia ZIP kodu nie stanowi automatycznie kopii bazy ani zasobnika; pełny backup wymaga także eksportu danych i plików.

## Tracking
Numer nie jest dowodem nadania ani terminu doręczenia. Pokazujemy rzeczywiste zdarzenia Cainiao, jeśli źródło odpowiada, i termin tylko wtedy, gdy źródło go poda. Bez danych nie generujemy fikcyjnej daty. Pełna obsługa 17TRACK/Parcels w obrębie strony wymaga podłączenia oficjalnej usługi oraz jej konta/klucza; obecne odnośniki służą do ręcznej weryfikacji.
