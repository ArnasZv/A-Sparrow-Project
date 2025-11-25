import requests
from decouple import config
from datetime import datetime

class TMDBService:
    BASE_URL = "https://api.themoviedb.org/3"
    IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original"
    
    def __init__(self):
        self.api_key = config('TMDB_API_KEY', default='')
        self.headers = {
            'Authorization': f'Bearer {config("TMDB_ACCESS_TOKEN", default="")}',
            'Content-Type': 'application/json;charset=utf-8'
        }
    
    def get_now_playing(self, page=1):
        url = f"{self.BASE_URL}/movie/now_playing"
        params = {'api_key': self.api_key, 'page': page, 'region': 'IE'}
        response = requests.get(url, params=params, headers=self.headers)
        return response.json() if response.status_code == 200 else None
    
    def get_upcoming(self, page=1):
        url = f"{self.BASE_URL}/movie/upcoming"
        params = {'api_key': self.api_key, 'page': page, 'region': 'IE'}
        response = requests.get(url, params=params, headers=self.headers)
        return response.json() if response.status_code == 200 else None
    
    def get_movie_details(self, tmdb_id):
        url = f"{self.BASE_URL}/movie/{tmdb_id}"
        params = {'api_key': self.api_key, 'append_to_response': 'credits,videos,release_dates'}
        response = requests.get(url, params=params, headers=self.headers)
        return response.json() if response.status_code == 200 else None
    
    def get_poster_url(self, poster_path):
        if poster_path:
            return f"{self.IMAGE_BASE_URL}{poster_path}"
        return None
    
    def get_backdrop_url(self, backdrop_path):
        if backdrop_path:
            return f"{self.IMAGE_BASE_URL}{backdrop_path}"
        return None
    
    def download_image(self, image_url):
        if not image_url:
            return None
        response = requests.get(image_url)
        return response.content if response.status_code == 200 else None
    
    def get_certification(self, release_dates):
        if not release_dates:
            return 'PG'
        for country_data in release_dates.get('results', []):
            if country_data.get('iso_3166_1') in ['IE', 'GB', 'US']:
                release_dates_list = country_data.get('release_dates', [])
                for release in release_dates_list:
                    cert = release.get('certification', '')
                    if cert:
                        return cert
        return 'PG'
