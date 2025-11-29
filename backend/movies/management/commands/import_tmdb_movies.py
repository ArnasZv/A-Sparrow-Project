from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from movies.models import Movie
from movies.tmdb_service import TMDBService
from datetime import datetime
import time


class Command(BaseCommand):
    help = 'Import movies from TMDB API'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            default='now_playing',
            help='Type of movies to import: now_playing or upcoming'
        )
        parser.add_argument(
            '--pages',
            type=int,
            default=1,
            help='Number of pages to import'
        )
    
    def handle(self, *args, **options):
        tmdb = TMDBService()
        movie_type = options['type']
        pages = options['pages']
        
        self.stdout.write(self.style.SUCCESS(f'Starting import of {movie_type} movies...'))
        
        imported_count = 0
        skipped_count = 0
        
        for page in range(1, pages + 1):
            self.stdout.write(f'Fetching page {page}...')
            
            if movie_type == 'now_playing':
                data = tmdb.get_now_playing(page)
            else:
                data = tmdb.get_upcoming(page)
            
            if not data or 'results' not in data:
                self.stdout.write(self.style.ERROR('Failed to fetch movies'))
                continue
            
            for movie_data in data['results']:
                tmdb_id = movie_data['id']
                
                if Movie.objects.filter(title=movie_data['title']).exists():
                    skipped_count += 1
                    continue
                
                details = tmdb.get_movie_details(tmdb_id)
                if not details:
                    continue
                
                self.stdout.write(f'Importing: {movie_data["title"]}')
                
                try:
                    rating_map = {
                        'G': 'G', 'PG': 'PG', 'PG-13': '12A',
                        '12A': '12A', '15': '15A', 'R': '18', 'NC-17': '18'
                    }
                    
                    certification = tmdb.get_certification(details.get('release_dates', {}))
                    rating = rating_map.get(certification, 'PG')
                    
                    credits = details.get('credits', {})
                    director = next(
                        (crew['name'] for crew in credits.get('crew', []) if crew['job'] == 'Director'),
                        'Unknown'
                    )
                    cast = ', '.join([actor['name'] for actor in credits.get('cast', [])[:5]])
                    
                    genres = details.get('genres', [])
                    genre = genres[0]['name'] if genres else 'Drama'
                    
                    videos = details.get('videos', {}).get('results', [])
                    trailer_url = f"https://www.youtube.com/watch?v={videos[0]['key']}" if videos else ''
                    
                    movie = Movie(
                        title=movie_data['title'],
                        description=movie_data.get('overview', 'No description available'),
                        duration=details.get('runtime', 120),
                        rating=rating,
                        genre=genre,
                        release_date=datetime.strptime(movie_data['release_date'], '%Y-%m-%d').date() if movie_data.get('release_date') else datetime.now().date(),
                        director=director,
                        cast=cast,
                        is_3d=False,
                        is_imax=False,
                        is_featured=movie_data.get('vote_average', 0) > 7.5,
                        trailer_url=trailer_url,
                        tmdb_id=tmdb_id
                    )
                    
                    poster_url = tmdb.get_poster_url(movie_data.get('poster_path'))
                    if poster_url:
                        poster_content = tmdb.download_image(poster_url)
                        if poster_content:
                            movie.poster_image.save(
                                f"{tmdb_id}_poster.jpg",
                                ContentFile(poster_content),
                                save=False
                            )
                    
                    backdrop_url = tmdb.get_backdrop_url(movie_data.get('backdrop_path'))
                    if backdrop_url:
                        backdrop_content = tmdb.download_image(backdrop_url)
                        if backdrop_content:
                            movie.banner_image.save(
                                f"{tmdb_id}_banner.jpg",
                                ContentFile(backdrop_content),
                                save=False
                            )
                    
                    movie.save()
                    imported_count += 1
                    time.sleep(0.25)
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
                    continue
            
            self.stdout.write(self.style.SUCCESS(f'Page {page} complete'))
        
        self.stdout.write(self.style.SUCCESS(
            f'\nImport complete!\nImported: {imported_count} movies\nSkipped: {skipped_count} movies'
        ))