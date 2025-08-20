from django.db import migrations

def create_lockers(apps, schema_editor):
    Locker = apps.get_model("lockers", "Locker")
    for i in range(1, 51):
        Locker.objects.get_or_create(
            locker_number=f"LCKR-{i:03}",   # ✅ correct field
            defaults={"is_available": True}
        )


class Migration(migrations.Migration):

    dependencies = [
        ('lockers', '0001_initial'),  # adjust if your first migration is different
    ]

    operations = [
        migrations.RunPython(create_lockers),
    ]

