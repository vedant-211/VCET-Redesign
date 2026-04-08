const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

// Serve the modified HTML dynamically
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'vcet-redesign.html');
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading HTML file: ${err.message}`);
      return res.status(500).send('Error reading HTML file');
    }
    // Inject the frontend integration script right before </body>
    const injection = `<script src="/js/frontend-integration.js"></script>`;
    const modifiedHtml = data.replace('</body>', injection + '\n</body>');
    res.send(modifiedHtml);
  });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`❌ Undersired Error: ${err.stack}`);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const startServer = async () => {
    try {
        console.log('🚀 Starting VCET Backend...');
        
        // 1. Connect to Database
        await connectDB();
        
        // 2. Start Listening
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🔗 Local URL: http://localhost:${PORT}`);
        });

        // Handle server closing gracefully
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // In production, you might want to restart gracefully
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    console.error(error.stack);
    process.exit(1);
});

startServer();
