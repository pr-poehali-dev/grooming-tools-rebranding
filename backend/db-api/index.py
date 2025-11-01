import json
import os
from typing import Dict, Any
import psycopg

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для работы с базой данных салона
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        with psycopg.connect(database_url) as conn:
            with conn.cursor() as cur:
                params = event.get('queryStringParameters') or {}
                table = params.get('table', 'products')
                
                if method == 'GET':
                    if table == 'products':
                        cur.execute('''
                            SELECT id, name, description, price, unit, purchase_price, 
                                   min_stock, current_stock, expiry_date
                            FROM products
                            ORDER BY id
                        ''')
                        rows = cur.fetchall()
                        products = []
                        for row in rows:
                            products.append({
                                'id': row[0],
                                'name': row[1],
                                'description': row[2],
                                'price': float(row[3]) if row[3] else 0,
                                'unit': row[4],
                                'purchase_price': float(row[5]) if row[5] else 0,
                                'min_stock': row[6],
                                'current_stock': float(row[7]) if row[7] else 0,
                                'expiry_date': str(row[8]) if row[8] else None
                            })
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'products': products}),
                            'isBase64Encoded': False
                        }
                    
                    elif table == 'material_consumption':
                        cur.execute('''
                            SELECT mc.id, mc.appointment_id, p.name, mc.quantity_used, 
                                   mc.consumption_date
                            FROM material_consumption mc
                            JOIN products p ON mc.product_id = p.id
                            ORDER BY mc.consumption_date DESC
                            LIMIT 50
                        ''')
                        rows = cur.fetchall()
                        consumptions = []
                        for row in rows:
                            consumptions.append({
                                'id': row[0],
                                'appointment_id': row[1],
                                'product_name': row[2],
                                'quantity_used': float(row[3]),
                                'consumption_date': str(row[4])
                            })
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'consumptions': consumptions}),
                            'isBase64Encoded': False
                        }
                
                elif method == 'POST':
                    body_data = json.loads(event.get('body', '{}'))
                    action = body_data.get('action')
                    
                    if action == 'add_consumption':
                        product_id = body_data.get('product_id')
                        quantity = body_data.get('quantity')
                        
                        cur.execute(
                            'INSERT INTO material_consumption (product_id, quantity_used) VALUES (%s, %s) RETURNING id',
                            (product_id, quantity)
                        )
                        consumption_id = cur.fetchone()[0]
                        
                        cur.execute(
                            'UPDATE products SET current_stock = current_stock - %s WHERE id = %s',
                            (quantity, product_id)
                        )
                        
                        conn.commit()
                        
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'id': consumption_id, 'success': True}),
                            'isBase64Encoded': False
                        }
                    
                    elif action == 'add_product':
                        name = body_data.get('name')
                        description = body_data.get('description')
                        price = body_data.get('price')
                        current_stock = body_data.get('current_stock', 0)
                        min_stock = body_data.get('min_stock', 1)
                        
                        cur.execute(
                            '''INSERT INTO products (name, description, price, current_stock, min_stock, unit) 
                               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id''',
                            (name, description, price, current_stock, min_stock, 'шт')
                        )
                        product_id = cur.fetchone()[0]
                        conn.commit()
                        
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'id': product_id, 'success': True}),
                            'isBase64Encoded': False
                        }
                
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid request'}),
                    'isBase64Encoded': False
                }
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
