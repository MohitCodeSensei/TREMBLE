import mysql.connector
from mysql.connector import errorcode

DB_NAME = 'tremble_db'

TABLES = {}
TABLES['users'] = (
    "CREATE TABLE IF NOT EXISTS `users` ("
    "  `id` int(11) NOT NULL AUTO_INCREMENT,"
    "  `username` varchar(255) NOT NULL,"
    "  `email` varchar(255) DEFAULT NULL,"
    "  `password` varchar(255) NOT NULL,"
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

def create_database(cursor):
    try:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} DEFAULT CHARACTER SET 'utf8'")
    except mysql.connector.Error as err:
        print(f"Failed creating database: {err}")
        exit(1)

def main():
    try:
        cnx = mysql.connector.connect(host='localhost', user='root', password='')
        cursor = cnx.cursor()
        create_database(cursor)
        print(f"Database '{DB_NAME}' ready.")
        cursor.execute(f"USE {DB_NAME}")
        
        for table_name in TABLES:
            table_description = TABLES[table_name]
            try:
                print(f"Creating table {table_name}: ", end='')
                cursor.execute(table_description)
                print("OK")
            except mysql.connector.Error as err:
                if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
                    print("already exists.")
                else:
                    print(err.msg)
                    
        cursor.close()
        cnx.close()
        print("Database initialization completed successfully.")
        
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        exit(1)

if __name__ == '__main__':
    main()
