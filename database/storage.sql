-- ==========================================
-- InstaCart AI — Supabase Storage Setup
-- ==========================================
-- Execute este script DEPOIS do schema.sql principal.

-- 1. Cria bucket público para imagens de produto
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas do bucket
-- Leitura pública (qualquer um pode ver a foto na vitrine)
CREATE POLICY "product-images leitura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Upload restrito: o lojista só escreve na própria pasta (nome = auth.uid())
-- O backend usa service role e pode ignorar, mas a RLS protege requisições anon.
CREATE POLICY "lojista faz upload na própria pasta"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "lojista atualiza própria pasta"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "lojista deleta própria pasta"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
