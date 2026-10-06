import os
import requests
from bs4 import BeautifulSoup
import psycopg
import time
from urllib.parse import urljoin
from dotenv import load_dotenv

POLICE_BASE_URL = "https://polisen.se"

def scrape_police_event(url, db_connection):
    headers = {
        'User-Agent': 'CrimeRadarSweden/1.0'
    }
    
    target_url = urljoin(POLICE_BASE_URL, url)
    
    try:
        response = requests.get(target_url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise error for bad status codes
    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch {target_url}: {e}")
        return False

    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Extract Data using HTML Tags 
    # Title
    title_tag = soup.find('h1')
    title = title_tag.get_text(strip=True) if title_tag else "No title"
    
    # Short Description (Preamble)
    preamble_tag = soup.find('div', class_='preamble') or soup.find('p', class_='preamble')
    short_description = preamble_tag.get_text(strip=True) if preamble_tag else None
    
    # Main Description
    # We look for the main content body and extract text with newlines,
    # removing any nested preamble or metadata lines to prevent duplicate text
    body_tag = soup.find('div', class_='text-body') or soup.find('div', class_='editorial-html')
    if body_tag:
        body_copy = BeautifulSoup(str(body_tag), 'html.parser')
        for p in body_copy.find_all(class_='preamble'):
            p.decompose()
        for el in body_copy.find_all(['p', 'span']):
            el_text = el.get_text(strip=True)
            if any(el_text.startswith(prefix) for prefix in ('Text av', 'Publicerad', 'Uppdaterad')):
                el.decompose()
        description = body_copy.get_text(separator='\n', strip=True) or None
    else:
        description = None
    
    # Metadata (Text by, Published, Updated)
    text_by = None
    published_text = None
    updated_text = None
    
    # Look for metadata text patterns only in leaf elements to prevent matching parent wrappers
    for element in soup.find_all(['p', 'span', 'strong']):
        if element.find(['p', 'div']):
            continue
        text = element.get_text(strip=True)
        if text.startswith('Text av') and not text_by:
            text_by = text
        elif text.startswith('Publicerad') and not published_text:
            published_text = text
        elif text.startswith('Uppdaterad') and not updated_text:
            updated_text = text

    # Using ON CONFLICT DO UPDATE to ensure idempotency (updates existing rows)
    query = """
        INSERT INTO police_event_details 
        (url, title, short_description, description, text_by, published_text, updated_text)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (url) DO UPDATE SET 
            title = EXCLUDED.title,
            short_description = EXCLUDED.short_description,
            description = EXCLUDED.description,
            text_by = EXCLUDED.text_by,
            published_text = EXCLUDED.published_text,
            updated_text = EXCLUDED.updated_text,
            updated_at = CURRENT_TIMESTAMP;
    """
    
    try:
        with db_connection.cursor() as cursor:
            cursor.execute(query, (url, title, short_description, description, text_by, published_text, updated_text))
        db_connection.commit()
        print(f"Successfully saved: {title}")
        return True
    except psycopg.Error as e:
        db_connection.rollback()
        print(f"Database error on {url}: {e}")
        return False

def get_recent_police_event_urls(db_connection, limit=20):
    query = "SELECT url FROM police_events ORDER BY datetime DESC LIMIT %s;"
    with db_connection.cursor() as cursor:
        cursor.execute(query, (limit,))
        return [row[0] for row in cursor.fetchall()]

# --- Example Usage ---
if __name__ == "__main__":
    load_dotenv()
    database_url = os.getenv("DB_URL")
    
    # Connect to PostgreSQL database using context manager
    with psycopg.connect(database_url) as conn:
        urls = get_recent_police_event_urls(conn, limit=20)
        for url in urls:
            success = scrape_police_event(url, conn)
            # Sleep to limit request rate if a request was successfully made
            if success:
                time.sleep(10)
            else:
                time.sleep(1)

        print("Finished scraping police event details.")