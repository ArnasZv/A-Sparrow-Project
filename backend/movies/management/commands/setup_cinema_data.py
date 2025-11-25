from django.core.management.base import BaseCommand
from movies.models import Cinema, Screen, Seat, Showtime, Movie
from datetime import datetime, timedelta
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Automatically setup cinemas, screens, seats, and showtimes'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--cinemas',
            type=int,
            default=3,
            help='Number of cinemas to create'
        )
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days to create showtimes for'
        )
    
    def handle(self, *args, **options):
        num_cinemas = options['cinemas']
        num_days = options['days']
        
        self.stdout.write(self.style.SUCCESS('Starting cinema setup...'))
        
        # Cinema data for Ireland
        cinema_data = [
            {'name': 'Omniplex', 'location': 'Dublin - Rathmines', 'address': 'Rathmines Road, Dublin 6', 'is_maxx': True},
            {'name': 'Omniplex', 'location': 'Galway - Salthill', 'address': 'Salthill, Galway', 'is_dluxx': True},
            {'name': 'Omniplex', 'location': 'Cork', 'address': 'Merchant\'s Quay, Cork', 'is_maxx': True},
            {'name': 'Omniplex', 'location': 'Limerick', 'address': 'Cruises Street, Limerick', 'is_maxx': False},
            {'name': 'Omniplex', 'location': 'Sligo', 'address': 'Wine Street, Sligo', 'is_maxx': True},
        ]
        
        cinemas_created = 0
        screens_created = 0
        seats_created = 0
        
        for i in range(min(num_cinemas, len(cinema_data))):
            cinema_info = cinema_data[i]
            
            # Check if cinema already exists
            cinema, created = Cinema.objects.get_or_create(
                name=cinema_info['name'],
                location=cinema_info['location'],
                defaults={
                    'address': cinema_info['address'],
                    'phone': f'01-{random.randint(1000000, 9999999)}',
                    'is_maxx': cinema_info.get('is_maxx', False),
                    'is_dluxx': cinema_info.get('is_dluxx', False),
                }
            )
            
            if created:
                cinemas_created += 1
                self.stdout.write(f'Created cinema: {cinema.name} - {cinema.location}')
            else:
                self.stdout.write(f'Cinema already exists: {cinema.name} - {cinema.location}')
            
            # Create screens for this cinema
            screen_configs = [
                {'name': 'Screen 1', 'type': 'MAXX', 'rows': 12, 'seats_per_row': 16},
                {'name': 'Screen 2', 'type': 'STANDARD', 'rows': 10, 'seats_per_row': 14},
                {'name': 'Screen 3', 'type': 'DLUXX', 'rows': 8, 'seats_per_row': 12},
                {'name': 'Screen 4', 'type': 'RECLINE', 'rows': 6, 'seats_per_row': 10},
                {'name': 'Screen 5', 'type': 'STANDARD', 'rows': 10, 'seats_per_row': 15},
            ]
            
            for screen_info in screen_configs[:3]:  # Create 3 screens per cinema
                screen, screen_created = Screen.objects.get_or_create(
                    cinema=cinema,
                    name=screen_info['name'],
                    defaults={
                        'screen_type': screen_info['type'],
                        'total_seats': screen_info['rows'] * screen_info['seats_per_row'],
                        'rows': screen_info['rows'],
                        'seats_per_row': screen_info['seats_per_row'],
                    }
                )
                
                if screen_created:
                    screens_created += 1
                    self.stdout.write(f'  Created {screen.name} ({screen.screen_type})')
                    
                    # Create seats for this screen
                    if not Seat.objects.filter(screen=screen).exists():
                        seats_to_create = []
                        rows = screen_info['rows']
                        seats_per_row = screen_info['seats_per_row']
                        
                        for row_num in range(rows):
                            row_letter = chr(65 + row_num)  # A, B, C, etc.
                            
                            for seat_num in range(1, seats_per_row + 1):
                                # Determine seat type
                                if row_num >= rows - 2 and screen_info['type'] in ['DLUXX', 'RECLINE']:
                                    seat_type = 'VIP'
                                elif seat_num in [1, seats_per_row] and row_num == 0:
                                    seat_type = 'WHEELCHAIR'
                                elif screen_info['type'] == 'RECLINE':
                                    seat_type = 'RECLINE'
                                else:
                                    seat_type = 'STANDARD'
                                
                                seats_to_create.append(
                                    Seat(
                                    screen=screen,
                                    row=row_letter,
                                    number=seat_num,
                                    seat_type=seat_type
                                    )
                                )
                        
                        Seat.objects.bulk_create(seats_to_create)
                        seats_created += len(seats_to_create)
                        self.stdout.write(f'    Created {len(seats_to_create)} seats')
        
        self.stdout.write(self.style.SUCCESS(
            f'\nCinema setup complete!\n'
            f'Cinemas created: {cinemas_created}\n'
            f'Screens created: {screens_created}\n'
            f'Seats created: {seats_created}'
        ))
        
        # Now create showtimes
        self.stdout.write(self.style.SUCCESS('\nCreating showtimes...'))
        showtimes_created = self.create_showtimes(num_days)
        
        self.stdout.write(self.style.SUCCESS(
            f'Showtimes created: {showtimes_created}\n'
            f'Setup complete! 🎬'
        ))
    
    def create_showtimes(self, num_days):
        """Create showtimes for all movies across all screens"""
        movies = Movie.objects.all()
        screens = Screen.objects.all()
        
        if not movies.exists():
            self.stdout.write(self.style.WARNING('No movies found. Please import movies first.'))
            return 0
        
        if not screens.exists():
            self.stdout.write(self.style.WARNING('No screens found.'))
            return 0
        
        showtimes_created = 0
        base_prices = {
            'STANDARD': 10.50,
            'MAXX': 13.50,
            'DLUXX': 15.00,
            'RECLINE': 12.50,
            'LUX': 18.00,
        }
        
        # Showtime slots (hours)
        time_slots = [11, 14, 17, 20, 21, 22]
        
        for day in range(num_days):
            show_date = timezone.now() + timedelta(days=day)
            
            # Select random movies for this day (3-5 movies per screen)
            for screen in screens:
                daily_movies = random.sample(list(movies), min(4, movies.count()))
                
                for movie in daily_movies:
                    # Random time slots for this movie (1-2 showtimes per day)
                    movie_slots = random.sample(time_slots, random.randint(1, 2))
                    
                    for hour in movie_slots:
                        show_time = show_date.replace(
                            hour=hour,
                            minute=random.choice([0, 15, 30, 45]),
                            second=0,
                            microsecond=0
                        )
                        
                        # Check if showtime already exists
                        if not Showtime.objects.filter(
                            screen=screen,
                            start_time=show_time
                        ).exists():
                            
                            base_price = base_prices.get(screen.screen_type, 10.50)
                            is_3d = movie.is_3d and random.choice([True, False])
                            
                            if is_3d:
                                base_price += 2.00
                            
                            # Weekend surcharge
                            if show_date.weekday() >= 5:  # Saturday or Sunday
                                base_price += 1.50
                            
                            Showtime.objects.create(
                                movie=movie,
                                screen=screen,
                                start_time=show_time,
                                base_price=base_price,
                                is_3d=is_3d
                            )
                            showtimes_created += 1
        
        return showtimes_created