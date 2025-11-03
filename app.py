from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecommerce.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

db = SQLAlchemy(app)

# Models
class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    category = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship('Order', backref='product', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'category': self.category,
            'created_at': self.created_at.isoformat()
        }


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(100))
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, shipped, delivered, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'quantity': self.quantity,
            'total_price': self.total_price,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }


# Initialize database
with app.app_context():
    db.create_all()


# Product CRUD Operations

@app.route('/products', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    category = request.args.get('category')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)

    query = Product.query

    if category:
        query = query.filter_by(category=category)
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)

    products = query.all()
    return jsonify([product.to_dict() for product in products]), 200


@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product.to_dict()), 200


@app.route('/products', methods=['POST'])
def create_product():
    """Create a new product"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Validation
    required_fields = ['name', 'price']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    if data['price'] < 0:
        return jsonify({'error': 'Price cannot be negative'}), 400

    try:
        product = Product(
            name=data['name'],
            description=data.get('description', ''),
            price=data['price'],
            stock=data.get('stock', 0),
            category=data.get('category', '')
        )

        db.session.add(product)
        db.session.commit()

        return jsonify(product.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update an existing product"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            if data['price'] < 0:
                return jsonify({'error': 'Price cannot be negative'}), 400
            product.price = data['price']
        if 'stock' in data:
            product.stock = data['stock']
        if 'category' in data:
            product.category = data['category']

        db.session.commit()
        return jsonify(product.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    try:
        # Check if product has orders
        if product.orders:
            return jsonify({'error': 'Cannot delete product with existing orders'}), 400

        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Order CRUD Operations

@app.route('/orders', methods=['GET'])
def get_orders():
    """Get all orders with optional filtering"""
    status = request.args.get('status')
    customer_email = request.args.get('customer_email')

    query = Order.query

    if status:
        query = query.filter_by(status=status)
    if customer_email:
        query = query.filter_by(customer_email=customer_email)

    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify([order.to_dict() for order in orders]), 200


@app.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get a single order by ID"""
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify(order.to_dict()), 200


@app.route('/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Validation
    required_fields = ['customer_name', 'product_id', 'quantity']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # Check if product exists
    product = Product.query.get(data['product_id'])
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    # Check stock availability
    if product.stock < data['quantity']:
        return jsonify({'error': f'Insufficient stock. Available: {product.stock}'}), 400

    if data['quantity'] <= 0:
        return jsonify({'error': 'Quantity must be positive'}), 400

    try:
        # Calculate total price
        total_price = product.price * data['quantity']

        order = Order(
            customer_name=data['customer_name'],
            customer_email=data.get('customer_email', ''),
            product_id=data['product_id'],
            quantity=data['quantity'],
            total_price=total_price,
            status=data.get('status', 'pending')
        )

        # Update product stock
        product.stock -= data['quantity']

        db.session.add(order)
        db.session.commit()

        return jsonify(order.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    """Update an existing order"""
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        # Handle quantity updates
        if 'quantity' in data:
            old_quantity = order.quantity
            new_quantity = data['quantity']

            if new_quantity <= 0:
                return jsonify({'error': 'Quantity must be positive'}), 400

            product = Product.query.get(order.product_id)
            stock_difference = new_quantity - old_quantity

            if product.stock < stock_difference:
                return jsonify({'error': f'Insufficient stock. Available: {product.stock}'}), 400

            order.quantity = new_quantity
            order.total_price = product.price * new_quantity
            product.stock -= stock_difference

        if 'status' in data:
            valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
            if data['status'] not in valid_statuses:
                return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400

            # If cancelling order, restore stock
            if data['status'] == 'cancelled' and order.status != 'cancelled':
                product = Product.query.get(order.product_id)
                product.stock += order.quantity

            order.status = data['status']

        if 'customer_name' in data:
            order.customer_name = data['customer_name']
        if 'customer_email' in data:
            order.customer_email = data['customer_email']

        db.session.commit()
        return jsonify(order.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    """Delete an order"""
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    try:
        # Restore stock if order wasn't cancelled
        if order.status != 'cancelled':
            product = Product.query.get(order.product_id)
            product.stock += order.quantity

        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Order deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'E-commerce API is running'}), 200


# Root endpoint
@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information"""
    return jsonify({
        'name': 'E-commerce API',
        'version': '1.0.0',
        'endpoints': {
            'products': {
                'GET /products': 'Get all products (supports filtering by category, min_price, max_price)',
                'GET /products/<id>': 'Get a single product',
                'POST /products': 'Create a new product',
                'PUT /products/<id>': 'Update a product',
                'DELETE /products/<id>': 'Delete a product'
            },
            'orders': {
                'GET /orders': 'Get all orders (supports filtering by status, customer_email)',
                'GET /orders/<id>': 'Get a single order',
                'POST /orders': 'Create a new order',
                'PUT /orders/<id>': 'Update an order',
                'DELETE /orders/<id>': 'Delete an order'
            }
        }
    }), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
