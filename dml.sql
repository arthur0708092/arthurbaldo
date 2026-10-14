USE mydb;

-- Inserir produtos
INSERT INTO produtos (nome, quantidade, valor, categoria)
VALUES
('Bodysplash', 120, 20.00, 'Produto de beleza'),
('Moletom', 10, 50.00, 'Roupa'),
('Batom', 20, 10.00, 'Produto de beleza');

-- Inserir movimentações
INSERT INTO movimentacoes
(datas, tipo, quantidade, produtos_id)
VALUES
('2026-09-10', 'saida', 10, 1),
('2026-04-12', 'entrada', 20, 2),
('2026-05-09', 'saida', 9, 3);

-- Atualizar valor de um produto
UPDATE produtos
SET valor = 25.00
WHERE id = 1;

-- Atualizar quantidade de um produto
UPDATE produtos
SET quantidade = 100
WHERE id = 2;

-- Excluir uma movimentação
DELETE FROM movimentacoes
WHERE id = 3;