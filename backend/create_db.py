import asyncio
import asyncpg

async def create_db():
    try:
        # Connect to the default 'postgres' database
        conn = await asyncpg.connect(user='postgres', password='postgres', host='localhost', database='postgres')
        try:
            # Create the 'auraplan' database
            # Note: CREATE DATABASE cannot be run inside a transaction block in some drivers, 
            # but asyncpg allows it if not explicitly in a transaction.
            await conn.execute('CREATE DATABASE auraplan')
            print("Database 'auraplan' created successfully.")
        except asyncpg.exceptions.DuplicateDatabaseError:
            print("Database 'auraplan' already exists.")
        except Exception as e:
            print(f"Error creating database: {e}")
        finally:
            await conn.close()
    except Exception as e:
        print(f"Failed to connect to Postgres: {e}")

if __name__ == "__main__":
    asyncio.run(create_db())
