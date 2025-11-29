

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0002_movie_tmdb_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='movie',
            name='poster_image',
            field=models.ImageField(blank=True, null=True, upload_to='movie_posters/'),
        ),
    ]
