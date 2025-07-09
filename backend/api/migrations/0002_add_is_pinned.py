# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='block',
            name='is_pinned',
            field=models.BooleanField(default=False),
        ),
    ] 