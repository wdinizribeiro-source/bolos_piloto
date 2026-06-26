import mysql from 'mysql2/promise';

// Configurações do banco extraídas do .env
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Máximo de conexões simultâneas prontas para uso
    queueLimit: 0
};

// Cria o pool de conexões
const pool = mysql.createPool(dbConfig);

// Exporta o pool para que os Models possam usá-lo
export default pool;
