import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Hooky Backend',
        timestamp: new Date().toISOString()
    });
});

export default router;
