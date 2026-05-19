import asyncio
import sqlalchemy
from sqlalchemy.ext.asyncio import create_async_engine

async def test():
    try:
        engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/auraplan')
        async with engine.connect() as conn:
            await conn.execute(sqlalchemy.text('SELECT 1'))
        print('DB OK')
    except Exception as e:
        print(f'DB ERR: {e}')

if __name__ == "__main__":
    asyncio.run(test())
