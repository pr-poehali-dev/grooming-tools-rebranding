-- Изменение текущего запаса перчаток с 11 на 5
UPDATE t_p84978481_grooming_tools_rebra.products 
SET current_stock = 5.00 
WHERE id = 1 AND name = 'Перчатки';