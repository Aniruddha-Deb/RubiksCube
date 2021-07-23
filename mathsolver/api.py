from flask import Blueprint, request
import base64
import io
from mathsolver.ai import network
from PIL import Image, ImageOps

bp = Blueprint('api', __name__)

@bp.route('/get_answer', methods=['POST', 'GET'])
def get_answer():
    img_bytes = base64.b64decode(request.form.get('img'))
    img_buf = io.BytesIO(img_bytes)
    img = ImageOps.grayscale(Image.open(img_buf))
    return str(network.solve(img))