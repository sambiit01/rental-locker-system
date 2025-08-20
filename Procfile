web: bash -c "python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn locker_system.wsgi:application"

