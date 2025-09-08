from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func
from models import db, Expense, User
from datetime import datetime


# ------------------------------
# App setup
# ------------------------------
app = Flask(__name__)
app.secret_key = "supersecret"  # required for session management
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expenses.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# ------------------------------
# Login manager setup
# ------------------------------
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# ------------------------------
# Routes
# ------------------------------

@app.route('/')
@login_required
def index():
    # show only current user’s expenses
    expenses = Expense.query.filter_by(user_id=current_user.id).all()
    total = sum(e.amount for e in expenses)

    # monthly totals for chart
    monthly_data = (
        db.session.query(
            func.strftime("%Y-%m", Expense.date).label("month"),
            func.sum(Expense.amount).label("total")
        )
        .filter(Expense.user_id == current_user.id)
        .group_by("month")
        .all()
    )
    monthly_totals = {m: t for m, t in monthly_data}

    return render_template(
        "index.html",
        expenses=expenses,
        total=total,
        monthly_totals=monthly_totals
    )

@app.route("/add", methods=["POST"])
@login_required
def add_expense():
    # Convert string from form into a Python date object
    date_str = request.form["date"]
    date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()

    new_expense = Expense(
        date=date_obj,
        category=request.form["category"],
        amount=float(request.form["amount"]),
        notes=request.form.get("notes", ""),
        user_id=current_user.id
    )
    db.session.add(new_expense)
    db.session.commit()
    return redirect(url_for("index"))
# Delete single expense
@app.route("/delete/<int:expense_id>", methods=["POST"])
@login_required
def delete_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    # Prevent users from deleting others’ expenses
    if expense.user_id != current_user.id:
        flash("You are not authorized to delete this expense.", "danger")
        return redirect(url_for("index"))

    db.session.delete(expense)
    db.session.commit()
    flash("Expense deleted successfully.", "success")
    return redirect(url_for("index"))


# Reset (delete all user expenses)
@app.route("/reset", methods=["POST"])
@login_required
def reset_expenses():
    Expense.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    flash("All your expenses have been cleared.", "info")
    return redirect(url_for("index"))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])
        user = User(username=username, password=password)
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash("Invalid username or password", "danger")
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# ------------------------------
# Run the app
# ------------------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

