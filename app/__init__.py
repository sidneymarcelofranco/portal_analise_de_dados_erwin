from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

import pyodbc  # Adicione este import

db = SQLAlchemy()

from .key_vault import SECRET_KEY, SQLSERVER_CONFIG

# String de conexão SQL Server
SQLSERVER_CONN_STR = (
    f"DRIVER={SQLSERVER_CONFIG['DRIVER']};"
    f"SERVER={SQLSERVER_CONFIG['SERVER']};"
    f"DATABASE={SQLSERVER_CONFIG['DATABASE']};"
    f"UID={SQLSERVER_CONFIG['UID']};"
    f"PWD={SQLSERVER_CONFIG['PWD']}"
)

def get_sqlserver_connection():
    return pyodbc.connect(SQLSERVER_CONN_STR)

# Como gerar uma chave secreta
# import secrets
# print(secrets.token_hex(32))

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqllite'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    login_manager = LoginManager(app)
    login_manager.login_view = 'pages.login'
    
    db.init_app(app)
    from .models import User
    with app.app_context():
        db.create_all()
        
    @login_manager.user_loader
    def loader_user(user_id):
        return User.query.get(int(user_id)) 
    
    # Torna a função de conexão disponível no app
    app.get_sqlserver_connection = get_sqlserver_connection

    from .dashboards import dashboards
    from .layouts import layouts
    from .pages import pages
    from .api import api_blueprint

    app.register_blueprint(dashboards ,url_prefix="/")
    app.register_blueprint(layouts ,url_prefix="/")
    app.register_blueprint(pages ,url_prefix="/")
    api_blueprint.init_app(app)
    
    return app