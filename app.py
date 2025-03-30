from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from model import db, Student

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///students.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

db.init_app(app)

# Helper function for validation
def validate_student_data(data, is_update=False):
    errors = {}
    if not is_update or 'first_name' in data:
        if not data.get('first_name', '').strip():
            errors['first_name'] = 'First name is required'
    if not is_update or 'last_name' in data:
        if not data.get('last_name', '').strip():
            errors['last_name'] = 'Last name is required'
    if not is_update or 'dob' in data:
        try:
            datetime.strptime(data.get('dob', ''), '%Y-%m-%d')
        except ValueError:
            errors['dob'] = 'Valid date (YYYY-MM-DD) required'
    if 'amount_due' in data:
        try:
            if float(data['amount_due']) < 0:
                errors['amount_due'] = 'Cannot be negative'
        except (ValueError, TypeError):
            errors['amount_due'] = 'Must be a number'
    return errors

@app.route('/')
def home():
    return render_template('index.html')

# CREATE
@app.route('/students', methods=['POST'])
def create_student():
    data = request.get_json()
    errors = validate_student_data(data)
    if errors:
        return jsonify({'success': False, 'errors': errors}), 400
    
    try:
        student = Student(
            first_name=data['first_name'].strip(),
            last_name=data['last_name'].strip(),
            dob=datetime.strptime(data['dob'], '%Y-%m-%d').date(),
            amount_due=float(data.get('amount_due', 0))
        )
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': student.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# READ (all)
@app.route('/students', methods=['GET'])
def get_students():
    try:
        students = Student.query.all()
        return jsonify({
            'success': True,
            'data': [s.to_dict() for s in students],
            'count': len(students)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# READ (single)
@app.route('/students/<int:id>', methods=['GET'])
def get_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({'success': False, 'error': 'Not found'}), 404
    return jsonify({'success': True, 'data': student.to_dict()})

# UPDATE
@app.route('/students/<int:id>', methods=['PUT'])
def update_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({'success': False, 'error': 'Not found'}), 404
    
    data = request.get_json()
    errors = validate_student_data(data, is_update=True)
    if errors:
        return jsonify({'success': False, 'errors': errors}), 400
    
    try:
        if 'first_name' in data:
            student.first_name = data['first_name'].strip()
        if 'last_name' in data:
            student.last_name = data['last_name'].strip()
        if 'dob' in data:
            student.dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
        if 'amount_due' in data:
            student.amount_due = float(data['amount_due'])
        
        db.session.commit()
        return jsonify({'success': True, 'data': student.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# DELETE
@app.route('/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({'success': False, 'error': 'Not found'}), 404
    
    try:
        db.session.delete(student)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)