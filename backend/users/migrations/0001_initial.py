

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('movies', '0002_movie_tmdb_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('date_of_birth', models.DateField(blank=True, null=True)),
                ('receive_promotions', models.BooleanField(default=True)),
                ('preferred_cinema', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='movies.cinema')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='MyOmniPass',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tier', models.CharField(choices=[('FREE', 'Free MyOmni'), ('STANDARD', 'MyOmniPass'), ('GOLD', 'MyOmniPass Gold')], default='FREE', max_length=20)),
                ('monthly_fee', models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ('is_active', models.BooleanField(default=False)),
                ('subscription_start', models.DateField(blank=True, null=True)),
                ('subscription_end', models.DateField(blank=True, null=True)),
                ('auto_renew', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='omnipass', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
