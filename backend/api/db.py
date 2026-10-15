import os
from pathlib import Path

from dotenv import load_dotenv
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
load_dotenv()

pool_kwargs = {
    "row_factory": dict_row,  # rows come back as dicts
}
if "DB_USER" in os.environ and os.environ["DB_USER"]:
    pool_kwargs["user"] = os.environ["DB_USER"]
if "DB_PASSWORD" in os.environ and os.environ["DB_PASSWORD"]:
    pool_kwargs["password"] = os.environ["DB_PASSWORD"]

pool = ConnectionPool(
    conninfo=os.getenv("DB_URL", ""),
    kwargs=pool_kwargs,
    min_size=1,
    max_size=10,
    open=False,  # opened at fastAPI start
)


def get_conn():
    with pool.connection() as conn:
        yield conn
