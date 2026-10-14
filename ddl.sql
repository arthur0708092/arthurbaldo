-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS mydb;

USE mydb;

-- Criar tabela produtos
CREATE TABLE produtos (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    quantidade INT NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

-- Criar tabela movimentacoes
CREATE TABLE movimentacoes (
    id INT NOT NULL AUTO_INCREMENT,
    datas DATE NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    quantidade INT NOT NULL,
    produtos_id INT NOT NULL,

    PRIMARY KEY (id),

    FOREIGN KEY (produtos_id)
    REFERENCES produtos(id)
);

-- Criar VIEW de produtos
CREATE VIEW vw_produtos AS
SELECT
    nome,
    quantidade,
    valor,
    quantidade * valor AS valor_total,
    categoria
FROM produtos;

-- Criar VIEW de movimentacoes
CREATE VIEW vw_movimentacoes AS
SELECT
    m.id,
    p.nome AS produto,
    m.datas,
    m.tipo,
    m.quantidade
FROM movimentacoes m
INNER JOIN produtos p
ON m.produtos_id = p.id;