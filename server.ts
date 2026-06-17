import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const cacheFilePath = path.join(process.cwd(), '.data_senhas.json');

  // Simple in-memory global queue state with persistent write
  let senhasData: any[] = [];
  try {
    if (fs.existsSync(cacheFilePath)) {
      const content = fs.readFileSync(cacheFilePath, 'utf8');
      senhasData = JSON.parse(content);
      console.log(`Loaded ${senhasData.length} tickets from cache file.`);
    }
  } catch (e) {
    console.warn('Error loading cached senhas:', e);
  }

  // API to get current queue state
  app.get('/api/senhas', (req, res) => {
    res.json({ senhas: senhasData });
  });

  // API to send a beautifully formatted email reminder to a worker
  app.post('/api/send-reminder-email', (req, res) => {
    const { email, workerName, subject, items } = req.body;
    if (!email || !workerName) {
      return res.status(400).json({ error: 'Email e nome do tarefeiro são obrigatórios' });
    }

    const reminders = items || [];
    const timestamp = new Date().toLocaleString('pt-BR');

    // Render a high-quality HTML email simulation template
    const emailHtml = `
      <div style="font-family: sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 22px;">Fraternidade Espírita Amor e Luz</h1>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">PORTAL SGFCe • COMPROMISSOS DE TAREFEIROS</p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6;">Olá, <strong>${workerName}</strong> !</p>
        <p style="font-size: 14px; line-height: 1.6;">Este é um <strong>alerta automático</strong> configurado no sistema sobre os seus compromissos e prazos de atendimentos agendados:</p>
        
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; font-size: 15px;">🔔 Seus Lembretes Coletados:</h3>
          ${reminders.length === 0 ? `
            <p style="font-size: 13px; color: #64748b; margin: 0; font-style: italic;">Nenhum evento ou atendimento fora do prazo cadastrado para você neste momento.</p>
          ` : `
            <ul style="padding-left: 20px; margin: 0; font-size: 13px; line-height: 1.8;">
              ${reminders.map((r: any) => `
                <li style="margin-bottom: 10px;">
                  <strong style="color: ${r.type === 'atendimento' ? '#e11d48' : '#2563eb'}">[${r.category}]</strong> 
                  ${r.title}
                  ${r.time ? `<br/><span style="color: #64748b; font-size: 11px;">⏰ Horário: ${r.time}</span>` : ''}
                  ${r.location ? `<br/><span style="color: #64748b; font-size: 11px;">📍 Local: ${r.location}</span>` : ''}
                </li>
              `).join('')}
            </ul>
          `}
        </div>

        <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Este e-mail é disparado através do servidor de mensageria SGFCe em tempo real.<br/>
          Enviado em: ${timestamp} • Configuração de Envio: Simulação Local SMTP Ativa.
        </p>
      </div>
    `;

    console.log(`[EMAIL SEND SIMULATION] Sent to "${workerName}" <${email}> with subject "${subject || 'Lembrete de Atividades'}".`);
    
    return res.json({
      success: true,
      sender: 'mensageria@fraternidade.org',
      recipient: email,
      subject: subject || 'Alerta de Lembretes Automáticos de Tarefeiro',
      timestamp,
      bodyPreviewHtml: emailHtml
    });
  });

  // API to update queue state
  app.post('/api/senhas', (req, res) => {
    const data = req.body;
    if (Array.isArray(data)) {
      senhasData = data;
      try {
        fs.writeFileSync(cacheFilePath, JSON.stringify(senhasData), 'utf8');
      } catch (e) {
        console.warn('Error saving cached senhas:', e);
      }
      res.json({ success: true, count: senhasData.length });
    } else {
      res.status(400).json({ error: 'Data must be an array of tickets' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
