import os
from pathlib import Path

from dotenv import load_dotenv
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

pool = ConnectionPool(
    conninfo=os.environ["DB_URL"],
    kwargs={
        "user": os.environ["DB_USER"],
        "password": os.environ["DB_PASSWORD"],
        "row_factory": dict_row,  # rows come back as dicts
    },
    min_size=1,
    max_size=10,
    open=False,  # opened at fastAPI start
)


def get_conn():
    with pool.connection() as conn:
        yield conn
