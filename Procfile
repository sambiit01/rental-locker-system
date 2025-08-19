web: bash -c "python manage.py collectstatic --noinput && python manage.py migrate && gunicorn locker_system.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --threads 2 --timeout 60"

