const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/valor-por-categoria', async (req, res) => {
  try {
    const categoriasQuery = req.query.categorias;
    let categorias = [];

    if (categoriasQuery) {
      categorias = categoriasQuery.split(',').map((item) => item.trim()).filter(Boolean);
    }

    let sql = 'SELECT categoria, SUM(valor * quantidade) AS total_valor FROM produto';
    const params = [];

    if (categorias.length > 0) {
      const placeholders = categorias.map(() => '?').join(',');
      sql += ` WHERE categoria IN (${placeholders})`;
      params.push(...categorias);
    }

    sql += ' GROUP BY categoria';
    const [rows] = await db.query(sql, params);

    res.json(rows.map((item) => ({
      categoria: item.categoria,
      total_valor: Number(item.total_valor) || 0,
    })));
  } catch (error) {
    console.error('Erro ao calcular valor por categoria:', error.message);
    res.status(500).json({ error: 'Erro ao calcular valor por categoria' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produto');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error.message);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

router.post('/criarproduto', async (req, res) => {
  const { nome, categoria, quantidade, valor } = req.body;

  if (!nome || !categoria || quantidade === undefined || valor === undefined) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios: nome, categoria, quantidade, valor' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO produto (nome, categoria, quantidade, valor) VALUES (?, ?, ?, ?)',
      [nome, categoria, Number(quantidade), Number(valor)]
    );

    res.status(201).json({ id: result.insertId, nome, categoria, quantidade, valor });
  } catch (error) {
    console.error('Erro ao criar produto:', error.message);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

router.get('/saidas', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.id, m.dt, m.tipo, m.quantidade, m.produtos_id,
             p.nome AS produto_nome,
             p.categoria AS produto_categoria
      FROM movimentacoes m
      INNER JOIN produto p ON m.produtos_id = p.id
      WHERE m.tipo IN ('saida', 'saída')
      ORDER BY m.dt DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar saídas:', error.message);
    res.status(500).json({ error: 'Erro ao listar saídas' });
  }
});

router.post('/registrar-entrada', async (req, res) => {
  const { produtos_id, quantidade, dt } = req.body;

  if (produtos_id === undefined || quantidade === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: produtos_id, quantidade' });
  }

  const qty = Number(quantidade);
  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ error: 'quantidade deve ser um inteiro positivo' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [prodRows] = await connection.query('SELECT quantidade FROM produto WHERE id = ? FOR UPDATE', [produtos_id]);
    if (prodRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const newQty = Number(prodRows[0].quantidade) + qty;
    const insertDt = dt || new Date();

    const [insertResult] = await connection.query(
      'INSERT INTO movimentacoes (dt, tipo, quantidade, produtos_id) VALUES (?, ?, ?, ?)',
      [insertDt, 'entrada', qty, produtos_id]
    );

    await connection.query('UPDATE produto SET quantidade = ? WHERE id = ?', [newQty, produtos_id]);
    await connection.commit();

    res.status(201).json({
      message: 'Entrada registrada com sucesso',
      id_movimentacao: insertResult.insertId,
      produto_id: produtos_id,
      nova_quantidade: newQty,
    });
  } catch (error) {
    await connection.rollback().catch(() => {});
    console.error('Erro ao registrar entrada:', error.message);
    res.status(500).json({ error: 'Erro ao registrar entrada' });
  } finally {
    connection.release();
  }
});

module.exports = router;
