from flask_restx import Api, Resource
from . import get_sqlserver_connection
from flask_restx import Resource
from flask import jsonify
import flask

# Crie um namespace para os endpoints de efetivo
api_blueprint = Api(version='1.0', title='Efetivo API', 
                    description='API para dados de efetivo policial',
                    doc='/swagger')

# Namespace para Erwin
erwin_ns = api_blueprint.namespace('erwin', description='Operações de Erwin')


def erwin_none(rows):
    return jsonify({"message": "Nenhum dado encontrado para Erwin"}), 404



@erwin_ns.route('/erwin_ok')
class Erwinok(Resource):
    def get(self):
        return jsonify([{"teste": "dados de teste erwin"}])
