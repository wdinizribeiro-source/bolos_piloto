import rateLimit from 'express-rate-limit';

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // janela de 15 minutos
    max: 5,                    // no máximo 5 tentativas por IP nessa janela
    standardHeaders: true,     // manda info do limite nos headers da resposta (RateLimit-*)
    legacyHeaders: false,      // desliga os headers antigos (X-RateLimit-*), não precisamos dos dois
    message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' }
});

export default loginRateLimiter;