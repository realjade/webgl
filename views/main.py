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
