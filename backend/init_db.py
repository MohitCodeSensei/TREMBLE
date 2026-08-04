import os
from db import init_tables, is_postgres

def init_mysql():
    import mysql.connector
    from mysql.connector import errorcode

    DB_NAME = os.getenv("DB_NAME", "tremble_db")
    host = os.getenv("DB_HOST", "127.0.0.1")
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASSWORD", "")

    TABLES = {}
    TABLES['users'] = (
        "CREATE TABLE IF NOT EXISTS `users` ("
        "  `id` int(11) NOT NULL AUTO_INCREMENT,"
        "  `username` varchar(255) NOT NULL,"
        "  `email` varchar(255) DEFAULT NULL,"
        "  `password` varchar(255) NOT NULL,"
        "  `profile_picture_url` text DEFAULT NULL,"
        "  PRIMARY KEY (`id`),"
        "  UNIQUE KEY `username` (`username`),"
        "  UNIQUE KEY `email` (`email`)"
        ") ENGINE=InnoDB"
    )

    TABLES['liked_songs'] = (
        "CREATE TABLE IF NOT EXISTS `liked_songs` ("
        "  `id` int(11) NOT NULL AUTO_INCREMENT,"
        "  `user_id` int(11) NOT NULL,"
        "  `track_id` varchar(255) NOT NULL,"
        "  `track_data` json NOT NULL,"
        "  PRIMARY KEY (`id`),"
        "  UNIQUE KEY `user_track_unique` (`user_id`, `track_id`),"
        "  CONSTRAINT `liked_songs_ibfk_1` FOREIGN KEY (`user_id`) "
        "     REFERENCES `users` (`id`) ON DELETE CASCADE"
        ") ENGINE=InnoDB"
    )

    TABLES['listening_history'] = (
        "CREATE TABLE IF NOT EXISTS `listening_history` ("
        "  `id` int(11) NOT NULL AUTO_INCREMENT,"
        "  `user_id` int(11) NOT NULL,"
        "  `track_id` varchar(255) NOT NULL,"
        "  `track_data` json NOT NULL,"
        "  `play_count` int(11) DEFAULT 1,"
        "  `listened_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
        "  PRIMARY KEY (`id`),"
        "  CONSTRAINT `history_ibfk_1` FOREIGN KEY (`user_id`) "
        "     REFERENCES `users` (`id`) ON DELETE CASCADE"
        ") ENGINE=InnoDB"
    )

    TABLES['user_playlists'] = (
        "CREATE TABLE IF NOT EXISTS `user_playlists` ("
        "  `id` int(11) NOT NULL AUTO_INCREMENT,"
        "  `user_id` int(11) NOT NULL,"
        "  `title` varchar(255) NOT NULL,"
        "  `tracks` json NOT NULL,"
        "  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
        "  PRIMARY KEY (`id`),"
        "  CONSTRAINT `playlists_ibfk_1` FOREIGN KEY (`user_id`) "
        "     REFERENCES `users` (`id`) ON DELETE CASCADE"
        ") ENGINE=InnoDB"
    )

    try:
        cnx = mysql.connector.connect(host=host, user=user, password=password)
        cursor = cnx.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} DEFAULT CHARACTER SET 'utf8'")
        cursor.execute(f"USE {DB_NAME}")
        for table_name in TABLES:
            cursor.execute(TABLES[table_name])
            print(f"Table {table_name}: OK")
        cursor.close()
        cnx.close()
        print("MySQL Database initialization completed successfully.")
    except Exception as err:
        print(f"Error connecting to MySQL: {err}")

def main():
    if is_postgres():
        print("Initializing Supabase / PostgreSQL tables...")
        init_tables()
        print("Supabase / PostgreSQL tables initialized successfully.")
    else:
        print("Initializing MySQL tables...")
        init_mysql()

if __name__ == '__main__':
    main()
