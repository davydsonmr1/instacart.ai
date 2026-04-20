-- ==========================================
-- InstaCart AI — Supabase Database Schema
-- ==========================================

-- ==========================================
-- 1. Criação das Tabelas
-- ==========================================

-- Tabela de Perfis (Lojistas)
-- O `id` é uma Chave Estrangeira (FK) ligada diretamente à tabela nativa de autenticação do Supabase.
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  store_name TEXT NOT NULL,
  whatsapp TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. Habilitação de RLS (Row Level Security)
-- ==========================================
-- Isso joga a responsabilidade de autorização para o banco. Sem políticas ativas (abaixo), ninguém lê nem escreve nada.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. Políticas RLS — Profiles
-- ==========================================

-- 🟢 LEITURA: Pública. Clientes precisam ver a loja, bio, etc.
CREATE POLICY "Leitura pública de perfis" 
ON profiles 
FOR SELECT 
USING (true);

-- 🔴 ESCRITA: Restrita. O usuário só insere/modifica se o UID da sua sessão jwt for o ID da linha.
CREATE POLICY "Usuário insere próprio perfil" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuário atualiza próprio perfil" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuário deleta próprio perfil" 
ON profiles 
FOR DELETE 
USING (auth.uid() = id);

-- ==========================================
-- 4. Políticas RLS — Products
-- ==========================================

-- 🟢 LEITURA: Pública. Clientes precisam ver a vitrine de produtos.
CREATE POLICY "Leitura pública de produtos" 
ON products 
FOR SELECT 
USING (true);

-- 🔴 ESCRITA: Restrita. O usuário só edita os produtos onde ele é o dono (user_id).
CREATE POLICY "Lojista insere próprios produtos" 
ON products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lojista atualiza próprios produtos" 
ON products 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lojista deleta próprios produtos" 
ON products 
FOR DELETE 
USING (auth.uid() = user_id);

-- ==========================================
-- 5. Triggers de Atualização (Bônus DB Ops)
-- ==========================================
-- Mantém o `updated_at` sempre preciso sem precisar mandar no payload da API.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
