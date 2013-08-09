# -*- coding: utf-8 -*-
from flask import Blueprint
from flask import request, session, url_for, redirect, \
        render_template, abort, g, flash, json, Response, make_response, current_app,send_file
from lib import const
import os
import string
import types

# Flask 模块对象
module = Blueprint('main', __name__)


@module.route('/')
def index():
    return render_template('index.html', tab = 'index')

@module.route('/test/')
def test():
    return render_template('test.html', tab = 'test')

@module.route('/three/')
def three():
    return render_template('three.html',tab = 'three')

@module.route('/three/earth')
def three_earth():
    return render_template('three/earth.html',tab = 'three')

@module.route('/three/examples/')
def three_examples():
	staticPath = 'static/js/lib/three/examples'
	pathes = os.listdir(os.path.join(current_app.root_path,staticPath))
	return render_template('three/examples.html',tab = 'three',staticPath=staticPath,pathes=pathes)

@module.route('/glodon/')
def glodon():
    return render_template('glodon/glodon.html', tab = 'glodon')

@module.route('/glodon/svg/')
def glodon_svg():
    return render_template('glodon/svg.html', tab = 'glodon')

@module.route('/glodon/test/')
def glodon_test():
    return render_template('HelloGL.html', tab = 'glodon')
