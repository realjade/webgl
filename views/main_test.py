# -*- coding: utf-8 -*-
from flask import Blueprint
from flask import request, session, url_for, redirect, \
        render_template, abort, g, flash, json, Response, make_response, current_app,send_file
import models as m
from models.user import User
from models.code import Code, CodeShare
from werkzeug import check_password_hash, generate_password_hash
from werkzeug import secure_filename
from sqlalchemy import or_,desc
import time
import pickle
import lib.utils as ut
from lib.wrappers import login_required, load_user
import lib.functions as f
from lib import const
import lib.datawrappers as dw
import os
import string
from random import choice
import types
import Image

# Flask 模块对象
module = Blueprint('main', __name__)


@module.route('/test/')
def test():
    return render_template('test.html')

@module.route('/tmp', methods=['GET', 'POST'])
@load_user
def index():
    """index"""
    error = None
    if request.method == 'POST':
        codecontent = request.form.get('code',None)
        language = ut.getDefault(request.form.get('language',None),'JSON')
        exposure = ut.getDefault(request.form.get('exposure',None),'1')
        title = request.form.get('title',None)
        if not codecontent:
            error = u'请输入要分享的代码'
        if not title:
            error = u'请输入标题'
        user_id = g.user.user_id if g.user else None
        if not error:
            code = Code(code_id = ut.create_code_id(),
                        user_id = user_id,
                        content = codecontent,
                        created=int(time.time()*1000), updated=int(time.time()*1000)
                        )
            codeshare = CodeShare(code_id = code.code_id,
                                  share_id = ut.create_codeshare_id(),
                                  title = title,
                                  language = language,
                                  exposure = exposure,
                                  state = 0,
                                  created=int(time.time()*1000), updated=int(time.time()*1000)
                                  )
            m.session.add(code)
            m.session.add(codeshare)
            m.session.commit()
            return redirect('/share/'+codeshare.share_id+'/')
    codeshares = dw.wrap_codeshare(f.load_codeshares())
    return render_template('index.html',tab='index', error = error,codeshares=codeshares)

@module.route('/', methods=['GET', 'POST'])
@load_user
def codetools():
    """index"""
    return render_template('code/codetools.html',tab='codetools')

@module.route('/login/', methods=['GET', 'POST'])
@load_user
def login():
    """login"""
    error = None
    if request.method == 'POST':
        username = request.form.get('username',None)
        remember = request.form.get('remember', None) == 'on'
        user = f.get_user(username)
        if user is None:
            error = u'邮箱或者手机号不正确'
        elif not check_password_hash(user.pw_hash,
                                     request.form.get('password',None)):
            error = u'密码不正确'
        else:
            session['user_id'] = user.user_id
            if remember:
                session.permanent = True
        if error:
            return render_template('login.html',error = error)
        else:
            return redirect(request.referrer)
    if g.user:
        return redirect(url_for('main.index'))
    return render_template('login.html',error = error)

@module.route('/logout/')
def logout():
    """Logs the user out."""
    session.pop('user_id', None)
    return redirect(url_for('.index'))

@module.route('/register/', methods=['GET','POST'])
@load_user
def register():
    error =  None
    if request.method == 'POST':
        username = request.form.get('username',None)
        email = request.form.get('email','')
        password = request.form.get('password','')
        if not username or not email or not password:
            error = u'请填写下面所有信息'
        if not ut.is_email(email):
            error = u'您输入的邮箱不合法'
        elif f.get_user(username):
            error = u'您的用户名“'+username+u'”已经被注册，请更换用户名'
        elif f.get_user(email):
            error = u'您的邮箱“'+email+u'”已经被注册，请更换邮箱'
        else:
            user = User(user_id = ut.create_user_id(),
                username=username, email=email,
                pw_hash=generate_password_hash(password),
                created=int(time.time()*1000), updated=int(time.time()*1000))
            m.session.add(user)
            m.session.commit()
            session['user_id'] = user.user_id
        if error:
            return render_template('register.html',error = error)
        else:
            return redirect(request.referrer)
    if g.user:
        return redirect(url_for('main.index'))
    return render_template('register.html',error = error)