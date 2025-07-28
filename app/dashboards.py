from flask import Blueprint,render_template
from flask_login import login_required


dashboards = Blueprint('dashboards',__name__,template_folder='templates',
    static_folder='static',)
    

@dashboards.route('/')
@login_required
def index():
    return render_template('dashboards/index.html')

@dashboards.route('/mapa_efetivo')
@login_required
def mapa_efetivo():
    return render_template('dashboards/mapa_efetivo.html')

@dashboards.route('/erwin_dm')
@login_required
def erwin_dm():
    return render_template('dashboards/erwin_dm.html')


