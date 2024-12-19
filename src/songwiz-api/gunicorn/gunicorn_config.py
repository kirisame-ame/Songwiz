import os



workers = 4

worker_class = 'gevent'

threads = 8

timeout = 600

bind = os.environ.get('GUNICORN_BIND', '0.0.0.0:5000')

forwarded_allow_ips = '*'

secure_scheme_headers = { 'X-Forwarded-Proto': 'https' }

accesslog = '-'
errorlog = '-'
loglevel = 'debug'
