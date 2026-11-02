INSERT INTO public.settings (key, value) VALUES
('secret_panel_extra_animal','4a1b0447d14e7f86fc8c3fde88f5fbb88f9193e1163dd02db2ec19830a4bff40'),
('secret_panel_extra_sport','98917f89cc2eb4223c080ee667158b0897a5984a414122d1b6f15ab21f36443d')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;